import { Router } from 'express';
import {
  completePasswordReset,
  forgotPassword,
  login,
  logout,
  me,
  updateEmail,
  updatePassword,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { formLimiter, loginLimiter } from '../middleware/rate-limit';
import { validate } from '../middleware/validate';
import {
  changeEmailBody,
  changePasswordBody,
  forgotPasswordBody,
  loginBody,
  resetPasswordBody,
} from '../validators/auth.schema';

export const authRouter = Router();

authRouter.post('/login', loginLimiter, validate({ body: loginBody }), login);
authRouter.post('/logout', logout);
authRouter.post('/forgot-password', formLimiter, validate({ body: forgotPasswordBody }), forgotPassword);
authRouter.post('/reset-password', loginLimiter, validate({ body: resetPasswordBody }), completePasswordReset);
authRouter.get('/me', requireAuth, me);
authRouter.post('/change-email', requireAuth, loginLimiter, validate({ body: changeEmailBody }), updateEmail);
authRouter.post('/change-password', requireAuth, loginLimiter, validate({ body: changePasswordBody }), updatePassword);
