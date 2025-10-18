"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesOverview = exports.salesOverviewController = exports.SalesOverviewController = void 0;
const reports_service_1 = require("../../services/reports.service");
const BaseController_1 = require("../BaseController");
const logger_1 = __importDefault(require("../../utils/logger"));
const errors_1 = require("../../errors");
class SalesOverviewController extends BaseController_1.BaseController {
    /**
     * Controller function to retrieve sales overview data
     * Calculates and returns sales metrics for events
     * @param request - Express request object with optional month/year query parameters
     * @param response - Express response object
     * @returns Response with sales overview data or error message
     */
    /**
     * @openapi
     * /events/sales-overview:
     *   get:
     *     summary: Retrieve sales overview data
     *     description: Calculates and returns sales metrics for events, optionally filtered by month and year
     *     tags:
     *       - Events
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: month
     *         required: false
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 12
     *         description: Month to filter sales data (1-12)
     *       - in: query
     *         name: year
     *         required: false
     *         schema:
     *           type: integer
     *           minimum: 2000
     *           maximum: 2100
     *         description: Year to filter sales data (2000-2100)
     *     responses:
     *       200:
     *         description: Successful response with sales overview data
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
     *                     totalRevenue:
     *                       type: number
     *                     totalTicketsSold:
     *                       type: integer
     *                     totalEvents:
     *                       type: integer
     *                     averageTicketPrice:
     *                       type: number
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
     *       404:
     *         description: Sales data not found
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
    async getSalesOverview(request, response) {
        const correlationId = request.correlationId || 'N/A';
        const { month, year } = request.query;
        logger_1.default.debug(`[${correlationId}] Get sales overview controller called`, { month, year });
        try {
            const salesOverview = await reports_service_1.ReportsService.getSalesOverview(month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
            logger_1.default.info(`[${correlationId}] Successfully retrieved sales overview`);
            return this.sendSuccess(response, salesOverview);
        }
        catch (error) {
            logger_1.default.error(`[${correlationId}] Error in getSalesOverviewController:`, error);
            if (error instanceof errors_1.ValidationError) {
                logger_1.default.warn(`[${correlationId}] Sales overview validation error`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            if (error instanceof errors_1.NotFoundError) {
                logger_1.default.warn(`[${correlationId}] Sales overview not found error`, { error: error.message });
                this.throwNotFoundError(error.message);
            }
            this.throwInternalServerError('Failed to retrieve sales overview');
        }
    }
}
exports.SalesOverviewController = SalesOverviewController;
exports.salesOverviewController = new SalesOverviewController();
exports.getSalesOverview = exports.salesOverviewController.getSalesOverview.bind(exports.salesOverviewController);
//# sourceMappingURL=salesOverview.controller.js.map