import { Router } from 'express';
import { getAllEvents } from './getAllEvents.controller';
import { getEventById } from './getEventById.controller';
import { createEvent } from './createEvent.controller';
import { getSalesOverview } from './salesOverview.controller';
import { getUserPurchaseReport } from './userPurchaseReport.controller';
import { searchEvents } from './searchEvents.controller';
import { authenticate, authorizeAdmin } from '../../middleware/auth.middleware';
import { validateRequest, ValidationSchemas } from '../../middleware/validation.middleware';
import Joi from 'joi';

const createEventSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().min(1).max(1000).required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  end_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  total_tickets: Joi.number().integer().min(1).required(),
  price: Joi.number().min(0).required()
});

const eventIdSchema = Joi.object({
  eventId: ValidationSchemas.uuid().required()
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

const searchEventsSchema = Joi.object({
  name: Joi.string().min(1).required()
});

const reportSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).optional(),
  year: Joi.number().integer().min(2000).max(2100).optional()
});

export const eventsRouter = Router();

eventsRouter.get("", 
  validateRequest(paginationSchema, { source: 'query', sanitize: true }),
  getAllEvents
);
eventsRouter.get("/search", 
  validateRequest(searchEventsSchema, { source: 'query', sanitize: true }),
  searchEvents
);
eventsRouter.post("/create", 
  authenticate, 
  authorizeAdmin, 
  validateRequest(createEventSchema, { source: 'body', sanitize: true }),
  createEvent
);
eventsRouter.get("/sales-overview", 
  authenticate, 
  authorizeAdmin,
  validateRequest(reportSchema, { source: 'query', sanitize: true }),
  getSalesOverview
);
eventsRouter.get("/user-purchase-report", 
  authenticate, 
  authorizeAdmin,
  validateRequest(reportSchema, { source: 'query', sanitize: true }),
  getUserPurchaseReport
);
eventsRouter.get("/:eventId", 
  validateRequest(eventIdSchema, { source: 'params', sanitize: true }),
  getEventById
);