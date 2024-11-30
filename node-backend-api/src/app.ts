import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import * as dotenv from 'dotenv';
import { collectDefaultMetrics, Registry, Counter } from 'prom-client';
import EnrollmentRouter from './app/routers/enrollment';
import CourseRouter from './app/routers/course';
import PerformanceRouter from './app/routers/performance';
import BenchmarkRouter from './app/routers/benchmark';

dotenv.config();
const register = new Registry();
collectDefaultMetrics({ register });

const requestTimestampCounter = new Counter({
  name: 'api_requests_timestamp_total',
  help: 'Timestamp of each request',
  labelNames: ['method', 'route', 'status', 'timestamp'],
});
register.registerMetric(requestTimestampCounter);
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mock API with Redis Cache',
      version: '1.0.0',
      description: 'A simple Node.js API with Swagger documentation and Redis Cache integration',
    },
    servers: [{ url: 'http://localhost:3001' }],
  },
  apis: ['./src/app.ts'], // Adjust the path as necessary
};
const specs = swaggerJsdoc(swaggerOptions);

const app = express();
app.use(express.json());

app.use((req: Request, res: Response, next) => {
  const timestamp = Date.now();
  res.on('finish', () => {
    console.log('Request logged:', req.method, req.url, res.statusCode);

    requestTimestampCounter.labels(req.method, req.route?.path || req.url, res.statusCode.toString(), timestamp.toString()).inc();
  });
  next();
});
app.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/enrollments', EnrollmentRouter);
app.use('/api/courses', CourseRouter);
app.use('/api/performance', PerformanceRouter);
app.use('/api/benchmarks', BenchmarkRouter);

app.listen(3001, async () => {
  console.log('Server is running on http://localhost:3001');
  console.log('Swagger docs are available at http://localhost:3001/api-docs');
});
