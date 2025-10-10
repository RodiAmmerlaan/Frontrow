"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEvent = exports.createEventController = exports.CreateEventController = void 0;
const events_service_1 = require("../../services/events.service");
const BaseController_1 = require("../BaseController");
const errors_1 = require("../../errors");
const logger_1 = __importDefault(require("../../utils/logger"));
class CreateEventController extends BaseController_1.BaseController {
    /**
     * Controller function to create a new event
     * Creates an event and associated ticket batch in the database
     * @param request - Express request object containing event details in body
     * @param response - Express response object
     * @returns Response with success message or appropriate error message
     */
    /**
     * @openapi
     * /events/create:
     *   post:
     *     summary: Create a new event
     *     description: Creates a new event with associated ticket batch
     *     tags:
     *       - Events
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - title
     *               - description
     *               - date
     *               - start_time
     *               - end_time
     *               - total_tickets
     *               - price
     *             properties:
     *               title:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 100
     *               description:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 1000
     *               date:
     *                 type: string
     *                 pattern: '^\d{4}-\d{2}-\d{2}$'
     *               start_time:
     *                 type: string
     *                 pattern: '^\d{2}:\d{2}$'
     *               end_time:
     *                 type: string
     *                 pattern: '^\d{2}:\d{2}$'
     *               total_tickets:
     *                 type: integer
     *                 minimum: 1
     *               price:
     *                 type: number
     *                 minimum: 0
     *     responses:
     *       201:
     *         description: Event created successfully
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
     *                     message:
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
     *       403:
     *         description: Forbidden - admin access required
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
     *       409:
     *         description: Conflict - event with this title already exists
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
    async createEvent(request, response) {
        const correlationId = request.correlationId || 'N/A';
        logger_1.default.debug(`[${correlationId}] Create event controller called`, {
            title: request.body.title
        });
        try {
            const { title, description, date, start_time, end_time, total_tickets, price } = request.body;
            const result = await events_service_1.EventsService.createEvent({
                title,
                description,
                date,
                start_time,
                end_time,
                total_tickets,
                price
            });
            logger_1.default.info(`[${correlationId}] Event created successfully`, { title });
            return this.sendSuccess(response, result, undefined, 201);
        }
        catch (error) {
            logger_1.default.error(`[${correlationId}] Error creating event:`, error);
            if (error instanceof errors_1.ConflictError) {
                logger_1.default.warn(`[${correlationId}] Event already exists`, { title: request.body.title });
                this.throwConflictError(error.message);
            }
            if (error instanceof errors_1.ValidationError) {
                logger_1.default.warn(`[${correlationId}] Event validation error`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            logger_1.default.error(`[${correlationId}] Unexpected error while creating event`);
            this.throwInternalServerError('Failed to create event. Please try again later.');
        }
    }
}
exports.CreateEventController = CreateEventController;
exports.createEventController = new CreateEventController();
exports.createEvent = exports.createEventController.createEvent.bind(exports.createEventController);
//# sourceMappingURL=createEvent.controller.js.map