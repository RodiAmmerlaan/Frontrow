import { ReportsService } from '../../src/services/reports.service';
import * as ordersService from '../../src/services/orders.service';
import Logger from '../../src/utils/logger';

// Mock the logger
jest.mock('../../src/utils/logger');

// Mock the OrdersService
jest.mock('../../src/services/orders.service');

describe('ReportsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSalesOverview', () => {
    it('should call OrdersService.getSalesOverview with no parameters when no filters are provided', async () => {
      const mockResult = {
        period: {
          month: undefined,
          year: undefined,
          description: 'All time'
        },
        total_events: 5,
        total_orders: 10,
        total_tickets_sold: 50,
        total_revenue: 500,
        average_revenue_per_event: 100,
        events: []
      };

      (ordersService.OrdersService.getSalesOverview as jest.Mock).mockResolvedValue(mockResult);

      const result = await ReportsService.getSalesOverview();

      expect(ordersService.OrdersService.getSalesOverview).toHaveBeenCalledWith(undefined, undefined);
      expect(Logger.debug).toHaveBeenCalledWith('ReportsService.getSalesOverview called', { month: undefined, year: undefined });
      expect(Logger.info).toHaveBeenCalledWith('Sales overview retrieved successfully', { month: undefined, year: undefined });
      expect(result).toEqual(mockResult);
    });

    it('should call OrdersService.getSalesOverview with month and year parameters when provided', async () => {
      const mockResult = {
        period: {
          month: 5,
          year: 2023,
          description: 'May 2023'
        },
        total_events: 2,
        total_orders: 5,
        total_tickets_sold: 25,
        total_revenue: 250,
        average_revenue_per_event: 125,
        events: []
      };

      (ordersService.OrdersService.getSalesOverview as jest.Mock).mockResolvedValue(mockResult);

      const result = await ReportsService.getSalesOverview(5, 2023);

      expect(ordersService.OrdersService.getSalesOverview).toHaveBeenCalledWith(5, 2023);
      expect(Logger.debug).toHaveBeenCalledWith('ReportsService.getSalesOverview called', { month: 5, year: 2023 });
      expect(Logger.info).toHaveBeenCalledWith('Sales overview retrieved successfully', { month: 5, year: 2023 });
      expect(result).toEqual(mockResult);
    });

    it('should propagate errors from OrdersService.getSalesOverview', async () => {
      const errorMessage = 'Database connection failed';
      (ordersService.OrdersService.getSalesOverview as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(ReportsService.getSalesOverview()).rejects.toThrow(errorMessage);
      
      expect(ordersService.OrdersService.getSalesOverview).toHaveBeenCalledWith(undefined, undefined);
      expect(Logger.debug).toHaveBeenCalledWith('ReportsService.getSalesOverview called', { month: undefined, year: undefined });
      expect(Logger.error).toHaveBeenCalledWith('Error in ReportsService.getSalesOverview:', expect.any(Error));
    });
  });

  describe('getUserPurchaseReport', () => {
    it('should call OrdersService.getUserPurchaseReport with no parameters when no filters are provided', async () => {
      const mockResult = {
        period: {
          month: undefined,
          year: undefined,
          description: 'All time'
        },
        summary: {
          total_users: 10,
          total_orders: 15,
          total_tickets_sold: 75,
          total_revenue: 750,
          average_tickets_per_order: 5,
          average_orders_per_user: 1.5,
          average_spending_per_user: 75
        },
        user_stats: [],
        frequent_buyers: []
      };

      (ordersService.OrdersService.getUserPurchaseReport as jest.Mock).mockResolvedValue(mockResult);

      const result = await ReportsService.getUserPurchaseReport();

      expect(ordersService.OrdersService.getUserPurchaseReport).toHaveBeenCalledWith(undefined, undefined);
      expect(Logger.debug).toHaveBeenCalledWith('ReportsService.getUserPurchaseReport called', { month: undefined, year: undefined });
      expect(Logger.info).toHaveBeenCalledWith('User purchase report retrieved successfully', { month: undefined, year: undefined });
      expect(result).toEqual(mockResult);
    });

    it('should call OrdersService.getUserPurchaseReport with month and year parameters when provided', async () => {
      const mockResult = {
        period: {
          month: 12,
          year: 2023,
          description: 'December 2023'
        },
        summary: {
          total_users: 5,
          total_orders: 8,
          total_tickets_sold: 40,
          total_revenue: 400,
          average_tickets_per_order: 5,
          average_orders_per_user: 1.6,
          average_spending_per_user: 80
        },
        user_stats: [],
        frequent_buyers: []
      };

      (ordersService.OrdersService.getUserPurchaseReport as jest.Mock).mockResolvedValue(mockResult);

      const result = await ReportsService.getUserPurchaseReport(12, 2023);

      expect(ordersService.OrdersService.getUserPurchaseReport).toHaveBeenCalledWith(12, 2023);
      expect(Logger.debug).toHaveBeenCalledWith('ReportsService.getUserPurchaseReport called', { month: 12, year: 2023 });
      expect(Logger.info).toHaveBeenCalledWith('User purchase report retrieved successfully', { month: 12, year: 2023 });
      expect(result).toEqual(mockResult);
    });

    it('should propagate errors from OrdersService.getUserPurchaseReport', async () => {
      const errorMessage = 'Failed to fetch user data';
      (ordersService.OrdersService.getUserPurchaseReport as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(ReportsService.getUserPurchaseReport()).rejects.toThrow(errorMessage);
      
      expect(ordersService.OrdersService.getUserPurchaseReport).toHaveBeenCalledWith(undefined, undefined);
      expect(Logger.debug).toHaveBeenCalledWith('ReportsService.getUserPurchaseReport called', { month: undefined, year: undefined });
      expect(Logger.error).toHaveBeenCalledWith('Error in ReportsService.getUserPurchaseReport:', expect.any(Error));
    });
  });
});