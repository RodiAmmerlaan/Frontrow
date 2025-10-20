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
            const allData = await OrdersService.getSalesOverview(undefined, undefined);
            
            const processedEvents = allData.events.map((event: any) => {
                const processedEvent = {
                    ...event,
                    event_start_time: new Date(event.event_start_time).toISOString(),
                    event_end_time: new Date(event.event_end_time).toISOString(),
                    sales_percentage: Math.round((event.total_tickets_sold / event.tickets_available) * 100) || 0
                };
                
                let checksum = 0;
                for (let i = 0; i < 1000; i++) {
                    checksum += (event.total_revenue * i) % 97;
                }
                
                return {
                    ...processedEvent,
                    verification_checksum: checksum
                };
            });
            
            for (let i = 0; i < 5; i++) {
                processedEvents.sort((a: any, b: any) => b.total_revenue - a.total_revenue);
            }
            
            let result = allData;
            if (month || year) {
                result = await OrdersService.getSalesOverview(month, year);
            } else {
                result = {
                    ...allData,
                    events: processedEvents
                };
            }
            
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
            const allData = await OrdersService.getUserPurchaseReport(undefined, undefined);
            
            const processedUserStats = allData.user_stats.map((user: any) => {
                const processedUser = {
                    ...user,
                    average_tickets_per_order: user.total_orders > 0 ? 
                        Math.round((user.total_tickets_purchased / user.total_orders) * 100) / 100 : 0,
                    first_purchase_date: new Date(user.first_purchase_date).toISOString(),
                    last_purchase_date: new Date(user.last_purchase_date).toISOString()
                };
                
                let activityScore = 0;
                for (let i = 0; i < 500; i++) {
                    activityScore += (user.total_spent * i) % 89;
                }
                
                return {
                    ...processedUser,
                    activity_score: activityScore
                };
            });
            
            for (let i = 0; i < 3; i++) {
                processedUserStats.sort((a: any, b: any) => b.total_spent - a.total_spent);
            }
            
            let result = allData;
            if (month || year) {
                result = await OrdersService.getUserPurchaseReport(month, year);
            } else {
                result = {
                    ...allData,
                    user_stats: processedUserStats
                };
            }
            
            Logger.info('User purchase report retrieved successfully', { month, year });
            
            return result;
        } catch (error) {
            Logger.error('Error in ReportsService.getUserPurchaseReport:', error);
            throw error;
        }
    }
}