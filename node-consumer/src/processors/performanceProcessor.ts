import { D_STUDENTS,D_ENROLLMENTS, F_ACADEMIC_PERFORMANCE } from "../models";
import { PerformanceMessage } from "../types";


const checkIfPerformanceExists = async (enrollment_id: number, subject_id: number) => {
    const studentInfo = await F_ACADEMIC_PERFORMANCE.findOne({
        where: { ENROLLMENT_ID: enrollment_id, SUBJECT_ID: subject_id },
        include: [
            {
                model: D_ENROLLMENTS,
                as: 'Enrollment',
                include: [
                    {
                        model: D_STUDENTS,
                        as: 'Student',
                        attributes: ['STUDENT_ID', 'NAME'],
                    },
                ],
            },
        ],
    });
    return studentInfo;
};

const isPerformanceAlreadyProcessed = async (performance: F_ACADEMIC_PERFORMANCE) => {
    if(performance.STATUS !=  -1){
        console.error(`[PERFORMANCE] Enrollment ${performance.ENROLLMENT_ID} and subject ${performance.SUBJECT_ID} is already processed`);
        return true;
    }else{
        return false;
    }
}

const getAllStudentEnrollments = async (studentID: number) => {
    const enrollments = await D_ENROLLMENTS.findAll({
        where: { STUDENT_ID: studentID },
        attributes: ['ENROLLMENT_ID'],
    });
    return enrollments;
}

const getStudentPerformancesOfSubject = async (enrollmentIds: number[], subjectID: number) => {
    const studentPerformances = await F_ACADEMIC_PERFORMANCE.findAll({
        where: { ENROLLMENT_ID: enrollmentIds, SUBJECT_ID: subjectID },
    });
    return studentPerformances;
}


const updatePerformance = async (enrollmentId: number, subjectId: number, grade: number, status: number) => {
    return await F_ACADEMIC_PERFORMANCE.update({
        FINAL_GRADE: grade,
        STATUS: status
    }, {
        where: { ENROLLMENT_ID: enrollmentId, SUBJECT_ID: subjectId },
    });
}

async function process(performanceMessage: PerformanceMessage) {
    // check if the enrollment exists
    const performanceExists = await checkIfPerformanceExists(performanceMessage.enrollment_id, performanceMessage.subject_id);
    if (!performanceExists) {
        console.error(`[PERFORMANCE] Enrollment with ID ${performanceMessage.enrollment_id} does not exist`);
        return;
    }

    // @ts-ignore
    const studentID = performanceExists.Enrollment.Student.STUDENT_ID;
    // get all enrollments of the student to be used to grab all performances of the student in the subject
    const studentEnrollments = await getAllStudentEnrollments(studentID);

    // check if the performance is already processed
    const isAlreadyProcessed = await isPerformanceAlreadyProcessed(performanceExists);
    if(!isAlreadyProcessed && studentEnrollments.length >= 1){

        // get all performances of the student in the subject
        const studentEnrollmentIds = studentEnrollments.map(enrollment => enrollment.ENROLLMENT_ID);
        const studentPerformances = await getStudentPerformancesOfSubject(studentEnrollmentIds, performanceMessage.subject_id);

        // check if the performances are more than one
        if (studentPerformances.length > 1) {
            console.info(`[PERFORMANCE] Student with ID ${studentID} has more than one performance in subject ${performanceMessage.subject_id}`);
            // order the performanceIds from ascending order (oldest to newest)
            const orderedPerformances = studentPerformances.sort((a, b) => a.ENROLLMENT_SUBJECT_ID - b.ENROLLMENT_SUBJECT_ID);

            // until we reach the last performance, update the status to 0 (Rejected) and with a random grade between 0 and 9.49
            for (let i = 0; i < orderedPerformances.length - 1; i++) {
                const performance = orderedPerformances[i];
                await updatePerformance(performance.ENROLLMENT_ID, performance.SUBJECT_ID, Math.floor(Math.random() * 9) + 1, 0);
                console.log(` > Performance with ID ${performance.ENROLLMENT_ID} updated`);
            }

            // update the last performance with the final grade and status
            const finalStatus = performanceMessage.status === "Approved" ? 1 : 0;
            const lastEnrollmentId = orderedPerformances[orderedPerformances.length - 1].ENROLLMENT_ID;
            const updatedPerformance = await updatePerformance(lastEnrollmentId, performanceMessage.subject_id, performanceMessage.grade, finalStatus);
            console.log(` > Performance with ID ${performanceMessage.enrollment_id} updated`);

        }else{
            const finalStatus = performanceMessage.status === "Approved" ? 1 : 0;
            const updatedPerformance = await updatePerformance(performanceMessage.enrollment_id, performanceMessage.subject_id, performanceMessage.grade, finalStatus);
            console.log(` > Performance with ID ${performanceMessage.enrollment_id} updated`);
        }

    }


}

export const PerformanceProcessor = {
    process
};
