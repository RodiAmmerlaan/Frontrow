"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventById = exports.getEventByIdController = exports.GetEventByIdController = void 0;
const events_service_1 = require("../../services/events.service");
const BaseController_1 = require("../BaseController");
const logger_1 = __importDefault(require("../../utils/logger"));
const errors_1 = require("../../errors");
class GetEventByIdController extends BaseController_1.BaseController {
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
    async getEventById(request, response) {
        const correlationId = request.correlationId || 'N/A';
        const { eventId } = request.validated?.params || request.params;
        logger_1.default.debug(`[${correlationId}] Get event by ID controller called`, { eventId });
        try {
            const enrichedEvent = await events_service_1.EventsService.getEventById(eventId);
            if (!enrichedEvent) {
                logger_1.default.warn(`[${correlationId}] Event not found`, { eventId });
                this.throwNotFoundError('Event not found');
            }
            logger_1.default.info(`[${correlationId}] Successfully retrieved event`, { eventId });
            return this.sendSuccess(response, { event: enrichedEvent });
        }
        catch (error) {
            logger_1.default.error(`[${correlationId}] Error in getEventByIdController:`, error);
            if (error instanceof errors_1.NotFoundError) {
                logger_1.default.warn(`[${correlationId}] Event not found`, { eventId });
                this.throwNotFoundError(error.message);
            }
            if (error instanceof errors_1.InternalServerError) {
                logger_1.default.error(`[${correlationId}] Internal server error in getEventByIdController`, { error: error.message });
                this.throwInternalServerError(error.message);
            }
            logger_1.default.error(`[${correlationId}] Unexpected error in getEventByIdController`);
            this.throwInternalServerError('Failed to retrieve event');
        }
    }
}
exports.GetEventByIdController = GetEventByIdController;
exports.getEventByIdController = new GetEventByIdController();
exports.getEventById = exports.getEventByIdController.getEventById.bind(exports.getEventByIdController);
//# sourceMappingURL=getEventById.controller.js.map