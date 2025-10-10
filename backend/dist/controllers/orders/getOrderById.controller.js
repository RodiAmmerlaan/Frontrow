"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderById = exports.getOrderByIdController = exports.GetOrderByIdController = void 0;
const orders_service_1 = require("../../services/orders.service");
const BaseController_1 = require("../BaseController");
const logger_1 = __importDefault(require("../../utils/logger"));
const errors_1 = require("../../errors");
class GetOrderByIdController extends BaseController_1.BaseController {
    /**
     * Controller function to retrieve order details by ID
     * @param request - Express request object containing order ID in params
     * @param response - Express response object
     * @returns Response with order details or appropriate error message
     */
    /**
     * @openapi
     * /orders/{orderId}:
     *   get:
     *     summary: Retrieve order details by ID
     *     description: Fetches detailed information about a specific order by its ID
     *     tags:
     *       - Orders
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: orderId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: The order ID
     *     responses:
     *       200:
     *         description: Successful response with order details
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/Order'
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
     *         description: Order not found
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
    async getOrderById(request, response) {
        const correlationId = request.correlationId || 'N/A';
        const { orderId } = request.params;
        logger_1.default.debug(`[${correlationId}] Get order by ID controller called`, { orderId });
        try {
            const order = await orders_service_1.OrdersService.getOrderById(orderId);
            logger_1.default.info(`[${correlationId}] Order retrieved successfully`, { orderId });
            return this.sendSuccess(response, order);
        }
        catch (error) {
            logger_1.default.error(`[${correlationId}] Error in getOrderByIdController:`, error);
            if (error instanceof errors_1.NotFoundError) {
                logger_1.default.warn(`[${correlationId}] Order not found`, { orderId });
                this.throwNotFoundError(error.message);
            }
            if (error instanceof errors_1.ValidationError) {
                logger_1.default.warn(`[${correlationId}] Validation error`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            logger_1.default.error(`[${correlationId}] Unexpected error in getOrderByIdController`);
            this.throwInternalServerError('Failed to retrieve order');
        }
    }
}
exports.GetOrderByIdController = GetOrderByIdController;
exports.getOrderByIdController = new GetOrderByIdController();
exports.getOrderById = exports.getOrderByIdController.getOrderById.bind(exports.getOrderByIdController);
//# sourceMappingURL=getOrderById.controller.js.map