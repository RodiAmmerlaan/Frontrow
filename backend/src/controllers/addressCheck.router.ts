import { Router } from 'express';
import { addressCheck } from './addressCheck.controller';
import { validateRequest } from '../middleware/validation.middleware';
import Joi from 'joi';

const addressCheckSchema = Joi.object({
  postalCode: Joi.string().required(),
  houseNumber: Joi.string().required()
});

export const addressCheckRouter = Router();

addressCheckRouter.get('/', 
  validateRequest(addressCheckSchema, { source: 'query', sanitize: true }),
  addressCheck
);