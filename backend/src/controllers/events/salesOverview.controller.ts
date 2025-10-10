import { Request, Response } from 'express';
import { ReportsService } from '../../services/reports.service';
import { BaseController } from '../BaseController';
import Logger from '../../utils/logger';
import { ValidationError, NotFoundError, InternalServerError } from '../../errors';

export class SalesOverviewController extends BaseController {
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
    public async getSalesOverview(
        request: Request,
        response: Response
    ) {
        const correlationId = (request as any).correlationId || 'N/A';
        const { month, year } = request.query;
        Logger.debug(`[${correlationId}] Get sales overview controller called`, { month, year });
        
        try {
            const salesOverview = await ReportsService.getSalesOverview(
                month ? parseInt(month as string) : undefined,
                year ? parseInt(year as string) : undefined
            );
            
            Logger.info(`[${correlationId}] Successfully retrieved sales overview`);
            return this.sendSuccess(response, salesOverview);
        } catch (error) {
            Logger.error(`[${correlationId}] Error in getSalesOverviewController:`, error);
            if (error instanceof ValidationError) {
                Logger.warn(`[${correlationId}] Sales overview validation error`, { error: error.message });
                this.throwBadRequestError(error.message);
            }
            if (error instanceof NotFoundError) {
                Logger.warn(`[${correlationId}] Sales overview not found error`, { error: error.message });
                this.throwNotFoundError(error.message);
            }
            this.throwInternalServerError('Failed to retrieve sales overview');
        }
    }
}

export const salesOverviewController = new SalesOverviewController();
export const getSalesOverview = salesOverviewController.getSalesOverview.bind(salesOverviewController);