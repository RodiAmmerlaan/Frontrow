import { Request, Response } from 'express';
import axios from 'axios';
import { AddressCheckController } from '../../src/controllers/addressCheck.controller';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the response utility functions
jest.mock('../../src/utils/response.util', () => {
  const originalModule = jest.requireActual('../../src/utils/response.util');
  return {
    ...originalModule,
    sendSuccess: jest.fn(),
    sendError: jest.fn()
  };
});

// Import the mocked functions after mocking
const { 
  sendSuccess: mockSendSuccess,
  sendError: mockSendError
} = require('../../src/utils/response.util');

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('AddressCheckController', () => {
  let addressCheckController: AddressCheckController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let correlationId: string;

  beforeEach(() => {
    jest.clearAllMocks();
    
    addressCheckController = new AddressCheckController();
    correlationId = 'test-correlation-id';
    
    mockRequest = {
      correlationId,
      query: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('addressCheck', () => {
    const mockAddressData = {
      postcode: '1234AB',
      huisnummer: '1',
      straat: 'Teststraat',
      buurt: 'Testbuurt',
      wijk: 'Testwijk',
      woonplaats: 'Testwoonplaats',
      gemeente: 'Testgemeente',
      provincie: 'Testprovincie',
      latitude: 52.123456,
      longitude: 5.123456
    };

    beforeEach(() => {
      mockRequest.query = {
        postalCode: '1234AB',
        houseNumber: '1'
      };
    });

    it('should successfully retrieve address information', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockAddressData });

      await addressCheckController.addressCheck(mockRequest as Request, mockResponse as Response);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://openpostcode.nl/api/address?postcode=1234AB&huisnummer=1'
      );
      expect(mockSendSuccess).toHaveBeenCalledWith(
        mockResponse, 
        { street: 'Teststraat', city: 'Testwoonplaats' },
        undefined,
        200
      );
    });

    it('should handle axios errors and return address lookup failed response', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await addressCheckController.addressCheck(mockRequest as Request, mockResponse as Response);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://openpostcode.nl/api/address?postcode=1234AB&huisnummer=1'
      );
      expect(mockSendError).toHaveBeenCalledWith(
        mockResponse,
        'ADDRESS_LOOKUP_FAILED',
        500,
        'Failed to lookup address'
      );
    });

    it('should handle missing query parameters gracefully', async () => {
      mockRequest.query = {};

      await addressCheckController.addressCheck(mockRequest as Request, mockResponse as Response);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://openpostcode.nl/api/address?postcode=undefined&huisnummer=undefined'
      );
      // The axios call will fail, so we expect the error response
      expect(mockSendError).toHaveBeenCalledWith(
        mockResponse,
        'ADDRESS_LOOKUP_FAILED',
        500,
        'Failed to lookup address'
      );
    });
  });
});