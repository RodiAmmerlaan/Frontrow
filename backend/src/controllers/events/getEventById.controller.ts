import { Request, Response } from 'express';
import { EventsService } from '../../services/events.service';
import { BaseController } from '../BaseController';
import Logger from '../../utils/logger';
import { InternalServerError, NotFoundError } from '../../errors';

export class GetEventByIdController extends BaseController {
    /**
     * Controller function to retrieve a specific event by ID
     * Fetches event details with enriched data
     * @param request - Express request object
     * @param response - Express response object
     * @returns Response with event data or error message
     */
    
    /**
     * @openapi
     * /events/{eventId}:
     *   get:
     *     summary: Retrieve a specific event by ID
     *     description: Fetches event details with enriched data including ticket availability and pricing information
     *     tags:
     *       - Events
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: The event ID
     *     responses:
     *       200:
     *         description: Successful response with event data
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
     *                     event:
     *                       $ref: '#/components/schemas/Event'
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
    public async getEventById(
        request: Request,
        response: Response
    ) {
        const correlationId = (request as any).correlationId || 'N/A';
        const { eventId } = request.params;
        Logger.debug(`[${correlationId}] Get event by ID controller called`, { eventId });
        
        try {
            const enrichedEvent = await EventsService.getEventById(eventId);
            
            if (!enrichedEvent) {
                Logger.warn(`[${correlationId}] Event not found`, { eventId });
                this.throwNotFoundError('Event not found');
            }
            
            Logger.info(`[${correlationId}] Successfully retrieved event`, { eventId });
            return this.sendSuccess(response, { event: enrichedEvent });
        } catch (error: any) {
            Logger.error(`[${correlationId}] Error in getEventByIdController:`, error);
            
            if (error instanceof NotFoundError) {
                Logger.warn(`[${correlationId}] Event not found`, { eventId });
                this.throwNotFoundError(error.message);
            }
            
            if (error instanceof InternalServerError) {
                Logger.error(`[${correlationId}] Internal server error in getEventByIdController`, { error: error.message });
                this.throwInternalServerError(error.message);
            }
            
            Logger.error(`[${correlationId}] Unexpected error in getEventByIdController`);
            this.throwInternalServerError('Failed to retrieve event');
        }
    }
}

export const getEventByIdController = new GetEventByIdController();
export const getEventById = getEventByIdController.getEventById.bind(getEventByIdController);