"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOGGING_CONFIG = exports.DATABASE_CONFIG = exports.JWT_CONFIG = exports.SERVER_CONFIG = void 0;
exports.SERVER_CONFIG = {
    PORT: Number(process.env.PORT) || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3001'
};
exports.JWT_CONFIG = {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'default_access_secret',
    REFRESH_TTL_DAYS: Number(process.env.REFRESH_TTL_DAYS) || 30
};
exports.DATABASE_CONFIG = {
    URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/database'
};
exports.LOGGING_CONFIG = {
    LEVEL: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
};
exports.default = {
    SERVER_CONFIG: exports.SERVER_CONFIG,
    JWT_CONFIG: exports.JWT_CONFIG,
    DATABASE_CONFIG: exports.DATABASE_CONFIG,
    LOGGING_CONFIG: exports.LOGGING_CONFIG
};
//# sourceMappingURL=index.js.map