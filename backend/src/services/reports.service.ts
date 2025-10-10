import { OrdersService } from './orders.service';
import Logger from '../utils/logger';

import { BaseService } from './BaseService';

export class ReportsService extends BaseService {
    /**
     * Retrieves sales overview data for events
     * @param month - Optional month filter (1-12)
     * @param year - Optional year filter
     * @returns A promise that resolves to sales overview data
     * @throws Will throw an error if there's a problem retrieving or processing the data
     */
    static async getSalesOverview(month?: number, year?: number) {
        Logger.debug('ReportsService.getSalesOverview called', { month, year });
        
        try {
            
            const result = await OrdersService.getSalesOverview(month, year);
            
            Logger.info('Sales overview retrieved successfully', { month, year });
            
            return result;
        } catch (error) {
            Logger.error('Error in ReportsService.getSalesOverview:', error);
            throw error;
        }
    }

    /**
     * Retrieves user purchase report data
     * @param month - Optional month filter (1-12)
     * @param year - Optional year filter
     * @returns A promise that resolves to user purchase report data
     * @throws Will throw an error if there's a problem retrieving or processing the data
     */
    static async getUserPurchaseReport(month?: number, year?: number) {
        Logger.debug('ReportsService.getUserPurchaseReport called', { month, year });
        
        try {
            
            const result = await OrdersService.getUserPurchaseReport(month, year);
            
            Logger.info('User purchase report retrieved successfully', { month, year });
            
            return result;
        } catch (error) {
            Logger.error('Error in ReportsService.getUserPurchaseReport:', error);
            throw error;
        }
    }
}