import express, { Request, Response } from 'express';
import { faker } from '@faker-js/faker';

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
router.get('/enrollment/:enrollmentid/subject/:subjectid', (req: Request, res: Response) => {
    const { enrollmentid, subjectid } = req.params;
    res.json(mockPerformanceData(parseInt(enrollmentid), parseInt(subjectid)));
});

export default router;
