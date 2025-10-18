"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOrders = exports.getUserOrdersController = exports.GetUserOrdersController = void 0;
const orders_service_1 = require("../../services/orders.service");
const BaseController_1 = require("../BaseController");
const logger_1 = __importDefault(require("../../utils/logger"));
const errors_1 = require("../../errors");
class GetUserOrdersController extends BaseController_1.BaseController {
    /**
     * Controller function to retrieve all orders for a specific user
     * @param request - Express request object containing user ID in params
     * @param response - Express response object
     * @returns Response with user orders or appropriate error message
     */
    /**
     * @openapi
     * /orders/user/{userId}:
     *   get:
     *     summary: Retrieve all orders for a specific user
     *     description: Fetches all orders associated with a specific user ID
     *     tags:
     *       - Orders
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: The user ID
     *     responses:
     *       200:
     *         description: Successful response with user orders
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
     *                     orders:
     *                       type: array
     *                       items:
     *                         $ref: '#/components/schemas/Order'
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
     *         description: User orders not found
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
    async getUserOrders(request, response) {
        const correlationId = request.correlationId || 'N/A';
        const { userId } = request.params;
        logger_1.default.debug(`[${correlationId}] Get user orders controller called`, { userId });
        try {
            const orders = await orders_service_1.OrdersService.getUserOrders(userId);
            logger_1.default.info(`[${correlationId}] User orders retrieved successfully`, { userId, count: orders.length });
            return this.sendSuccess(response, { orders });
        }
        catch (error) {
            logger_1.default.error(`[${correlationId}] Error in getUserOrdersController:`, error);
            if (error instanceof errors_1.ValidationError) {
                logger_1.default.warn(`[${correlationId}] Validation error`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            if (error instanceof errors_1.NotFoundError) {
                logger_1.default.warn(`[${correlationId}] Not found error`, { error: error.message });
                this.throwNotFoundError(error.message);
            }
            logger_1.default.error(`[${correlationId}] Unexpected error in getUserOrdersController`);
            this.throwInternalServerError('Failed to retrieve user orders');
        }
    }
}
exports.GetUserOrdersController = GetUserOrdersController;
exports.getUserOrdersController = new GetUserOrdersController();
exports.getUserOrders = exports.getUserOrdersController.getUserOrders.bind(exports.getUserOrdersController);
//# sourceMappingURL=getUserOrders.controller.js.map