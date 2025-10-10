import { Request, Response } from 'express';
import { EventsService } from '../../services/events.service';
import { BaseController } from '../BaseController';
import Logger from '../../utils/logger';
import { ValidationError, NotFoundError, InternalServerError } from '../../errors';

export class SearchEventsController extends BaseController {
    /**
     * Controller function to search for events by name
     * Performs a case-insensitive partial match search on event titles
     * @param request - Express request object containing the search term in query parameters
     * @param response - Express response object
     * @returns Response with array of matching events or appropriate error message
     */
    
    /**
     * @openapi
     * /events/search:
     *   get:
     *     summary: Search for events by name
     *     description: Performs a case-insensitive partial match search on event titles
     *     tags:
     *       - Events
     *     parameters:
     *       - in: query
     *         name: name
     *         required: true
     *         schema:
     *           type: string
     *           minLength: 1
     *         description: The search term to match against event titles
     *     responses:
     *       200:
     *         description: Successful response with matching events
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
     *                     count:
     *                       type: integer
     *                     searchTerm:
     *                       type: string
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
     *       404:
     *         description: No events found matching the search term
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
    public async searchEvents(
        request: Request,
        response: Response
    ) {
        const correlationId = (request as any).correlationId || 'N/A';
        const { name } = request.query;
        Logger.debug(`[${correlationId}] Search events controller called`, { name });
        
        try {
            const result = await EventsService.searchEventsByName(name as string);
            Logger.info(`[${correlationId}] Successfully searched events`, { 
                searchTerm: name, 
                resultCount: result.count 
            });
            return this.sendSuccess(response, result);
        } catch (error: any) {
            Logger.error(`[${correlationId}] Error searching events:`, error);
            if (error instanceof ValidationError) {
                Logger.warn(`[${correlationId}] Search validation error`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            if (error instanceof NotFoundError) {
                Logger.warn(`[${correlationId}] Search not found error`, { error: error.message });
                this.throwNotFoundError(error.message);
            }
            this.throwInternalServerError("Failed to search events. Please try again later.");
        }
    }
}

export const searchEventsController = new SearchEventsController();
export const searchEvents = searchEventsController.searchEvents.bind(searchEventsController);