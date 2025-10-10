import { Request, Response } from 'express';
import axios from 'axios';
import { BaseController } from './BaseController';

interface Address {
    postcode: string;
    huisnummer: string;
    straat: string;
    buurt: string;
    wijk: string;
    woonplaats: string;
    gemeente: string;
    provincie: string;
    latitude: number;
    longitude: number;
}

export class AddressCheckController extends BaseController {
    /**
     * Controller function to check address information based on postal code and house number
     * Uses the openpostcode.nl API to retrieve address details
     * @param request - Express request object with postalCode and houseNumber query parameters
     * @param response - Express response object
     * @returns Response with street and city information
     */
    
    /**
     * @openapi
     * /address-check:
     *   get:
     *     summary: Check address information
     *     description: Retrieve address details based on postal code and house number using the openpostcode.nl API
     *     tags:
     *       - Utilities
     *     parameters:
     *       - in: query
     *         name: postalCode
     *         required: true
     *         schema:
     *           type: string
     *         description: The postal code to look up
     *       - in: query
     *         name: houseNumber
     *         required: true
     *         schema:
     *           type: string
     *         description: The house number to look up
     *     responses:
     *       200:
     *         description: Successful response with address information
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
     *                     street:
     *                       type: string
     *                     city:
     *                       type: string
     *       500:
     *         description: Address lookup failed
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
    public async addressCheck(
        request: Request,
        response: Response
    ) {
        try {
            const address = await axios.get<Address>(`https://openpostcode.nl/api/address?postcode=${request.query.postalCode}&huisnummer=${request.query.houseNumber}`);
            return this.sendSuccess(response, { street: address.data.straat, city: address.data.woonplaats });
        } catch (error) {
            return this.sendError(response, 'ADDRESS_LOOKUP_FAILED', 500, 'Failed to lookup address');
        }
    }
}

export const addressCheckController = new AddressCheckController();
export const addressCheck = addressCheckController.addressCheck.bind(addressCheckController);