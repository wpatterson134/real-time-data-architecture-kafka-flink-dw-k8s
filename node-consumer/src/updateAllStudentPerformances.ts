import { D_ENROLLMENTS, D_STUDENTS, F_ACADEMIC_PERFORMANCE } from "./models";
import { faker } from '@faker-js/faker';

const getAllStudents = async () => {
    const students = await D_STUDENTS.findAll();
    return students;
}

const getAllStudentEnrollment = async (studentID: number) => {
    const enrollments = await D_ENROLLMENTS.findAll({
        where: { STUDENT_ID: studentID, ENROLLMENT_STATUS: 'Active' },
    });
    return enrollments;
}

const getStudentPerformanceSubjects = async (studentID: number) => {
    const subjectEnrollments = await F_ACADEMIC_PERFORMANCE.findAll({
        where: { STUDENT_ID: studentID },
    });
    return subjectEnrollments;
}

const mockRandomGrade = () => {
    const chancePercentage = faker.number.int({ min: 0, max: 100 })
    const isPositiveGrade = chancePercentage <= 98;

    const minGrade = isPositiveGrade ? 9.5 : 0;
    const maxGrade = isPositiveGrade ? 20 : 9.4;
    const grade = faker.number.float({ min: minGrade, max: maxGrade });
    return grade;
}

const handleNotActiveEnrollment = async (subjectsMap: Map<number, any[]>) => {
    // update all subjects with status -1 and final_grade null
    for(const [subjectID, performances] of subjectsMap){
        for(const performance of performances){
            await F_ACADEMIC_PERFORMANCE.update({
                FINAL_GRADE: null,
                STATUS: -1,
            }, {
                where: { ENROLLMENT_ID: performance.ENROLLMENT_ID, SUBJECT_ID: performance.SUBJECT_ID },
            });
        }
    }
}

const mockPositiveGrade = () => {
    return faker.number.float({ min: 9.5, max: 20 });
}

const mockNegativeGrade = () => {
    return faker.number.float({ min: 0, max: 9.4 });
}

const checkIfStudentIsEnrollmentInASubjectMoreThanOnce = (subjects: any[], subjectID: number) => {
    return subjects.filter((subject) => subject.SUBJECT_ID === subjectID).length > 1;
}

const getLastSubjectEnrollmentIdWhereSubjectIsPresent = (enrollments: any[], subjectID: number) => {
    let lastEnrollmentID = null
    for( const enrollment of enrollments){
        if(enrollment.SUBJECT_ID === subjectID){
            lastEnrollmentID = enrollment.ENROLLMENT_ID;
        }
    }
    return lastEnrollmentID;
}


const process = async () => {
    const students = await getAllStudents();
    for( const student of students){
        console.log(`Processing student with ID ${student.STUDENT_ID}`);
        let enrollments = await getAllStudentEnrollment(student.STUDENT_ID);
        let studentSubjects = await getStudentPerformanceSubjects(student.STUDENT_ID);

        // * ITERATE OVER ALL ENROLLMENTS
        for(const enrollment of enrollments){
            //  get the enrollments specific subjects
            const enrollmentSubjects = studentSubjects.filter((subject) => subject.ENROLLMENT_ID === enrollment.ENROLLMENT_ID);

            for(const subject of enrollmentSubjects){

                const lastSubjectEnrollmentId = getLastSubjectEnrollmentIdWhereSubjectIsPresent(studentSubjects, subject.SUBJECT_ID);
                const isLastEnrollment = lastSubjectEnrollmentId === enrollment.ENROLLMENT_ID;

                // * check if student is enrolled in a subject more than once and handle it
                if(isLastEnrollment){
                    const grade = mockRandomGrade();
                    const gradeStatus = grade >= 9.5 ? 1 : 0;

                    await F_ACADEMIC_PERFORMANCE.update({
                        FINAL_GRADE: grade,
                        STATUS: gradeStatus,
                    }, {
                        where: { ENROLLMENT_ID: subject.ENROLLMENT_ID, SUBJECT_ID: subject.SUBJECT_ID },
                    });
                }else{
                    const grade = mockNegativeGrade();
                    const gradeStatus = 0;

                    await F_ACADEMIC_PERFORMANCE.update({
                        FINAL_GRADE: grade,
                        STATUS: gradeStatus,
                    }, {
                        where: { ENROLLMENT_ID: subject.ENROLLMENT_ID, SUBJECT_ID: subject.SUBJECT_ID },
                    });
                }
            }
        }

        console.log(`Student with ID ${student.STUDENT_ID} processed`);
    }
}


process().then(() => {
    console.log("Finished processing all students");
}).catch((err) => {
    console.error("An error occurred while processing students", err);
});