import { RequestHandler } from 'express';
import prisma from '../config/db';
import { MercadoPagoConfig, Payment } from 'mercadopago';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-8291404179313589-041802-bd9ac6e83d81b4f4c22fbca131f422b4-177303023' });
const paymentClient = new Payment(client);

export const handleMercadoPagoWebhook: RequestHandler = async (req, res) => {
  try {
    const { action, type, data } = req.body;
    
    // MP sends different formats depending on if it's an IPN or Webhook.
    // For Webhook, event type is usually 'payment'
    if (type === 'payment' || req.body.topic === 'payment') {
      const paymentId = data?.id || req.body.resource?.split('/').pop();
      if (!paymentId) {
        res.status(400).send('Missing payment ID');
        return;
      }

      // Fetch payment from MP API
      const paymentInfo = await paymentClient.get({ id: paymentId });
      
      const externalReference = paymentInfo.external_reference;
      if (!externalReference) {
        res.status(200).send('No external reference mapped');
        return;
      }

      const transaction = await prisma.transaction.findUnique({
        where: { id: externalReference }
      });

      if (!transaction) {
        res.status(404).send('Transaction not found');
        return;
      }

      // Idempotency: if already APPROVED, ignore
      if (transaction.status === 'APPROVED') {
        res.status(200).send('Already processed');
        return;
      }

      if (paymentInfo.status === 'approved') {
        // Activate Subscription
        const providerProfile = await prisma.providerprofile.findUnique({
          where: { id: transaction.providerId },
          include: { subscription: true }
        });

        if (!providerProfile) {
          res.status(404).send('Provider not found');
          return;
        }

        const existingSub = providerProfile.subscription;
        const now = new Date();
        let newExpiresAt = new Date();

        // Extender suscripción si sigue activa
        if (
          existingSub &&
          existingSub.status === 'ACTIVE' &&
          existingSub.expiresAt > now
        ) {
          newExpiresAt = new Date(existingSub.expiresAt);
        }

        let monthsToAdd = 1;
        if (transaction.planType === 'QUARTERLY') monthsToAdd = 3;
        if (transaction.planType === 'SEMESTER') monthsToAdd = 6;
        if (transaction.planType === 'YEARLY') monthsToAdd = 12;

        newExpiresAt.setMonth(newExpiresAt.getMonth() + monthsToAdd);

        if (existingSub) {
          await prisma.subscription.update({
            where: { id: existingSub.id },
            data: {
              planType: transaction.planType,
              status: 'ACTIVE',
              expiresAt: newExpiresAt,
              updatedAt: new Date(),
              ...(transaction.collaboratorId && !existingSub.collaboratorId && { collaboratorId: transaction.collaboratorId })
            }
          });
        } else {
          await prisma.subscription.create({
            data: {
              id: generateId(),
              providerId: providerProfile.id,
              planType: transaction.planType,
              status: 'ACTIVE',
              expiresAt: newExpiresAt,
              collaboratorId: transaction.collaboratorId || null,
              updatedAt: new Date()
            }
          });
        }

        // Marcar transacción como APPROVED
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { 
            status: 'APPROVED',
            mpPaymentId: String(paymentId)
          }
        });
      } else if (paymentInfo.status === 'rejected' || paymentInfo.status === 'cancelled') {
        // Marcar como rechazada
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { 
            status: 'REJECTED',
            mpPaymentId: String(paymentId) 
          }
        });
      }

      res.status(200).send('OK');
    } else {
      res.status(200).send('Ignored event type');
    }
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Internal Server Error');
  }
};
