"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchEvents = exports.searchEventsController = exports.SearchEventsController = void 0;
const events_service_1 = require("../../services/events.service");
const BaseController_1 = require("../BaseController");
const logger_1 = __importDefault(require("../../utils/logger"));
const errors_1 = require("../../errors");
class SearchEventsController extends BaseController_1.BaseController {
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
    async searchEvents(request, response) {
        const correlationId = request.correlationId || 'N/A';
        const { name } = request.query;
        logger_1.default.debug(`[${correlationId}] Search events controller called`, { name });
        try {
            const result = await events_service_1.EventsService.searchEventsByName(name);
            logger_1.default.info(`[${correlationId}] Successfully searched events`, {
                searchTerm: name,
                resultCount: result.count
            });
            return this.sendSuccess(response, result);
        }
        catch (error) {
            logger_1.default.error(`[${correlationId}] Error searching events:`, error);
            if (error instanceof errors_1.ValidationError) {
                logger_1.default.warn(`[${correlationId}] Search validation error`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            if (error instanceof errors_1.NotFoundError) {
                logger_1.default.warn(`[${correlationId}] Search not found error`, { error: error.message });
                this.throwNotFoundError(error.message);
            }
            this.throwInternalServerError("Failed to search events. Please try again later.");
        }
    }
}
exports.SearchEventsController = SearchEventsController;
exports.searchEventsController = new SearchEventsController();
exports.searchEvents = exports.searchEventsController.searchEvents.bind(exports.searchEventsController);
//# sourceMappingURL=searchEvents.controller.js.map