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
/**
 * @swagger
 * /api/enrollments/course/{courseid}/student/{studentid}/year/{academicyear}:
 *   get:
 *     summary: Get mock enrollment data
 *     description: Retrieves mock enrollment data for a specific student, course, and academic year.
 *     parameters:
 *       - in: path
 *         name: courseid
 *         required: true
 *         description: The course ID.
 *         schema:
 *           type: integer
 *           example: 101
 *       - in: path
 *         name: studentid
 *         required: true
 *         description: The student ID.
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: academicyear
 *         required: true
 *         description: The academic year.
 *         schema:
 *           type: integer
 *           example: 2024
 *     responses:
 *       200:
 *         description: Mock enrollment data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 academic_year:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: integer
 *                     start_date:
 *                       type: string
 *                       format: date
 *                     end_date:
 *                       type: string
 *                       format: date
 *                 student:
 *                   type: object
 *                   description: The student details.
 *                 socioeconomics:
 *                   type: object
 *                   properties:
 *                     socioeconomic_status:
 *                       type: string
 *                     family_income:
 *                       type: integer
 *                     family_size:
 *                       type: integer
 *                     responsible_parent_education:
 *                       type: string
 *                     responsible_parent_employment:
 *                       type: string
 *                     has_internet_access:
 *                       type: string
 *                     has_computer_access:
 *                       type: string
 *                     has_smartphone_access:
 *                       type: string
 *                 demographics:
 *                   type: object
 *                   properties:
 *                     marital_status:
 *                       type: string
 *                     transportation:
 *                       type: string
 *                     health_insurance:
 *                       type: string
 *                     health_condition:
 *                       type: string
 *                 enrollment:
 *                   type: object
 *                   properties:
 *                     enrollment_mode:
 *                       type: string
 *                     enrollment_date:
 *                       type: string
 *                       format: date
 *                     course_id:
 *                       type: integer
 *                     enrollment_status:
 *                       type: string
 *                     financial_status:
 *                       type: object
 *                       properties:
 *                         total_fees:
 *                           type: integer
 *                         paid:
 *                           type: integer
 *                         pending:
 *                           type: integer
 *                         payment_due_date:
 *                           type: string
 *                           format: date
 *                         payment_status:
 *                           type: string
 *       500:
 *         description: Error retrieving enrollment data.
 */
app.use('/api/enrollments', EnrollmentRouter);
/**
 * @swagger
 * /api/courses/{courseid}:
 *   get:
 *     summary: Get course by ID
 *     parameters:
 *       - in: path
 *         name: courseid
 *         required: true
 *         description: The course ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The course data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 course:
 *                   type: object
 *                   properties:
 *                     course_id:
 *                       type: integer
 *                     course_name:
 *                       type: string
 *                     course_code:
 *                       type: string
 *                     course_description:
 *                       type: string
 *                     course_credits:
 *                       type: integer
 *                     field_of_study:
 *                       type: string
 *                     course_type:
 *                       type: string
 *                     course_duration_years:
 *                       type: integer
 *                     subjects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           subject_id:
 *                             type: integer
 *                           subject_name:
 *                             type: string
 *                           subject_code:
 *                             type: string
 *                           subject_description:
 *                             type: string
 *                           subject_type:
 *                             type: string
 *                           subject_credits:
 *                             type: integer
 *                           first_semester:
 *                             type: integer
 *                           second_semester:
 *                             type: integer
 *                           year:
 *                             type: integer
 */
app.use('/api/courses', CourseRouter);
/**
 * @swagger
 * /api/performance/enrollment/{enrollmentid}/subject/{subjectid}:
 *   get:
 *     summary: Get performance data by enrollment and subject
 *     parameters:
 *       - in: path
 *         name: enrollmentid
 *         required: true
 *         description: The enrollment ID
 *         schema:
 *           type: integer
 *       - in: path
 *         name: subjectid
 *         required: true
 *         description: The subject ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The performance data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enrollment_id:
 *                   type: integer
 *                 subject_id:
 *                   type: integer
 *                 grade:
 *                   type: number
 *                 final_grade:
 *                   type: integer
 *                 status:
 *                   type: string
 *               example:
 *                 enrollment_id: 1
 *                 subject_id: 1
 *                 grade: 15.5
 *                 final_grade: 16
 *                 status: Approved
 *       500:
 *         description: Error getting performance data
 */
app.use('/api/performance', PerformanceRouter);
/**
 * @swagger
 * /api/benchmarks/student/{studentid}/year/{academicyear}:
 *   get:
 *     summary: Get benchmark for a student in a given academic year
 *     parameters:
 *       - in: path
 *         name: studentid
 *         required: true
 *         description: The student ID
 *         schema:
 *           type: integer
 *       - in: path
 *         name: academicyear
 *         required: true
 *         description: The academic year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Benchmark for the student in the academic year
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 student_id:
 *                   type: integer
 *                 is_working_on_field:
 *                   type: boolean
 *                 academic_year:
 *                   type: object
 *                   properties:
 *                     year:
 *                       type: integer
 *                     start_date:
 *                       type: string
 *                     end_date:
 *                       type: string
 *                 started_working_on_field:
 *                   type: string
 *                 verification_call:
 *                   type: string
 */
app.use('/api/benchmarks', BenchmarkRouter);

app.listen(3001, async () => {
  console.log('Server is running on http://localhost:3001');
  console.log('Swagger docs are available at http://localhost:3001/api-docs');
});
