import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './controllers/auth/auth.router';
import { eventsRouter } from './controllers/events/events.router';
import { ordersRouter } from './controllers/orders/orders.router';
import { openApiRouter } from './controllers/openapi/openapi.router';
import { addressCheckRouter } from './controllers/addressCheck.router';
import { errorHandler } from './middleware/errorHandler.middleware';
import { correlationIdMiddleware } from './middleware/correlationId.middleware';
import Logger from './utils/logger';
import { SERVER_CONFIG } from './config';

const app = express();
const PORT = SERVER_CONFIG.PORT;

app.use(correlationIdMiddleware);
app.use(cookieParser());
app.use(cors(
   {
        origin: SERVER_CONFIG.CORS_ORIGIN,
        credentials: true,
    }
));
app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/addressCheck', addressCheckRouter);
app.use('/api/v1/docs', openApiRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    Logger.info(`Server is running on port ${PORT}`);
});

export * from './repositories';