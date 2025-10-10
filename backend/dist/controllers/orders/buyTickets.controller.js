"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyTickets = exports.buyTicketsController = exports.BuyTicketsController = void 0;
const orders_service_1 = require("../../services/orders.service");
const BaseController_1 = require("../BaseController");
const logger_1 = __importDefault(require("../../utils/logger"));
const errors_1 = require("../../errors");
class BuyTicketsController extends BaseController_1.BaseController {
    /**
     * Controller function to handle ticket purchases
     * Creates an order and associated tickets for a user
     * @param request - Express request object containing event_id, user_id, and total_amount in body
     * @param response - Express response object
     * @returns Response with created tickets or appropriate error message
     */
    /**
     * @openapi
     * /orders/buy:
     *   post:
     *     summary: Purchase tickets for an event
     *     description: Creates an order and associated tickets for a user
     *     tags:
     *       - Orders
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - event_id
     *               - user_id
     *               - total_amount
     *             properties:
     *               event_id:
     *                 type: string
     *                 format: uuid
     *               user_id:
     *                 type: string
     *                 format: uuid
     *               total_amount:
     *                 type: integer
     *                 minimum: 1
     *     responses:
     *       201:
     *         description: Tickets purchased successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     tickets:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                             format: uuid
     *                           order_id:
     *                             type: string
     *                             format: uuid
     *                           event_id:
     *                             type: string
     *                             format: uuid
     *       400:
     *         description: Bad request - validation error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 error:
     *                   type: string
     *                 message:
     *                   type: string
     *       401:
     *         description: Unauthorized
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 error:
     *                   type: string
     *                 message:
     *                   type: string
     *       404:
     *         description: Event not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 error:
     *                   type: string
     *                 message:
     *                   type: string
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 error:
     *                   type: string
     *                 message:
     *                   type: string
     */
    async buyTickets(request, response) {
        const correlationId = request.correlationId || 'N/A';
        const { event_id, user_id, total_amount } = request.body;
        logger_1.default.debug(`[${correlationId}] Buy tickets controller called`, { event_id, user_id, total_amount });
        try {
            const tickets = await orders_service_1.OrdersService.processTicketPurchase(event_id, user_id, total_amount);
            logger_1.default.info(`[${correlationId}] Successfully processed ticket purchase`, {
                event_id,
                user_id,
                total_amount
            });
            return this.sendSuccess(response, { tickets: tickets }, undefined, 201);
        }
        catch (error) {
            logger_1.default.error(`[${correlationId}] Error processing ticket purchase:`, error);
            if (error instanceof errors_1.BadRequestError) {
                logger_1.default.warn(`[${correlationId}] Bad request error in ticket purchase`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            if (error instanceof errors_1.NotFoundError) {
                logger_1.default.warn(`[${correlationId}] Not found error in ticket purchase`, { error: error.message });
                this.throwNotFoundError(error.message);
            }
            if (error instanceof errors_1.ValidationError) {
                logger_1.default.warn(`[${correlationId}] Validation error in ticket purchase`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            logger_1.default.error(`[${correlationId}] Unexpected error in ticket purchase`);
            this.throwInternalServerError("Failed to process ticket purchase. Please try again later.");
        }
    }
}
exports.BuyTicketsController = BuyTicketsController;
exports.buyTicketsController = new BuyTicketsController();
exports.buyTickets = exports.buyTicketsController.buyTickets.bind(exports.buyTicketsController);
//# sourceMappingURL=buyTickets.controller.js.map