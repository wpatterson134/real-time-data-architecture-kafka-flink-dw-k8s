import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { createClient } from 'redis';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
dotenv.config();

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mock API with Redis Cache',
      version: '1.0.0',
      description: 'A simple Node.js API with Swagger documentation and Redis Cache integration',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./src/app.ts'], // Adjust the path as necessary
};

const specs = swaggerJsdoc(swaggerOptions);

const app = express();
app.use(express.json());

console.log('REDIS_HOST:', process.env.REDIS_HOST);
console.log('REDIS_PORT:', process.env.REDIS_PORT);
console.log('REDIS_PASSWORD:', process.env.REDIS_PASSWORD);

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || '6379';
const redisPassword = process.env.REDIS_PASSWORD || '';

const redisClient = createClient({
  socket: {
    host: redisHost,
    port: Number(redisPort),
  },
  password: redisPassword,
});

redisClient.connect().catch(console.error);

// API route for creating a user
/**
 * @swagger
 * /mock/user:
 *   post:
 *     summary: Create mock user data
 *     description: Generates mock user data and stores it in Redis cache
 *     requestBody:
 *       description: User information (if needed)
 *       required: false
 *     responses:
 *       200:
 *         description: Mock user data created and cached
 */
app.post('/mock/user', async (req: Request, res: Response) => {
    const mockData = generateMockUser();

    const cacheKey = mockData.id.toString();
    const ttl = 300; // 5 minutes
    await redisClient.setEx(cacheKey, ttl, JSON.stringify(mockData));

    res.send(mockData);
});

// Get user data from Redis cache
app.get('/mock/user/:id', async (req: Request, res: Response) => {
    const userId = req.params.id;
    const userData = await redisClient.get(userId);

    if (!userData) {
      res.status(404).send('User not found');
    } else {
      res.send(JSON.parse(userData));
    }
});

const generateMockUser = () => {
    return {
      id: faker.seed(),
      name: faker.name.firstName() + ' ' + faker.name.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: {
        street: faker.address.streetAddress(),
        city: faker.address.city(),
        state: faker.address.state(),
        zip: faker.address.zipCode(),
      },
    };
};

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
  console.log('Swagger docs are available at http://localhost:3000/api-docs');
});
