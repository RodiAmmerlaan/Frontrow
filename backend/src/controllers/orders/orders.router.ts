import { Router } from 'express';
import { buyTickets } from './buyTickets.controller';
import { getOrderById } from './getOrderById.controller';
import { getUserOrders } from './getUserOrders.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest, ValidationSchemas } from '../../middleware/validation.middleware';
import Joi from 'joi';

const orderIdSchema = Joi.object({
  orderId: ValidationSchemas.uuid().required()
});

const userIdSchema = Joi.object({
  userId: ValidationSchemas.uuid().required()
});

const buyTicketsSchema = Joi.object({
  event_id: ValidationSchemas.uuid().required(),
  user_id: ValidationSchemas.uuid().required(),
  total_amount: Joi.number().min(1).required()
});

export const ordersRouter = Router();

ordersRouter.post("/buy-tickets", 
  authenticate,
  validateRequest(buyTicketsSchema, { source: 'body', sanitize: true }),
  buyTickets
);

ordersRouter.get("/:orderId", 
  authenticate,
  validateRequest(orderIdSchema, { source: 'params', sanitize: true }),
  getOrderById
);

ordersRouter.get("/user/:userId", 
  authenticate,
  validateRequest(userIdSchema, { source: 'params', sanitize: true }),
  getUserOrders
);