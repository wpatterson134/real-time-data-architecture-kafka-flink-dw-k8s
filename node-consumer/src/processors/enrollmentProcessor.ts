import {
    D_ACADEMIC_YEAR,
    D_COURSES,
    D_ENROLLMENTS,
    D_ENROLLMENT_FINANCIAL_STATUS,
    D_SOCIOECONOMIC_DATA,
    D_STUDENTS,
    D_STUDENT_DEMOGRAPHIC_DATA,
    D_SUBJECTS,
    D_TIME,
    F_ACADEMIC_PERFORMANCE
  } from "../models";
  import { EnrollmentMessage } from "../types";

  async function process(enrollmentMessages: EnrollmentMessage[]) {
    if (enrollmentMessages.length === 0) return;

    const enrollmentsList = [] as D_ENROLLMENTS[];
    // 2020, 2021, 2022, ...
    const academicYearsProcessed = [];
    const courseID = enrollmentMessages[0].enrollment.course_id;

    for (const enrollmentMessage of enrollmentMessages) {
      const { enrollment, student, socioeconomics, demographics, academic_year, financial_aid } = enrollmentMessage;

      // Verificar curso
      const existingCourse = await D_COURSES.findOne({ where: { COURSE_ID: enrollment.course_id } });
      if (!existingCourse) return;

      // Verificar estudante
      let studentID = await getOrCreateStudent(student, socioeconomics, demographics);

      // Verificar ou criar ano acadêmico
      const academicYearObj = await getOrCreateAcademicYear(academic_year);
      academicYearsProcessed.push(academicYearObj.ACADEMIC_YEAR);

      // Verificar inscrição do estudante no curso no ano acadêmico
      const studentEnrollmentObj = await getOrCreateEnrollment(financial_aid, enrollment, studentID, existingCourse.COURSE_ID, academicYearObj.ACADEMIC_YEAR_ID);

        // verifica se ja tem inscricao nas disciplinas (F_ACADEMIC_PERFORMANCE)
        const alreadyHasSubjects = await checkIfSubjectFerformanceEnrollmentExists(studentEnrollmentObj.ENROLLMENT_ID, studentID, existingCourse.COURSE_ID, academicYearObj);
        if (alreadyHasSubjects) {
            console.log(`[ENROLLMENT] Student ${studentID} already has subjects for course ${existingCourse.COURSE_ID} in year ${academicYearObj.ACADEMIC_YEAR_ID}`);
            continue;
        }else{
            // se nao tiver inscricao nas disciplinas, adiciona o id da inscricao no array, para ser processado posteriormente
            enrollmentsList.push(studentEnrollmentObj);
        }

    }

    // Cria dados de desempenho acadêmico
    await createAdemicPerformanceData(courseID, enrollmentsList);

    return;
}

