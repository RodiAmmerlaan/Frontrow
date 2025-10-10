"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class BaseService {
    constructor() {
        this.logger = logger_1.default;
    }
    /**
     * Handles common error scenarios and logs them appropriately
     * @param error - The error to handle
     * @param operation - The operation that was being performed
     * @param rethrow - Whether to rethrow the error (default: true)
     */
    handleError(error, operation, rethrow = true) {
        this.logger.error(`Error in ${operation}:`, error);
        if (rethrow) {
            throw error;
        }
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=BaseService.js.map