"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsRouter = void 0;
const express_1 = require("express");
const getAllEvents_controller_1 = require("./getAllEvents.controller");
const getEventById_controller_1 = require("./getEventById.controller");
const createEvent_controller_1 = require("./createEvent.controller");
const salesOverview_controller_1 = require("./salesOverview.controller");
const userPurchaseReport_controller_1 = require("./userPurchaseReport.controller");
const searchEvents_controller_1 = require("./searchEvents.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const joi_1 = __importDefault(require("joi"));
const createEventSchema = joi_1.default.object({
    title: joi_1.default.string().min(1).max(100).required(),
    description: joi_1.default.string().min(1).max(1000).required(),
    date: joi_1.default.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    start_time: joi_1.default.string().pattern(/^\d{2}:\d{2}$/).required(),
    end_time: joi_1.default.string().pattern(/^\d{2}:\d{2}$/).required(),
    total_tickets: joi_1.default.number().integer().min(1).required(),
    price: joi_1.default.number().min(0).required()
});
const eventIdSchema = joi_1.default.object({
    eventId: validation_middleware_1.ValidationSchemas.uuid().required()
});
const paginationSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).optional(),
    limit: joi_1.default.number().integer().min(1).max(100).optional()
});
const searchEventsSchema = joi_1.default.object({
    name: joi_1.default.string().min(1).required()
});
const reportSchema = joi_1.default.object({
    month: joi_1.default.number().integer().min(1).max(12).optional(),
    year: joi_1.default.number().integer().min(2000).max(2100).optional()
});
exports.eventsRouter = (0, express_1.Router)();
exports.eventsRouter.get("", (0, validation_middleware_1.validateRequest)(paginationSchema, { source: 'query', sanitize: true }), getAllEvents_controller_1.getAllEvents);
exports.eventsRouter.get("/search", (0, validation_middleware_1.validateRequest)(searchEventsSchema, { source: 'query', sanitize: true }), searchEvents_controller_1.searchEvents);
exports.eventsRouter.post("/create", auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, (0, validation_middleware_1.validateRequest)(createEventSchema, { source: 'body', sanitize: true }), createEvent_controller_1.createEvent);
exports.eventsRouter.get("/sales-overview", auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, (0, validation_middleware_1.validateRequest)(reportSchema, { source: 'query', sanitize: true }), salesOverview_controller_1.getSalesOverview);
exports.eventsRouter.get("/user-purchase-report", auth_middleware_1.authenticate, auth_middleware_1.authorizeAdmin, (0, validation_middleware_1.validateRequest)(reportSchema, { source: 'query', sanitize: true }), userPurchaseReport_controller_1.getUserPurchaseReport);
exports.eventsRouter.get("/:eventId", (0, validation_middleware_1.validateRequest)(eventIdSchema, { source: 'params', sanitize: true }), getEventById_controller_1.getEventById);
//# sourceMappingURL=events.router.js.map