async function createAdemicPerformanceData(courseID: number, enrollmentsList: D_ENROLLMENTS[]){
    const courseSubjects = await D_SUBJECTS.findAll({
        where: {
            COURSE_ID: courseID,
        },
    });

    if(courseSubjects.length === 0) return;

    const totalEnrollmentsForStudent = enrollmentsList.length;
    const alreadyAssignedSubjectIds = [] as any;

    let currentYearEnrollment = 1;
    for (const enrollmentInfo of enrollmentsList) {


        let possibleSubjectsOfCurrentYear = courseSubjects.filter((subject) => {
            return subject.YEAR <= currentYearEnrollment;
        });

        // remove as disciplinas que ja foram atribuidas do possibleSubjectsOfCurrentYear
        let filteredSubjectsOfCurrentYear = possibleSubjectsOfCurrentYear.filter((subject) => {
            return !alreadyAssignedSubjectIds.includes(subject.SUBJECT_ID);
        });

        // atribui disciplinas para o estudante baseado no enrollment type
        let assignSubjectsNumber = enrollmentInfo.ENROLLMENT_MODE === 'Full-time' ? 14 : 7;

        // reordena as disciplinas aleatoriamente
        filteredSubjectsOfCurrentYear = filteredSubjectsOfCurrentYear.sort(() => Math.random() - 0.5);

        const currentAcademicYear = await D_ACADEMIC_YEAR.findOne({
            where: {
                ACADEMIC_YEAR_ID: enrollmentInfo.ACADEMIC_YEAR_ID,
            },
        });

        if(currentAcademicYear){
            if(filteredSubjectsOfCurrentYear.length > 0){
                // pega as primeiras disciplinas baseado no assignSubjectsNumber
                // caso o length do filteredSubjectsOfCurrentYear seja menor que assignSubjectsNumber, pega todas as disciplinas
                if(filteredSubjectsOfCurrentYear.length < assignSubjectsNumber){
                    assignSubjectsNumber = filteredSubjectsOfCurrentYear.length;
                }
                const subjectsToAssign = filteredSubjectsOfCurrentYear.slice(0, assignSubjectsNumber);
    
                // adiciona as disciplinas ja atribuidas no alreadyAssignedSubjectIds
                subjectsToAssign.forEach((subject) => {
                    alreadyAssignedSubjectIds.push(subject.SUBJECT_ID);
                });
    
                // cria os dados de desempenho academico
                for (const subject of subjectsToAssign) {
                    // data aleatoria baseada no currentAcademicYear
                    const randomDate = new Date(currentAcademicYear.START_DATE.getTime() + Math.random() * (currentAcademicYear.END_DATE.getTime() - currentAcademicYear.START_DATE.getTime()));
                    const dateTime = await getOrCreateDateTime(randomDate.getFullYear(), randomDate.getMonth(), randomDate.getDate());

                    await F_ACADEMIC_PERFORMANCE.create({
                        ENROLLMENT_ID: enrollmentInfo.ENROLLMENT_ID,
                        SUBJECT_ID: subject.SUBJECT_ID,
                        COURSE_ID: courseID,
                        ACADEMIC_YEAR_ID: currentAcademicYear.ACADEMIC_YEAR_ID,
                        STUDENT_ID: enrollmentInfo.STUDENT_ID,
                        TIME_ID: dateTime.TIME_ID,
                        FINAL_GRADE: null,
                        STATUS: -1,
                    });
                }
    
            }else{
                // ! REPETENTE - NAO TEM DISCIPLINAS PARA O ANO ()
                // vai buscar dados aleatorios de disciplinas ja atribuidas
                // disciplinas a repetir aleatoriamente (1 a 8)
                const subjectsToRepeat = alreadyAssignedSubjectIds.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 8) + 1);
                for (const subjectId of subjectsToRepeat) {
                    // data aleatoria baseada no currentAcademicYear
                    const randomDate = new Date(currentAcademicYear.START_DATE.getTime() + Math.random() * (currentAcademicYear.END_DATE.getTime() - currentAcademicYear.START_DATE.getTime()));
                    const dateTime = await getOrCreateDateTime(randomDate.getFullYear(), randomDate.getMonth(), randomDate.getDate());
    
                    await F_ACADEMIC_PERFORMANCE.create({
                        ENROLLMENT_ID: enrollmentInfo.ENROLLMENT_ID,
                        SUBJECT_ID: subjectId,
                        COURSE_ID: courseID,
                        ACADEMIC_YEAR_ID: currentAcademicYear.ACADEMIC_YEAR_ID,
                        STUDENT_ID: enrollmentInfo.STUDENT_ID,
                        TIME_ID: dateTime.TIME_ID,
                        FINAL_GRADE: null,
                        STATUS: -1,
                    });
                }
            }
        }else{
            console.log(`[ACADEMICYEAR] Year ${enrollmentInfo.ACADEMIC_YEAR_ID} not found`);
        }

        currentYearEnrollment++;
    }
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

