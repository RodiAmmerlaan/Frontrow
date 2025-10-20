"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const login_controller_1 = require("./login.controller");
const refresh_controller_1 = require("./refresh.controller");
const logout_controller_1 = require("./logout.controller");
const registration_controller_1 = require("./registration.controller");
const profile_controller_1 = require("./profile.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const joi_1 = __importDefault(require("joi"));
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required()
});
const registrationSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    first_name: joi_1.default.string().min(1).max(50).required(),
    last_name: joi_1.default.string().min(1).max(50).required(),
    street: joi_1.default.string().min(1).max(100).required(),
    house_number: joi_1.default.string().min(1).max(10).required(),
    postal_code: joi_1.default.string().min(1).max(10).required(),
    city: joi_1.default.string().min(1).max(50).required()
});
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/login', (0, validation_middleware_1.validateRequest)(loginSchema, { source: 'body', sanitize: true }), login_controller_1.login);
exports.authRouter.post('/refresh', refresh_controller_1.refreshController);
exports.authRouter.post('/logout', logout_controller_1.logoutController);
exports.authRouter.post('/register', (0, validation_middleware_1.validateRequest)(registrationSchema, { source: 'body', sanitize: true }), registration_controller_1.registrationController);
exports.authRouter.get('/profile', auth_middleware_1.authenticate, profile_controller_1.getProfileController);
//# sourceMappingURL=auth.router.js.map