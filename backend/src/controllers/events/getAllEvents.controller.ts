import { Request, Response } from 'express';
import { EventsService } from '../../services/events.service';
import { BaseController } from '../BaseController';
import Logger from '../../utils/logger';
import { InternalServerError } from '../../errors';

export class GetAllEventsController extends BaseController {
    /**
     * Controller function to retrieve all events with enriched data
     * Fetches events and includes ticket availability and pricing information
     * @param request - Express request object
     * @param response - Express response object
     * @returns Response with array of enriched events or error message
     */
    
    /**
     * @openapi
     * /events:
     *   get:
     *     summary: Retrieve all events
     *     description: Fetches all events with enriched data including ticket availability and pricing information
     *     tags:
     *       - Events
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           minimum: 1
     *         description: Page number for pagination
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *         description: Number of events per page
     *     responses:
     *       200:
     *         description: Successful response with events data
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
     *                     events:
     *                       type: array
     *                       items:
     *                         $ref: '#/components/schemas/Event'
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
    public async getAllEvents(
        request: Request,
        response: Response
    ) {
        const correlationId = (request as any).correlationId || 'N/A';
        const { page = 1, limit = 10 } = request.validated?.query || request.query;
        Logger.debug(`[${correlationId}] Get all events controller called`, { page, limit });
        
        try {
            const enrichedEvents = await EventsService.getEnrichedEvents();
            Logger.info(`[${correlationId}] Successfully retrieved all events`, { count: enrichedEvents.length });
            return this.sendSuccess(response, { events: enrichedEvents });
        } catch (error: any) {
            Logger.error(`[${correlationId}] Error in getAllEventsController:`, error);
            
            if (error instanceof InternalServerError) {
                Logger.error(`[${correlationId}] Internal server error in getAllEventsController`, { error: error.message });
                this.throwInternalServerError(error.message);
            }
            
            Logger.error(`[${correlationId}] Unexpected error in getAllEventsController`);
            this.throwInternalServerError('Failed to retrieve events');
        }
    }
}

export const getAllEventsController = new GetAllEventsController();
export const getAllEvents = getAllEventsController.getAllEvents.bind(getAllEventsController);