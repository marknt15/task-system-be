// src/index.ts
import express from 'express';
import { config } from './config/env';
import taskRoutes from './routes/taskRoutes';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { APIGatewayProxyHandler } from 'aws-lambda';
import awsServerlessExpress from 'aws-serverless-express';
import dotenv from 'dotenv';
const app = express();

// dotenv.config({ path: `.env.${env}` });

// loads env variables from a .env file
dotenv.config();

// Middleware
app.use(express.json());
app.use(corsMiddleware);

// Swagger Setup
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Tasks API',
    version: '1.0.0',
    description: 'API for managing tasks in DynamoDB',
  },
  paths: {},
  components: {
    schemas: {
      Task: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          task: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['Todo', 'In Progress', 'Completed'] },
          created_at: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'task', 'description', 'status', 'created_at'],
      },
    },
  },
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api', taskRoutes);

// Error Handling
app.use(errorHandler);

// Lambda Handler
const server = awsServerlessExpress.createServer(app);
console.log('server', server);
// export const handler: APIGatewayProxyHandler = (event, context) =>
//   awsServerlessExpress.proxy(server, event, context);

// Local Development
if (process.env.NODE_ENV !== 'production') {
  const port = 5500;
  app.listen(port, () => {
    console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'dev'} mode`);
  });
}