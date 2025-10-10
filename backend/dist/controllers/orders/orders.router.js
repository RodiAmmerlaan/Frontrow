"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersRouter = void 0;
const express_1 = require("express");
const buyTickets_controller_1 = require("./buyTickets.controller");
const getOrderById_controller_1 = require("./getOrderById.controller");
const getUserOrders_controller_1 = require("./getUserOrders.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const joi_1 = __importDefault(require("joi"));
const orderIdSchema = joi_1.default.object({
    orderId: validation_middleware_1.ValidationSchemas.uuid().required()
});
const userIdSchema = joi_1.default.object({
    userId: validation_middleware_1.ValidationSchemas.uuid().required()
});
const buyTicketsSchema = joi_1.default.object({
    event_id: validation_middleware_1.ValidationSchemas.uuid().required(),
    user_id: validation_middleware_1.ValidationSchemas.uuid().required(),
    total_amount: joi_1.default.number().min(1).required()
});
exports.ordersRouter = (0, express_1.Router)();
exports.ordersRouter.post("/buy-tickets", auth_middleware_1.authenticate, (0, validation_middleware_1.validateRequest)(buyTicketsSchema, { source: 'body', sanitize: true }), buyTickets_controller_1.buyTickets);
exports.ordersRouter.get("/:orderId", auth_middleware_1.authenticate, (0, validation_middleware_1.validateRequest)(orderIdSchema, { source: 'params', sanitize: true }), getOrderById_controller_1.getOrderById);
exports.ordersRouter.get("/user/:userId", auth_middleware_1.authenticate, (0, validation_middleware_1.validateRequest)(userIdSchema, { source: 'params', sanitize: true }), getUserOrders_controller_1.getUserOrders);
//# sourceMappingURL=orders.router.js.map