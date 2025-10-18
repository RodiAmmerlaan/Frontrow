"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openApiRouter = void 0;
const express_1 = require("express");
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const openapi_config_1 = __importDefault(require("../../config/openapi.config"));
const specs = (0, swagger_jsdoc_1.default)(openapi_config_1.default);
exports.openApiRouter = (0, express_1.Router)();
exports.openApiRouter.get('/json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});
exports.openApiRouter.use('/', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
//# sourceMappingURL=openapi.router.js.map