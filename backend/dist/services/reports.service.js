"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const orders_service_1 = require("./orders.service");
const logger_1 = __importDefault(require("../utils/logger"));
const BaseService_1 = require("./BaseService");
class ReportsService extends BaseService_1.BaseService {
    /**
     * Retrieves sales overview data for events
     * @param month - Optional month filter (1-12)
     * @param year - Optional year filter
     * @returns A promise that resolves to sales overview data
     * @throws Will throw an error if there's a problem retrieving or processing the data
     */
    static async getSalesOverview(month, year) {
        logger_1.default.debug('ReportsService.getSalesOverview called', { month, year });
        try {
            const result = await orders_service_1.OrdersService.getSalesOverview(month, year);
            logger_1.default.info('Sales overview retrieved successfully', { month, year });
            return result;
        }
        catch (error) {
            logger_1.default.error('Error in ReportsService.getSalesOverview:', error);
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
    static async getUserPurchaseReport(month, year) {
        logger_1.default.debug('ReportsService.getUserPurchaseReport called', { month, year });
        try {
            const result = await orders_service_1.OrdersService.getUserPurchaseReport(month, year);
            logger_1.default.info('User purchase report retrieved successfully', { month, year });
            return result;
        }
        catch (error) {
            logger_1.default.error('Error in ReportsService.getUserPurchaseReport:', error);
            throw error;
        }
    }
}
exports.ReportsService = ReportsService;
//# sourceMappingURL=reports.service.js.map