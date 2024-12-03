import { D_ENROLLMENTS, D_STUDENTS, D_SUBJECTS, D_TIME, F_ACADEMIC_PERFORMANCE, F_BENCHMARK_SUCCESS } from "../models"
import { BenchmarkMessage } from "../types"

const getStudentInfo = async (studentId: number) => {
    return await D_STUDENTS.findOne({
        where: { STUDENT_ID: studentId }
    })
}

const getStudentEnrollments = async (studentId: number) => {
    return await D_ENROLLMENTS.findAll({
        where: { STUDENT_ID: studentId }
    })
}

const getCourseSubjects = async (courseId: number) => {
    return await D_SUBJECTS.findAll({
        where: { COURSE_ID: courseId }
    })
}

const getStudentPerformance = async (enrollmentIds: number[]) => {
    return await F_ACADEMIC_PERFORMANCE.findAll({
        where: { ENROLLMENT_ID: enrollmentIds }
    })
}

const getStudentBenchmark = async (studentId: number, courseId: number) => {
    return await F_BENCHMARK_SUCCESS.findAll({
        where: { STUDENT_ID: studentId, COURSE_ID: courseId }
    })
}

async function getOrCreateDateTime(year: number, month: number, day: number) {
    const existingDateTime = await D_TIME.findOne({
        where: {
            YEAR: year,
            MONTH: month,
            DAY: day,
        },
        });
    if (existingDateTime) return existingDateTime;

    const newDateTime = await D_TIME.create({
        DAY: day,
        MONTH: month,
        YEAR: year,
        SEMESTER: month < 7 ? 1 : 2,
        WEEKDAY: new Date(year, month, day).toLocaleString('en-US', { weekday: 'long' }),
        DATE: new Date(year, month, day),
    });

    //console.log(` > [TIME] created: ${year}-${month}-${day}`);
    return newDateTime;
}

const process = async (courseMessage: BenchmarkMessage) => {

    const studentExists = await getStudentInfo(courseMessage.student_id);
    if (!studentExists) {
        console.log(`> [BENCHMARK] Student with ID ${courseMessage.student_id} does not exist in the database`);
        return
    }

    const studentEnrollments  = await getStudentEnrollments(courseMessage.student_id);
    const studentCourseIds = studentEnrollments.map(enrollment => enrollment.COURSE_ID);
    const courseId = studentCourseIds[0];

    // check if the student is already enrolled in the course
    const courseSubjects = await getCourseSubjects(courseId);
    if(!courseSubjects){
        console.log(`> [BENCHMARK] The course with ID ${courseId} does not contain any subjects`);
        return;
    }

    const studentPerformance = await getStudentPerformance(studentEnrollments.map(enrollment => enrollment.ENROLLMENT_ID));
    if(!studentPerformance){
        console.log(`> [BENCHMARK] The student with ID ${courseMessage.student_id} has not completed any subjects`);
        return;
    }

    // check how many subjects the student has completed
    let completedSubjects = studentPerformance.filter(performance => performance.STATUS === 1);
    // filter for unique subjects ids only
    completedSubjects = completedSubjects.filter((subject, index, self) =>
        index === self.findIndex((t) => (
            t.SUBJECT_ID === subject.SUBJECT_ID
        ))
    );

    // check if the student has completed all the subjects in the course
    let courseConcluded = false;
    let academicYearOfCompletionId = null;
    if(completedSubjects.length >= courseSubjects.length){
        courseConcluded = true;
        console.log(`> [BENCHMARK] Student with ID ${courseMessage.student_id} has completed all the subjects in the course with ID ${courseId}`);
        // since the user has completed all the subjects, we need to find the academic year of completion
        const lastEnrollment = studentEnrollments[studentEnrollments.length - 1];
        academicYearOfCompletionId = lastEnrollment.ACADEMIC_YEAR_ID
    }

    const studentStartedWorkingOnField = courseMessage.is_working_on_field;
    let startedWorkingFieldTimeId = null;
    if(studentStartedWorkingOnField){
        console.log(`> [BENCHMARK] Student with ID ${courseMessage.student_id} has started working on the field`);
        const dateStartedWorking = new Date(courseMessage.started_working_on_field);
        const createDateTimeId = await getOrCreateDateTime(dateStartedWorking.getFullYear(), dateStartedWorking.getMonth(), dateStartedWorking.getDate());
        startedWorkingFieldTimeId = createDateTimeId.TIME_ID;

    }

    // create the verification call date
    const verificationCallDate = new Date(courseMessage.verification_call);
    const createVerificationCallTimeId = await getOrCreateDateTime(verificationCallDate.getFullYear(), verificationCallDate.getMonth(), verificationCallDate.getDate());

    // check if the user already has any benchmark created
    const studentBenchmark = await getStudentBenchmark(courseMessage.student_id, courseId);
    if(studentBenchmark.length > 0){
        console.log(`> [BENCHMARK] Student with ID ${courseMessage.student_id} already has a benchmark created`);
        return;
    }else{
        const newBenchmark = await F_BENCHMARK_SUCCESS.create({
            STUDENT_ID: courseMessage.student_id,
            COURSE_ID: courseId,
            ACADEMIC_YEAR_OF_COMPLETION_ID: academicYearOfCompletionId,
            VERIFICATION_TIME_DATE_ID: createVerificationCallTimeId.TIME_ID,
            WORKING_ON_FIELD_DATE_SINCE_ID: studentStartedWorkingOnField ? startedWorkingFieldTimeId : null,
            COURSE_CONCLUDED: courseConcluded,
            IS_WORKING_ON_THE_FIELD: studentStartedWorkingOnField,
        });

        console.log(`> [BENCHMARK] Benchmark for student with ID ${courseMessage.student_id} created`);
    }

}

export const BenchmarkProcessor = {
    process
}