import { Request, Response } from 'express';
import prisma from '../config/db';
import { randomUUID } from 'crypto';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: { subcategory: true }
    });
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createCategoryTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const cat = await prisma.category.create({
      data: {
        id: randomUUID(),
        name: "Servicios MOCK",
        updatedAt: new Date(),
        subcategory: {
          create: [
            {
              id: randomUUID(),
              name: "Limpieza",
              updatedAt: new Date()
            },
            {
              id: randomUUID(),
              name: "Reparación",
              updatedAt: new Date()
            }
          ]
        }
      },
      include: { subcategory: true }
    });
    res.status(201).json(cat);
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
