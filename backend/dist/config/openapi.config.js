"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FrontRow API',
            version: '1.0.0',
            description: 'API documentation for the FrontRow application',
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
                },
            },
            schemas: {
                Event: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        title: {
                            type: 'string',
                        },
                        description: {
                            type: 'string',
                        },
                        date: {
                            type: 'string',
                            format: 'date',
                        },
                        start_time: {
                            type: 'string',
                            format: 'time',
                        },
                        end_time: {
                            type: 'string',
                            format: 'time',
                        },
                        total_tickets: {
                            type: 'integer',
                        },
                        available_tickets: {
                            type: 'integer',
                        },
                        price: {
                            type: 'number',
                            format: 'float',
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                        }
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                        first_name: {
                            type: 'string',
                        },
                        last_name: {
                            type: 'string',
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'user'],
                        },
                        street: {
                            type: 'string',
                        },
                        house_number: {
                            type: 'string',
                        },
                        postal_code: {
                            type: 'string',
                        },
                        city: {
                            type: 'string',
                        },
                    },
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        user_id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        event_id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        quantity: {
                            type: 'integer',
                        },
                        total_price: {
                            type: 'number',
                            format: 'float',
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Address: {
                    type: 'object',
                    properties: {
                        street: {
                            type: 'string',
                        },
                        house_number: {
                            type: 'string',
                        },
                        postal_code: {
                            type: 'string',
                        },
                        city: {
                            type: 'string',
                        },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        access_token: {
                            type: 'string',
                            description: 'JWT access token for API authentication'
                        }
                    }
                }
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: [
        './src/controllers/auth/*.controller.ts',
        './src/controllers/events/*.controller.ts',
        './src/controllers/orders/*.controller.ts',
        './src/controllers/*.controller.ts',
    ],
};
exports.default = options;
//# sourceMappingURL=openapi.config.js.map