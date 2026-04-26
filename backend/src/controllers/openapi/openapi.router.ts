import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import openApiConfig from '../../config/openapi.config';

export const openApiRouter = Router();

// Generate specs dynamically to ensure they're always up-to-date
const specs = swaggerJsdoc(openApiConfig);

openApiRouter.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Use swaggerUi.serve and setup with custom options for better compatibility
openApiRouter.use('/', 
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FrontRow API Documentation'
  })
);