import express, { Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import { parse } from 'path';

const router = express.Router();

const mockBenchmark = (studentid: number, academicyear: number) => {

    let is_working_on_field = false

    const random = Math.random();
    if (random < 0.9) {
        is_working_on_field = true;
    }

    const academic_year_obj = {
        year: academicyear,
        start_date: `${academicyear}-09-01`,
        end_date: `${academicyear + 1}-07-31`,
    };

    // 90% of the time, the student is working on the field AFTER the academic year
    let started_working_on_field = faker.date.between({
        from: `${academicyear + 1}-08-01`,
        to: `${academicyear + 2}-12-31`,
    });

    // 10% of the time, the student is working on the field DURING the academic year
    if (random < 0.1) {
        started_working_on_field = faker.date.between({
            from: `${academicyear-1}-09-01`,
            to: `${academicyear + 1}-07-31`,
        });
    }

    // call date after 2 years of the academic year
    const call_date = faker.date.between({
        from: `${academicyear + 2}-08-01`,
        to: `${academicyear + 3}-12-31`,
    });

    const result = {
        student_id: studentid,
        is_working_on_field,
        academic_year: academic_year_obj,
        started_working_on_field,
        verification_call: call_date,
    } as any;

    // if he is not working on the field, the verification call is null
    if (!is_working_on_field) {
        result.started_working_on_field = null;
    }

    return result;
};

// example: http://localhost:3001/api/benchmarks/student/1/year/2020
router.get('/student/:studentid/year/:academicyear', (req: Request, res: Response) => {
    const { studentid, academicyear } = req.params;
    res.json(mockBenchmark(parseInt(studentid), parseInt(academicyear)));
});

export default router;
