import express, { Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import RedisClient from '../../infra/redis';

const router = express.Router();

const mockPerformanceData = (enrollmentid: number, subjectid: number) => {
    const result = {
        enrollment_id : enrollmentid,
        subject_id : subjectid,
        grade : faker.number.float({ min: 0, max: 20 }),
        final_grade : 0,
        status : 'Failed',
    } as any;

    if (result.grade <= 9.5) {
        result.grade = faker.number.float({ min: 0, max: 20 });
        result.status = 'Failed';
    }

    result.grade = parseFloat(result.grade.toFixed(2));


    if (result.grade >= 9.5) {
        result.status = 'Approved';
    }
    // if the grade is greater than 9.5, the student is approved

    // automatically convert to a integer the final grade
    result.final_grade = Math.round(result.grade);

    return result;
};

// ex:  http://localhost:3001/api/performance/enrollment/1/subject/1
router.get('/enrollment/:enrollmentid/subject/:subjectid', async (req: any, res: any) => {
    try {
        const { enrollmentid, subjectid } = req.params;
        const intenrollmentid = parseInt(enrollmentid);
        const intsubjectid = parseInt(subjectid);
    
        if (isNaN(intenrollmentid) || isNaN(intsubjectid)) {
            return res.status(400).json({ error: 'Invalid enrollment ID or subject ID' });
        }
        const bussiness_key = `performance-${intenrollmentid}-${intsubjectid}`;
        const perf_data = await RedisClient.get(bussiness_key)
        if (perf_data) {
            return res.json(JSON.parse(perf_data));
        } else {
          const mockperf = mockPerformanceData(parseInt(enrollmentid), parseInt(subjectid));
          await RedisClient.set(bussiness_key, JSON.stringify(mockperf));
          return res.json(mockperf);
        }
      } catch (error) {
          return res.status(500).json({ error: "Internal server error", details: error });
      }
});

export default router;
