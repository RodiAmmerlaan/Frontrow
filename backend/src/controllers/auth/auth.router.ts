import { Router } from 'express';
import { login } from './login.controller';
import { refreshController } from './refresh.controller';
import { logoutController } from './logout.controller';
import { registrationController } from './registration.controller';
import { getProfileController } from './profile.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest, ValidationSchemas } from '../../middleware/validation.middleware';
import Joi from 'joi';

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  first_name: Joi.string().min(1).max(50).required(),
  last_name: Joi.string().min(1).max(50).required(),
  street: Joi.string().min(1).max(100).required(),
  house_number: Joi.string().min(1).max(10).required(),
  postal_code: Joi.string().min(1).max(10).required(),
  city: Joi.string().min(1).max(50).required()
});

export const authRouter = Router();

authRouter.post('/login', validateRequest(loginSchema, { source: 'body', sanitize: true }), login);
authRouter.post('/refresh', refreshController);
authRouter.post('/logout', logoutController);
authRouter.post('/register', validateRequest(registrationSchema, { source: 'body', sanitize: true }), registrationController);
authRouter.get('/profile', authenticate, getProfileController);