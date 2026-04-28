import { Router } from 'express';
import { 
  register, 
  login, 
  googleLogin,
  getMe, 
  upgradeProvider, 
  adminLogin,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword
} from '../controllers/authController';
import { authenticateJWT } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/admin-login', adminLogin);
router.post('/upgrade-provider', authenticateJWT, upgradeProvider);
router.get('/me', authenticateJWT, getMe);

// Verification and reset routes
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
