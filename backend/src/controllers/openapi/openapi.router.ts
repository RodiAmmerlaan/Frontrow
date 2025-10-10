import { Router } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import openApiConfig from '../../config/openapi.config';

const specs = swaggerJsdoc(openApiConfig);

export const openApiRouter = Router();

openApiRouter.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

openApiRouter.use('/', swaggerUi.serve, swaggerUi.setup(specs));