"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_router_1 = require("./controllers/auth/auth.router");
const events_router_1 = require("./controllers/events/events.router");
const orders_router_1 = require("./controllers/orders/orders.router");
const openapi_router_1 = require("./controllers/openapi/openapi.router");
const errorHandler_middleware_1 = require("./middleware/errorHandler.middleware");
const correlationId_middleware_1 = require("./middleware/correlationId.middleware");
const logger_1 = __importDefault(require("./utils/logger"));
const config_1 = require("./config");
const app = (0, express_1.default)();
const PORT = config_1.SERVER_CONFIG.PORT;
app.use(correlationId_middleware_1.correlationIdMiddleware);
app.use((0, cors_1.default)({
    origin: config_1.SERVER_CONFIG.CORS_ORIGIN,
    credentials: true,
}));
app.use(express_1.default.json());
app.use('/api/v1/auth', auth_router_1.authRouter);
app.use('/api/v1/events', events_router_1.eventsRouter);
app.use('/api/v1/orders', orders_router_1.ordersRouter);
app.use('/api/v1/docs', openapi_router_1.openApiRouter);
app.use(errorHandler_middleware_1.errorHandler);
app.listen(PORT, () => {
    logger_1.default.info(`Server is running on port ${PORT}`);
});
__exportStar(require("./repositories"), exports);
//# sourceMappingURL=index.js.map