"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressCheck = exports.addressCheckController = exports.AddressCheckController = void 0;
const axios_1 = __importDefault(require("axios"));
const BaseController_1 = require("./BaseController");
class AddressCheckController extends BaseController_1.BaseController {
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
    async addressCheck(request, response) {
        try {
            const address = await axios_1.default.get(`https://openpostcode.nl/api/address?postcode=${request.query.postalCode}&huisnummer=${request.query.houseNumber}`);
            return this.sendSuccess(response, { street: address.data.straat, city: address.data.woonplaats });
        }
        catch (error) {
            return this.sendError(response, 'ADDRESS_LOOKUP_FAILED', 500, 'Failed to lookup address');
        }
    }
}
exports.AddressCheckController = AddressCheckController;
exports.addressCheckController = new AddressCheckController();
exports.addressCheck = exports.addressCheckController.addressCheck.bind(exports.addressCheckController);
//# sourceMappingURL=addressCheck.controller.js.map