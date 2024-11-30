import express, { Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import { parse } from 'path';

const router = express.Router();

const generateMockEnrollment = (student: any, academicyear: number, courseid: number) => {
  const isCurrentYear = new Date().getFullYear() === academicyear;

  const academic_year_obj = {
    year: academicyear,
    start_date: `${academicyear}-09-01`,
    end_date: `${academicyear + 1}-07-31`,
  };

  // take 10-30 days before the academic year starts
  const enrollment_date = faker.date.between({
    from: `${academicyear}-08-20`,
    to: `${academicyear}-08-30`,
  }).toISOString().split('T')[0];

  const payment_due_date = faker.date.between({
    from: `${academicyear+ 1}-08-25`,
    to: `${academicyear+ 1}-09-10`,
  }).toISOString().split('T')[0];

  // generate every date based on the academic year

  const totalFees = faker.number.int({ min: 1000, max: 5000 });
  let paid = faker.number.int({ min: 1000, max: totalFees });
  let pending = Math.max(totalFees - paid, 0);
  let paymentStatus = paid >= totalFees ? 'Paid' : 'Pending';

  if (paid >= totalFees) {
    paid = totalFees;
  }

  var randomPaymentStatus = faker.number.int({ min: 1, max: 10 });
  if (randomPaymentStatus >= 1) {
    paid = totalFees;
    pending = 0;
    paymentStatus = 'Paid';
  }


  // Generate references that reflect the financial status
  const references = generateReferences(pending, paid,academic_year_obj);
  const dataresult = {
    academic_year : academic_year_obj,
    student: student,
    socioeconomics: {
      socioeconomic_status: '',
      family_income: faker.number.int({ min: 1000, max: 5000 }),
      family_size: faker.number.int({ min: 1, max: 5 }),
      family_dependents: 0,
      responsible_parent_education: faker.helpers.arrayElement(['Secondary', 'Secondary', 'Secondary', 'Secondary', 'Secondary', 'Secondary', 'Secondary', 'Secondary', 'High School','High School','High School','High School','High School','High School','High School', 'Bachelor','Bachelor','Bachelor', 'Master','Master', 'PhD']),
      responsible_parent_employment: faker.helpers.arrayElement(['Employed','Employed','Employed','Employed','Employed','Employed','Employed','Employed','Employed','Employed','Self-Employed', 'Unemployed',]),
      responsible_parent_ocupation: faker.name.jobTitle(),
      has_internet_access: faker.helpers.arrayElement(['Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes', 'No']),
      has_computer_access: faker.helpers.arrayElement(['Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes', 'No']),
      has_smartphone_access: faker.helpers.arrayElement(['Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes','Yes', 'No']),
      working_status : {}
    },
    demographics: {
      marital_status: faker.helpers.arrayElement(['Single','Single','Single','Single','Single','Single','Single','Single','Single','Single','Single','Single','Single','Single','Single','Single','Single', 'Married', 'Divorced', 'Widowed']),
      transportation: faker.helpers.arrayElement(['Car', 'Motorcycle', 'Bicycle', 'Bus', 'Bus', 'Bus', 'Bus', 'Bus', 'Walking','Walking','Walking','Walking','Walking']),
      health_insurance: faker.helpers.arrayElement(['Yes', 'No']),
      health_condition: faker.helpers.arrayElement(['Excellent', 'Good', 'Fair','Good', 'Fair','Good', 'Fair','Good', 'Fair', 'Poor']),
      health_condition_details: faker.lorem.sentence(),
      disability: faker.helpers.arrayElement(['Yes', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No', 'No']),
      ethnicity: faker.helpers.arrayElement(['White', 'Black', 'Asian', 'Hispanic', 'Mixed', 'Other']),
      religion: faker.helpers.arrayElement(['Christian','Christian','Christian','Christian','Christian','Christian','Christian','Christian','Christian','Christian','Christian','Christian','Christian','Christian','Christian','Christian', 'Muslim', 'Jewish', 'Buddhist', 'Hindu', 'Atheist', 'Agnostic', 'Other']),
      current_residence_type: faker.helpers.arrayElement(['House', 'Apartment', 'House', 'Apartment', 'House', 'Apartment', 'House', 'Apartment', 'Dormitory', 'Dormitory', 'Dormitory', 'Dormitory', 'Dormitory',  'Dormitory', 'Dormitory', 'Dormitory', 'Other']),
    },
    enrollment: {
      enrollment_mode: faker.helpers.arrayElement(['Full-time', 'Part-time']),
      enrollment_date: enrollment_date,
      course_id: courseid,
      enrollment_status: faker.helpers.arrayElement(['Active']),
      financial_status: {
        total_fees: totalFees,
        paid: paid,
        pending: pending,  // Ensure pending is non-negative
        payment_due_date: payment_due_date,
        payment_status: paymentStatus, // Correct payment status (Paid or Pending)
      },
      tuitions: references, // Pass the references array
    }
  } as any;

  // if the responsible is unemployed
  if (dataresult.socioeconomics.responsible_parent_employment === 'Unemployed') {
    dataresult.socioeconomics.responsible_parent_ocupation = 'Unemployed';
  }
  // socioeconomics status based on family income
  if (dataresult.socioeconomics.family_income < 1500) {
    dataresult.socioeconomics.socioeconomic_status = 'Low';
  } else if (dataresult.socioeconomics.family_income < 3000) {
    dataresult.socioeconomics.socioeconomic_status = 'Medium';
  } else {
    dataresult.socioeconomics.socioeconomic_status = 'High';
  }

  // 5% chance of student having a job
  if (faker.number.int({ min: 1, max: 20 }) === 1) {
    dataresult.socioeconomics.working_status = {
      is_working: true,
      job_title: faker.name.jobTitle(),
      job_company: faker.company.name(),
      job_income: faker.number.int({ min: 500, max: 2000 }),
    };
  } else {
    dataresult.socioeconomics.working_status = {
      is_working: false,
      job_title: '',
      job_company: '',
      job_income: 0,
    };
  }

  // 10% chance of enrollment  status not beign active
  if (faker.number.int({ min: 1, max: 10 }) === 1) {
    dataresult.enrollment.enrollment_status = faker.helpers.arrayElement(['Pending', 'Cancelled', 'Expired']);
  }

  // 10% chance of financial aid
  if (faker.number.int({ min: 1, max: 10 }) === 1 && dataresult.enrollment.enrollment_status === 'Active') {
    dataresult.financial_aid = {
      financial_aid_type: faker.helpers.arrayElement(['Scholarship', 'Grant', 'Loan']),
      financial_aid_value: faker.number.int({ min: 1000, max: 5000 }),
      financial_aid_status: faker.helpers.arrayElement(['Active']),
    };
  }else {
    dataresult.financial_aid = {
      financial_aid_type: 'None',
      financial_aid_value: 0,
      financial_aid_status: 'None',
    };
  }

  if (dataresult.enrollment.enrollment_status != 'Active') {
    dataresult.enrollment.tuitions = [];
    dataresult.enrollment.financial_status.pending = dataresult.enrollment.financial_status.total_fees;
    dataresult.enrollment.financial_status.paid = 0;
    dataresult.enrollment.financial_status.payment_status = 'Pending';

    if (dataresult.enrollment.enrollment_status === 'Expired') {
      dataresult.enrollment.financial_status.payment_status = 'Cancelled';
    }else if (dataresult.enrollment.enrollment_status === 'Cancelled') {
      dataresult.enrollment.financial_status.payment_status = 'Cancelled';
    }

  }

  return  dataresult;
};

const generateReferences = (pending: number, paid: number, academicyear: any) => {
  const numReferences = faker.number.int({ min: 2, max: 6 }); // Number of references to generate
  const references = [];
  let totalPaid = 0; // Track the total paid for references
  let totalPending = 0; // Track the total pending for references
  let remainingPaid = paid; // Remaining amount of paid to be assigned
  let remainingPending = pending; // Remaining amount of pending to be assigned

  // Generate references
  for (let i = 0; i < numReferences; i++) {

      // based on the academicyear.end_date and academicyear.start_date generate the generation date and expiration date of the reference
      // the expiration date should be between 5/30 days after the generation date
      const generationDate = faker.date.between({
          from: academicyear.start_date,
          to: academicyear.end_date,
      }).toISOString().split('T')[0];
      const expirationDate =  faker.date.between({
          from: generationDate,
          to: new Date(new Date(generationDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }).toISOString().split('T')[0];

      const status = faker.helpers.arrayElement(['Paid', 'Pending', 'Expired']);

      let referenceValue = 0;
      if (status === 'Expired') {
          const expiredPercentage = faker.number.int({ min: 10, max: 40 }); // Random expired percentage
          referenceValue = (pending + paid) * (expiredPercentage / 100); // Value based on expired percentage
      } else if (status === 'Paid' && remainingPaid > 0) {
          referenceValue = i === numReferences - 1 ? remainingPaid : faker.number.int({ min: 1, max: remainingPaid });
          remainingPaid -= referenceValue;
          totalPaid += referenceValue;
      } else if (status === 'Pending' && remainingPending > 0) {
          referenceValue = i === numReferences - 1 ? remainingPending : faker.number.int({ min: 1, max: remainingPending });
          remainingPending -= referenceValue;
          totalPending += referenceValue;
      }

      references.push({
          entity: faker.number.int({ min: 1001, max: 9999 }), // Entity number for the MB payment
          reference: faker.number.int({ min: 100000000, max: 999999999 }).toString(), // Reference number
          value: referenceValue, // Value of the reference
          name: faker.lorem.words(3), // A descriptive name for the reference
          generation_date: generationDate,
          expiration_date: expirationDate,
          status: status, // Reference status (Paid, Pending, Expired)
      });
  }

  // If there's any remaining paid or pending amount, allocate it
  if (remainingPaid > 0) {
      references.push({
          entity: faker.number.int({ min: 1001, max: 9999 }),
          reference: faker.number.int({ min: 100000000, max: 999999999 }).toString(),
          value: remainingPaid,
          name: faker.lorem.words(3),
          generation_date: new Date().toISOString().split('T')[0],
          expiration_date: faker.date.soon({ days: 30 }).toISOString().split('T')[0],
          status: 'Paid',
      });
  }

  if (remainingPending > 0) {
      references.push({
          entity: faker.number.int({ min: 1001, max: 9999 }),
          reference: faker.number.int({ min: 100000000, max: 999999999 }).toString(),
          value: remainingPending,
          name: faker.lorem.words(3),
          generation_date: new Date().toISOString().split('T')[0],
          expiration_date: faker.date.soon({ days: 30 }).toISOString().split('T')[0],
          status: 'Pending',
      });
  }

  return references;
};

const generateMockStudent = (studentid: number, academicyear: number) => ({
  student_id: studentid,
  full_name: faker.person.fullName(),
  date_of_birth: faker.date.past({
    years: 20,
    refDate: '2003-01-01',
  }).toISOString().split('T')[0],
  official_email: faker.internet.email({ provider: 'isec.pt' }),
  official_contact : {
    number : faker.phone.number(),
    type : faker.helpers.arrayElement(['Home', 'Mobile', 'Work']),
  },
  official_address : {
    street : faker.address.street(),
    city : faker.address.city(),
    zip_code : faker.address.zipCode(),
    country : faker.address.country
  },
  identification: {
    nacionality :  faker.helpers.arrayElement(
      [ 
        "Portuguese",
       ]),
       city_of_birth : faker.helpers.arrayElement(
        [
          "Lisbon",
          "Porto",
          "Coimbra","Coimbra","Coimbra","Coimbra","Coimbra","Coimbra","Coimbra","Coimbra","Coimbra","Coimbra","Coimbra","Coimbra",
          "Aveiro",
          "Faro",
          "Braga",
          "Viseu",
        ]),
          identification_number : faker.string.numeric(8).toUpperCase(),
    identification_type : faker.helpers.arrayElement(['BI', 'CC', 'Passport']),
    identification_expiration_date : faker.date.future({
      years: 10,
      refDate: '2025-01-01',
    }).toISOString().split('T')[0],
    identification_issue_date : faker.date.past({
      years: 10,
      refDate: '2013-01-01',
    }).toISOString().split('T')[0],
    identification_issue_location : faker.helpers.arrayElement(
      [
        "Lisbon",
        "Porto",
        "Coimbra","Coimbra","Coimbra","Coimbra","Coimbra","Coimbra","Coimbra","Coimbra","Coimbra","Coimbra","Coimbra","Coimbra",
        "Aveiro",
        "Faro",
        "Braga",
        "Viseu",
      ]),
    nif : faker.string.numeric(9).toUpperCase(),
    nusns : faker.string.numeric(11).toUpperCase(),
    gender: faker.helpers.arrayElement(['Male', 'Female','Male', 'Female', 'Other']),
  },
});

// ex: http://localhost:3001/api/enrollments/course/1/student/1
router.get('/course/:courseid/student/:studentid/year/:academicyear', async (req: Request, res: Response) => {
  try {
    const { studentid, courseid, academicyear } = req.params;
    const mockStudent = generateMockStudent(parseInt(studentid),parseInt(academicyear));
    const mockEnrollment = generateMockEnrollment(mockStudent, parseInt(academicyear), parseInt(courseid) );

    //await sendMessageToKafka('enrollment-topic', mockEnrollment);

    res.status(201).json(mockEnrollment);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating enrollment');
  }
});

export default router;
