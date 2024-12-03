import { D_ACADEMIC_YEAR, D_COURSES, D_ENROLLMENTS, D_SOCIOECONOMIC_DATA, D_STUDENTS, D_STUDENT_DEMOGRAPHIC_DATA } from "../models";
import { EnrollmentMessage } from "../types";

async function process(enrollmentMessages: EnrollmentMessage[]) {

    for(let i = 0; i < enrollmentMessages.length;){
        const enrollmentMessage = enrollmentMessages[i];
        console.log('Processing Enrollment for:', enrollmentMessage.student.full_name);

        // Check if the course exists in the database
        const existingCourse = await D_COURSES.findOne({
            where: { COURSE_ID: enrollmentMessage.enrollment.course_id },
        });

        if (existingCourse == null) {
            console.log('Course not found in the database.');
            return;
        }

        // Check if the student exists in the database
        const existingStudent = await D_STUDENTS.findOne({
            where: { STUDENT_ID: enrollmentMessage.student.student_id },
        });

        let studentID = 0;

        if (existingStudent != null) {
            console.log('Student already exists in the database.');
            studentID = existingStudent.STUDENT_ID;
        }else{
            console.log('Student ' + enrollmentMessage.student.full_name + " not found in the database, creating socioEconomic, demographic data, and student.");
            const socioEconomicData = enrollmentMessage.socioeconomics;
            const demographicData = enrollmentMessage.demographics;
            const ScholarshipStatus = enrollmentMessage.financial_aid.financial_aid_status != 'None' ? 'Scholarship' : 'None';

            // CREATE THE SOCIOECONOMIC AND DEMOGRAPHIC DATA
            const socioeconomicID = await D_SOCIOECONOMIC_DATA.create({
                SCHOLARSHIP_STATUS : ScholarshipStatus,
                INCOME : socioEconomicData.working_status.is_working ? socioEconomicData.working_status.job_income : null,
                FAMILY_INCOME : socioEconomicData.family_income,
                RESPONSABLE_PARENT_EDUCATION_LEVEL : socioEconomicData.responsible_parent_education,
                RESPONSABLE_PARENT_OCCUPATION : socioEconomicData.responsible_parent_ocupation,
                HAS_INTERNET_ACCESS : socioEconomicData.has_internet_access ? 1 : 0,
                HAS_COMPUTER_ACCESS : socioEconomicData.has_computer_access ? 1 : 0,
                WORKING_STATUS : socioEconomicData.working_status.is_working ? "Student-Worker" : "Student",
            });

            const demographicID = await D_STUDENT_DEMOGRAPHIC_DATA.create({
                DATE_OF_BIRTH : enrollmentMessage.student.date_of_birth,
                NATIONALITY : enrollmentMessage.student.identification.nacionality,
                MARITAL_STATUS : demographicData.marital_status,
                GENDER : enrollmentMessage.student.identification.gender,
                ETHNICITY: demographicData.ethnicity,
                CITY_OF_BIRTH : enrollmentMessage.student.identification.city_of_birth,
                COUNTRY_OF_BIRTH : enrollmentMessage.student.identification.city_of_birth,
                CURRENT_RESIDENCE_TYPE : demographicData.current_residence_type,
            });
            // CREATE THE STUDENT
            const studentCreation = await D_STUDENTS.create({
                STUDENT_ID : enrollmentMessage.student.student_id,
                NAME : enrollmentMessage.student.full_name,
                SOCIOECONOMIC_ID : socioeconomicID.SOCIOECONOMIC_ID,
                DEMOGRAPHIC_ID : demographicID.STUDENT_DEMOGRAPHIC_ID,
            });
            studentID = studentCreation.STUDENT_ID;

            console.log('Student created successfully.');
        }

        const academicYearIdExists = await D_ACADEMIC_YEAR.findOne({
            where: { ACADEMIC_YEAR: enrollmentMessage.academic_year.year.toString() },
        });

        let academicYearId = academicYearIdExists != null ? academicYearIdExists.ACADEMIC_YEAR_ID : null;
        if (!academicYearIdExists) {
            // CREATE THE ACADEMIC YEAR
            const academicYear = await D_ACADEMIC_YEAR.create({
                ACADEMIC_YEAR: enrollmentMessage.academic_year.year,
                START_DATE: enrollmentMessage.academic_year.start_date,
                END_DATE: enrollmentMessage.academic_year.end_date,
            });

            console.log('Academic year created successfully.');
            academicYearId = academicYear.ACADEMIC_YEAR_ID;
        }

        // Check the enrollment status
        const studentAlreadyEnrolled = await D_ENROLLMENTS.findAll({
            where: { STUDENT_ID: studentID, COURSE_ID: existingCourse.COURSE_ID },
        });

        const studentEnrollment = enrollmentMessage.enrollment
        // check if the enrollment is present on the studentAlreadyEnrolled
        const studentAlreadyEnrolledInYear = studentAlreadyEnrolled.filter(enrollment => enrollment.ACADEMIC_YEAR_ID === enrollmentMessage.academic_year.year);
        if (studentAlreadyEnrolledInYear.length > 0) {
            console.log('Student already enrolled in the course for this academic year.');
            return;
        }

        // CREATE THE FINANCIAL STATUS FOR THE ENROLLMENT
        // const financialStatus = enrollmentMessage.financial_aid;
        // const financialStatusID = await D_FINANCIAL_STATUS.create({
        //     FINANCIAL_AID_STATUS : financialStatus.financial_aid_status,
        //     TOTAL_FEES : financialStatus.total_fees,
        //     TOTAL_PAID : financialStatus.total_paid,
        //     TOTAL_OUTSTANDING : financialStatus.total_outstanding,
        // });

        // CREATE THE ENROLLMENT
        const enrollment = await D_ENROLLMENTS.create({
            STUDENT_ID: studentID,
            COURSE_ID: existingCourse.COURSE_ID,
            ACADEMIC_YEAR_ID: academicYearId,
            FINANCIAL_STATUS_ID: null,
            ENROLLMENT_MODE: studentEnrollment.enrollment_mode,
            ENROLLMENT_STATUS: studentEnrollment.enrollment_status,
            ENROLLMENT_DATE: new Date(studentEnrollment.enrollment_date),
            TUITION_FEES: studentEnrollment.financial_status.total_fees,
        });

        console.log('Enrollment processed successfully.');
        i += 1;
    }

}


const EnrollmentProcessor = {
    process
};

export { EnrollmentProcessor };