"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPurchaseReport = exports.userPurchaseReportController = exports.UserPurchaseReportController = void 0;
const reports_service_1 = require("../../services/reports.service");
const BaseController_1 = require("../BaseController");
const logger_1 = __importDefault(require("../../utils/logger"));
const errors_1 = require("../../errors");
class UserPurchaseReportController extends BaseController_1.BaseController {
    /**
     * Controller function to retrieve user purchase report data
     * Calculates and returns user purchasing behavior metrics
     * @param request - Express request object with optional month/year query parameters
     * @param response - Express response object
     * @returns Response with user purchase report data or error message
     */
    /**
     * @openapi
     * /events/user-purchase-report:
     *   get:
     *     summary: Retrieve user purchase report data
     *     description: Calculates and returns user purchasing behavior metrics, optionally filtered by month and year
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
     *         description: Month to filter purchase data (1-12)
     *       - in: query
     *         name: year
     *         required: false
     *         schema:
     *           type: integer
     *           minimum: 2000
     *           maximum: 2100
     *         description: Year to filter purchase data (2000-2100)
     *     responses:
     *       200:
     *         description: Successful response with user purchase report data
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
     *                     totalUsers:
     *                       type: integer
     *                     averageTicketsPerUser:
     *                       type: number
     *                     averageSpentPerUser:
     *                       type: number
     *                     mostActiveUser:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: string
     *                         email:
     *                           type: string
     *                         ticketsPurchased:
     *                           type: integer
     *                         totalSpent:
     *                           type: number
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
     *         description: Purchase report data not found
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
    async getUserPurchaseReport(request, response) {
        const correlationId = request.correlationId || 'N/A';
        const { month, year } = request.query;
        logger_1.default.debug(`[${correlationId}] Get user purchase report controller called`, { month, year });
        try {
            const userPurchaseReport = await reports_service_1.ReportsService.getUserPurchaseReport(month ? parseInt(month) : undefined, year ? parseInt(year) : undefined);
            logger_1.default.info(`[${correlationId}] Successfully retrieved user purchase report`);
            return this.sendSuccess(response, userPurchaseReport);
        }
        catch (error) {
            logger_1.default.error(`[${correlationId}] Error in getUserPurchaseReportController:`, error);
            if (error instanceof errors_1.ValidationError) {
                logger_1.default.warn(`[${correlationId}] User purchase report validation error`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            if (error instanceof errors_1.NotFoundError) {
                logger_1.default.warn(`[${correlationId}] User purchase report not found error`, { error: error.message });
                this.throwNotFoundError(error.message);
            }
            this.throwInternalServerError('Failed to retrieve user purchase report');
        }
    }
}
exports.UserPurchaseReportController = UserPurchaseReportController;
exports.userPurchaseReportController = new UserPurchaseReportController();
exports.getUserPurchaseReport = exports.userPurchaseReportController.getUserPurchaseReport.bind(exports.userPurchaseReportController);
//# sourceMappingURL=userPurchaseReport.controller.js.map