async function checkIfSubjectFerformanceEnrollmentExists(enrollmentId: number, studentID: number, courseID: number, academicYearObject: any): Promise<boolean>{
    const subjects = await F_ACADEMIC_PERFORMANCE.findAll({
        where: {
            ENROLLMENT_ID: enrollmentId,
        },
    });
    if (subjects.length > 0) return true;
    return false;
}

 async function getOrCreateEnrollment(financial_aid: any, enrollment: any, studentID: number, courseID: number, academicYearId: number) {
    const existingEnrollment = await D_ENROLLMENTS.findOne({
      where: {
        STUDENT_ID: studentID,
        COURSE_ID: courseID,
        ACADEMIC_YEAR_ID: academicYearId,
      },
    });
    if (existingEnrollment) return existingEnrollment;

    const existingFinancialStatus = await createEnrollmentFinancialStatus(enrollment, financial_aid);

    const enrollmentData = {
      STUDENT_ID: studentID,
      COURSE_ID: courseID,
      ACADEMIC_YEAR_ID: academicYearId,
      FINANCIAL_STATUS_ID: existingFinancialStatus?.FINANCIAL_STATUS_ID,
      ENROLLMENT_MODE: enrollment.enrollment_mode,
      ENROLLMENT_STATUS: enrollment.enrollment_status,
      ENROLLMENT_DATE: new Date(enrollment.enrollment_date),
      TUITION_FEES: enrollment.financial_status.total_fees,
    };

    const newEnrollment = await D_ENROLLMENTS.create(enrollmentData);
    console.log(`[ENROLLMENT] CREATED | Student: ${studentID} | Course: ${courseID} | Year: ${academicYearId}`);
    return newEnrollment;
  }

  async function createEnrollmentFinancialStatus(enrollmentMessage: any, financial_aid: any) {
    const newFinancialStatus = await D_ENROLLMENT_FINANCIAL_STATUS.create({
        TOTAL_FEES: enrollmentMessage.financial_status.total_fees,
        TOTAL_PAID: enrollmentMessage.financial_status.paid,
        TOTAL_PENDING: enrollmentMessage.financial_status.pending,
        FINANCIAL_SUPPORT_AMOUNT: financial_aid.financial_aid_type !== 'None' ? financial_aid.financial_aid_value : null,
        STATUS : enrollmentMessage.financial_status.payment_status,
    });
    return newFinancialStatus;
  }

  async function getOrCreateStudent(student: any, socioeconomics: any, demographics: any) {
    const existingStudent = await D_STUDENTS.findOne({ where: { STUDENT_ID: student.student_id } });
    if (existingStudent) return existingStudent.STUDENT_ID;

    const socioEconomicData = {
      SCHOLARSHIP_STATUS: socioeconomics.financial_aid_status !== 'None' ? 'Scholarship' : 'None',
      INCOME: socioeconomics.working_status.is_working ? socioeconomics.working_status.job_income : null,
      FAMILY_INCOME: socioeconomics.family_income,
      RESPONSABLE_PARENT_EDUCATION_LEVEL: socioeconomics.responsible_parent_education,
      RESPONSABLE_PARENT_OCCUPATION: socioeconomics.responsible_parent_ocupation,
      HAS_INTERNET_ACCESS: socioeconomics.has_internet_access ? 1 : 0,
      HAS_COMPUTER_ACCESS: socioeconomics.has_computer_access ? 1 : 0,
      WORKING_STATUS: socioeconomics.working_status.is_working ? "Student-Worker" : "Student",
    };
    const socioData = await D_SOCIOECONOMIC_DATA.create(socioEconomicData);

    const demographicData = {
      DATE_OF_BIRTH: student.date_of_birth,
      NATIONALITY: student.identification.nacionality,
      MARITAL_STATUS: demographics.marital_status,
      GENDER: student.identification.gender,
      ETHNICITY: demographics.ethnicity,
      CITY_OF_BIRTH: student.identification.city_of_birth,
      COUNTRY_OF_BIRTH: student.identification.city_of_birth,
      CURRENT_RESIDENCE_TYPE: demographics.current_residence_type,
    };
    const demoData = await D_STUDENT_DEMOGRAPHIC_DATA.create(demographicData);

    const newStudent = await D_STUDENTS.create({
      STUDENT_ID: student.student_id,
      NAME: student.full_name,
      SOCIOECONOMIC_ID: socioData.SOCIOECONOMIC_ID,
      DEMOGRAPHIC_ID: demoData.STUDENT_DEMOGRAPHIC_ID,
    });

    console.log(` > [STUDENT] created: ${student.full_name}`);
    return newStudent.STUDENT_ID;
  }

  async function getOrCreateAcademicYear(academicYear: any) {
    const existingYear = await D_ACADEMIC_YEAR.findOne({ where: { ACADEMIC_YEAR: academicYear.year } });
    if (existingYear) return existingYear;

    const newYear = await D_ACADEMIC_YEAR.create({
      ACADEMIC_YEAR: academicYear.year,
      START_DATE: academicYear.start_date,
      END_DATE: academicYear.end_date,
    });
    console.log(` > [ACADEMICYEAR] created: ${academicYear.year}`);
    return newYear;
  }

export const EnrollmentProcessor = {
    process
};