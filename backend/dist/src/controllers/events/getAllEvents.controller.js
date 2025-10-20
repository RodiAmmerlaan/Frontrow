"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEvents = exports.getAllEventsController = exports.GetAllEventsController = void 0;
const events_service_1 = require("../../services/events.service");
const BaseController_1 = require("../BaseController");
const logger_1 = __importDefault(require("../../utils/logger"));
const errors_1 = require("../../errors");
class GetAllEventsController extends BaseController_1.BaseController {
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
    async getAllEvents(request, response) {
        const correlationId = request.correlationId || 'N/A';
        const { page = 1, limit = 10 } = request.query;
        logger_1.default.debug(`[${correlationId}] Get all events controller called`, { page, limit });
        try {
            const enrichedEvents = await events_service_1.EventsService.getEnrichedEvents();
            logger_1.default.info(`[${correlationId}] Successfully retrieved all events`, { count: enrichedEvents.length });
            return this.sendSuccess(response, { events: enrichedEvents });
        }
        catch (error) {
            logger_1.default.error(`[${correlationId}] Error in getAllEventsController:`, error);
            if (error instanceof errors_1.InternalServerError) {
                logger_1.default.error(`[${correlationId}] Internal server error in getAllEventsController`, { error: error.message });
                this.throwInternalServerError(error.message);
            }
            logger_1.default.error(`[${correlationId}] Unexpected error in getAllEventsController`);
            this.throwInternalServerError('Failed to retrieve events');
        }
    }
}
exports.GetAllEventsController = GetAllEventsController;
exports.getAllEventsController = new GetAllEventsController();
exports.getAllEvents = exports.getAllEventsController.getAllEvents.bind(exports.getAllEventsController);
//# sourceMappingURL=getAllEvents.controller.js.map