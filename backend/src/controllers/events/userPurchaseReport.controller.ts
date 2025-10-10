import { Request, Response } from 'express';
import { ReportsService } from '../../services/reports.service';
import { BaseController } from '../BaseController';
import Logger from '../../utils/logger';
import { ValidationError, NotFoundError, InternalServerError } from '../../errors';

export class UserPurchaseReportController extends BaseController {
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
    public async getUserPurchaseReport(
        request: Request,
        response: Response
    ) {
        const correlationId = (request as any).correlationId || 'N/A';
        const { month, year } = request.query;
        Logger.debug(`[${correlationId}] Get user purchase report controller called`, { month, year });
        
        try {
            const userPurchaseReport = await ReportsService.getUserPurchaseReport(
                month ? parseInt(month as string) : undefined,
                year ? parseInt(year as string) : undefined
            );
            
            Logger.info(`[${correlationId}] Successfully retrieved user purchase report`);
            return this.sendSuccess(response, userPurchaseReport);
        } catch (error) {
            Logger.error(`[${correlationId}] Error in getUserPurchaseReportController:`, error);
            if (error instanceof ValidationError) {
                Logger.warn(`[${correlationId}] User purchase report validation error`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            if (error instanceof NotFoundError) {
                Logger.warn(`[${correlationId}] User purchase report not found error`, { error: error.message });
                this.throwNotFoundError(error.message);
            }
            this.throwInternalServerError('Failed to retrieve user purchase report');
        }
    }
}

export const userPurchaseReportController = new UserPurchaseReportController();
export const getUserPurchaseReport = userPurchaseReportController.getUserPurchaseReport.bind(userPurchaseReportController);