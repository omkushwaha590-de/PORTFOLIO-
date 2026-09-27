import { Router } from 'express';
import { login, logout, me, updateEmail, updatePassword } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { loginLimiter } from '../middleware/rate-limit';
import { validate } from '../middleware/validate';
import { changeEmailBody, changePasswordBody, loginBody } from '../validators/auth.schema';

export const authRouter = Router();

authRouter.post('/login', loginLimiter, validate({ body: loginBody }), login);
authRouter.post('/logout', logout);
authRouter.get('/me', requireAuth, me);
authRouter.post('/change-email', requireAuth, loginLimiter, validate({ body: changeEmailBody }), updateEmail);
authRouter.post('/change-password', requireAuth, loginLimiter, validate({ body: changePasswordBody }), updatePassword);
