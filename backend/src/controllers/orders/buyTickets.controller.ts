import { Request, Response } from 'express';
import { OrdersService } from '../../services/orders.service';
import { BaseController } from '../BaseController';
import Logger from '../../utils/logger';
import { NotFoundError, BadRequestError, ValidationError, InternalServerError } from '../../errors';

export class BuyTicketsController extends BaseController {
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
    public async buyTickets(
        request: Request,
        response: Response
    ) {
        const correlationId = (request as any).correlationId || 'N/A';
        const { event_id, user_id, total_amount } = request.validated?.body || request.body;
        Logger.debug(`[${correlationId}] Buy tickets controller called`, { event_id, user_id, total_amount });
        
        try {
            const tickets = await OrdersService.processTicketPurchase(event_id, user_id, total_amount);
            Logger.info(`[${correlationId}] Successfully processed ticket purchase`, { 
                event_id, 
                user_id, 
                total_amount 
            });
            return this.sendSuccess(response, { tickets: tickets }, undefined, 201);
        } catch (error: any) {
            Logger.error(`[${correlationId}] Error processing ticket purchase:`, error);
            
            if (error instanceof BadRequestError) {
                Logger.warn(`[${correlationId}] Bad request error in ticket purchase`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            
            if (error instanceof NotFoundError) {
                Logger.warn(`[${correlationId}] Not found error in ticket purchase`, { error: error.message });
                this.throwNotFoundError(error.message);
            }
            
            if (error instanceof ValidationError) {
                Logger.warn(`[${correlationId}] Validation error in ticket purchase`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            
            Logger.error(`[${correlationId}] Unexpected error in ticket purchase`);
            this.throwInternalServerError("Failed to process ticket purchase. Please try again later.");
        }
    }
}

export const buyTicketsController = new BuyTicketsController();
export const buyTickets = buyTicketsController.buyTickets.bind(buyTicketsController);