import { TIME } from "sequelize";
import { D_ACADEMIC_YEAR, D_COURSES, D_ENROLLMENTS, D_SOCIOECONOMIC_DATA, D_STUDENTS, D_STUDENT_DEMOGRAPHIC_DATA, D_SUBJECTS, F_ACADEMIC_PERFORMANCE } from "../models";
import { EnrollmentMessage } from "../types";

async function process(enrollmentMessages: EnrollmentMessage[]) {

    let studentIdUsed = 0;
    let academicYearsUser = []
    let academicYearsEnrollmentTypes = []
    let courseIdUsed = enrollmentMessages[0].enrollment.course_id;
    let firstEnrollmentYear = enrollmentMessages[0].academic_year.year;
    let enrollmentsIds = [] as any;

    for(let i = 0; i < enrollmentMessages.length;){
        const enrollmentMessage = enrollmentMessages[i];
        console.log('Processing Enrollment for:', enrollmentMessage.student.full_name);
        academicYearsEnrollmentTypes.push(enrollmentMessage.enrollment.enrollment_mode);
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

        studentIdUsed = studentID;
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
        academicYearsUser.push(academicYearId);

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

        enrollmentsIds.push(enrollment.ENROLLMENT_ID);

        console.log('Enrollment processed successfully.');
        i += 1;
    }

    // grab the course subjects
    const courseSubjects = await D_SUBJECTS.findAll({
        where: { COURSE_ID: courseIdUsed },
    });

    let subjects = courseSubjects
    let usedSubjects = [] as any
    const subjects_divided_by_year = {}

    // for years that / enrollment - enrollment_mode
    for (let index = 0; index < academicYearsEnrollmentTypes.length; index++) {
        const enrollment_type = academicYearsEnrollmentTypes[index];
        const year = academicYearsUser[index] as number;

        const availableSubjects = subjects.filter(subject => subject.YEAR <= (index + 1));
        // remove the available subjects the ones on the usedSubjects
        const availableSubjectsFiltered = availableSubjects.filter(subject => !usedSubjects.includes(subject.SUBJECT_ID));

        // if the enrollment type is full-time and the year is the first year , max subjects is 6 per semester (12 total)
        // if the enrollment type is full-time and the year is not first year , max subjects increases by 2 each year
        // if the enrollment type is not full-time and the year is the first year , max subjects is 3
        // the first year can only contain subjects from the first year
        // the second year can only contain subjects from the second year and below
        // the third year can only contain subjects from the third year and below

        // check if the available subjectsFilteres is empty
        if (availableSubjectsFiltered.length <= 0) {
            console.log('No subjects available for the year:', year);
            // were going to mock that the studnet didnt pass some subjects
            // grab some 3/4 subjects from a random previous year
            let randomPreviousYear = Math.floor(Math.random() * (index - 1) + 1);
            const previousYear = randomPreviousYear;
            const minSubjects = 2;
            const maxSubjects = 7;
            const randomSubjects = Math.floor(Math.random() * (maxSubjects - minSubjects + 1) + minSubjects);
            // @ts-ignore
            let previousYearSubjects = subjects_divided_by_year[previousYear];
            // randomize the subjects of previous year
            previousYearSubjects = previousYearSubjects.sort(() => Math.random() - 0.5);
            const previousYearSubjectsFiltered = previousYearSubjects.slice(0, randomSubjects);
            // @ts-ignore
            subjects_divided_by_year[year] = previousYearSubjectsFiltered.map(subject => {
                return {
                    SUBJECT_ID: subject.SUBJECT_ID,
                    SUBJECT_NAME: subject.SUBJECT_NAME,
                    ECTS: subject.ECTS,
                    SUBJECT_TYPE: subject.SUBJECT_TYPE,
                    SEMESTER: subject.SEMESTER,
                    YEAR: subject.YEAR,
                }
            });
            continue;
        }

        if (enrollment_type === 'Full-time') {
            if (index === 0) {
                const firstYearSubjects = availableSubjectsFiltered.filter(subject => subject.YEAR === 1);
                const firstYearSubjectsFiltered = firstYearSubjects.slice(0, 16);
                usedSubjects.push(...firstYearSubjectsFiltered.map(subject => subject.SUBJECT_ID));
                // @ts-ignore
                subjects_divided_by_year[year] = firstYearSubjectsFiltered.map(subject => {
                    return {
                        SUBJECT_ID: subject.SUBJECT_ID,
                        SUBJECT_NAME: subject.SUBJECT_NAME,
                        ECTS: subject.ECTS,
                        SUBJECT_TYPE: subject.SUBJECT_TYPE,
                        SEMESTER: subject.SEMESTER,
                        YEAR: subject.YEAR,
                    }
                });
            } else {
                const yearSubjects = availableSubjectsFiltered.filter(subject => subject.YEAR <= (index + 1));
                const yearSubjectsFiltered = yearSubjects.slice(0, 16 + (2 * index));
                usedSubjects.push(...yearSubjectsFiltered.map(subject => subject.SUBJECT_ID));
                // @ts-ignore
                subjects_divided_by_year[year] = yearSubjectsFiltered.map(subject => {
                    return {
                        SUBJECT_ID: subject.SUBJECT_ID,
                        SUBJECT_NAME: subject.SUBJECT_NAME,
                        ECTS: subject.ECTS,
                        SUBJECT_TYPE: subject.SUBJECT_TYPE,
                        SEMESTER: subject.SEMESTER,
                        YEAR: subject.YEAR,
                    }
                });
            }
        } else {
            const yearSubjects = availableSubjectsFiltered.filter(subject => subject.YEAR === (index + 1));
            const yearSubjectsFiltered = yearSubjects.slice(0, 8);
            usedSubjects.push(...yearSubjectsFiltered.map(subject => subject.SUBJECT_ID));
            // @ts-ignore
            subjects_divided_by_year[year] = yearSubjectsFiltered.map(subject => {
                return {
                    SUBJECT_ID: subject.SUBJECT_ID,
                    SUBJECT_NAME: subject.SUBJECT_NAME,
                    ECTS: subject.ECTS,
                    SUBJECT_TYPE: subject.SUBJECT_TYPE,
                    SEMESTER: subject.SEMESTER,
                    YEAR: subject.YEAR,
                }
            });
        }

    }

    // console.log(academicYearsEnrollmentTypes)
    // console.log(academicYearsUser)
    // console.log('Subjects divided by year:')
    // console.log(subjects_divided_by_year);

    // based on the subjects_divided_by_year create the enrollment for the subjects
    let indexYear = 0;

    // check if the user already have enrollments for the academic year
    const studentAlreadyEnrolled = await F_ACADEMIC_PERFORMANCE.findAll({
        where: { ENROLLMENT_ID: enrollmentsIds[indexYear] },
    });

    if (studentAlreadyEnrolled.length > 0) {
        console.log('Student already enrolled in the subjects for this academic year.');
        return;
    }else{
        Object.keys(subjects_divided_by_year).forEach(async (year) => {
            // @ts-ignore
            const subjectsToEnroll = subjects_divided_by_year[year];
            let subjectsYear = (firstEnrollmentYear - 1 + parseInt(year));

            // Selected the academic year_id based on the subjectsYear
            const academicYear = await D_ACADEMIC_YEAR.findOne({
                where: { ACADEMIC_YEAR: subjectsYear },
            });

            subjectsToEnroll.forEach(async (subject: any) => {
                F_ACADEMIC_PERFORMANCE.create({
                    ENROLLMENT_ID: enrollmentsIds[indexYear],
                    SUBJECT_ID : subject.SUBJECT_ID,
                    TIME_ID : null,
                    FINAL_GRADE: null,
                    STATUS: -1,
                });
            });

            indexYear += 1;
        });
        console.log('Enrollment on subjects processed successfully.');
    }


}


const EnrollmentProcessor = {
    process
};

export { EnrollmentProcessor };