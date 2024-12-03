import { F_ACADEMIC_PERFORMANCE } from "../models";
import { PerformanceMessage } from "../types";

async function process(performanceMessage: PerformanceMessage) {
    // check if the enrollment exists
    const performanceExists = await F_ACADEMIC_PERFORMANCE.findOne({
        where: { ENROLLMENT_ID: performanceMessage.enrollment_id, SUBJECT_ID: performanceMessage.subject_id },
    });

    if (!performanceExists) {
        console.error(`[PERFORMANCE] Enrollment with ID ${performanceMessage.enrollment_id} does not exist`);
        return;
    }

    if(performanceExists.STATUS !=  -1){
        console.error(`[PERFORMANCE] Enrollment ${performanceMessage.enrollment_id} and subject ${performanceMessage.subject_id} is already processed`);
        return;
    }else{
        const finalStatus = performanceMessage.status === "Approved" ? 1 : 0;

        // create the time record in the database if does not exist based on
        //performanceMessage./

        await F_ACADEMIC_PERFORMANCE.update({
            FINAL_GRADE: performanceMessage.grade,
            STATUS: finalStatus
        }, {
            where: { ENROLLMENT_ID: performanceMessage.enrollment_id, SUBJECT_ID: performanceMessage.subject_id },
        });
        console.log(`Performance with ID ${performanceMessage.enrollment_id} updated`);
    }



}

export const PerformanceProcessor = {
    process
};
