import { Request, Response } from 'express';
import { OrdersService } from '../../services/orders.service';
import { BaseController } from '../BaseController';
import Logger from '../../utils/logger';
import { NotFoundError, ValidationError, InternalServerError } from '../../errors';

export class GetOrderByIdController extends BaseController {
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
    public async getOrderById(
        request: Request,
        response: Response
    ) {
        const correlationId = (request as any).correlationId || 'N/A';
        const { orderId } = request.params;
        Logger.debug(`[${correlationId}] Get order by ID controller called`, { orderId });
        
        try {
            const order = await OrdersService.getOrderById(orderId);
            
            Logger.info(`[${correlationId}] Order retrieved successfully`, { orderId });
            return this.sendSuccess(response, order);
        } catch (error: any) {
            Logger.error(`[${correlationId}] Error in getOrderByIdController:`, error);
            
            if (error instanceof NotFoundError) {
                Logger.warn(`[${correlationId}] Order not found`, { orderId });
                this.throwNotFoundError(error.message);
            }
            
            if (error instanceof ValidationError) {
                Logger.warn(`[${correlationId}] Validation error`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            
            Logger.error(`[${correlationId}] Unexpected error in getOrderByIdController`);
            this.throwInternalServerError('Failed to retrieve order');
        }
    }
}

export const getOrderByIdController = new GetOrderByIdController();
export const getOrderById = getOrderByIdController.getOrderById.bind(getOrderByIdController);