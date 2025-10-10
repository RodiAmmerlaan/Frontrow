import { Request, Response } from 'express';
import { OrdersService } from '../../services/orders.service';
import { BaseController } from '../BaseController';
import Logger from '../../utils/logger';
import { NotFoundError, ValidationError, InternalServerError } from '../../errors';

export class GetUserOrdersController extends BaseController {
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
    public async getUserOrders(
        request: Request,
        response: Response
    ) {
        const correlationId = (request as any).correlationId || 'N/A';
        const { userId } = request.params;
        Logger.debug(`[${correlationId}] Get user orders controller called`, { userId });
        
        try {
            const orders = await OrdersService.getUserOrders(userId);
            
            Logger.info(`[${correlationId}] User orders retrieved successfully`, { userId, count: orders.length });
            return this.sendSuccess(response, { orders });
        } catch (error: any) {
            Logger.error(`[${correlationId}] Error in getUserOrdersController:`, error);
            
            if (error instanceof ValidationError) {
                Logger.warn(`[${correlationId}] Validation error`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            
            if (error instanceof NotFoundError) {
                Logger.warn(`[${correlationId}] Not found error`, { error: error.message });
                this.throwNotFoundError(error.message);
            }
            
            Logger.error(`[${correlationId}] Unexpected error in getUserOrdersController`);
            this.throwInternalServerError('Failed to retrieve user orders');
        }
    }
}

export const getUserOrdersController = new GetUserOrdersController();
export const getUserOrders = getUserOrdersController.getUserOrders.bind(getUserOrdersController);