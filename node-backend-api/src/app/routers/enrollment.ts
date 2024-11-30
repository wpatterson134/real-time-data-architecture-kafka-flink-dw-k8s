import express, { Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import { parse } from 'path';

const router = express.Router();

const generateMockEnrollment = (student: any, year: number, courseid: number) => {
  const isCurrentYear = new Date().getFullYear() === year;

  const totalFees = faker.number.int({ min: 1000, max: 5000 });
  let paid = faker.number.int({ min: 1000, max: totalFees });
  let pending = Math.max(totalFees - paid, 0);
  let paymentStatus = paid >= totalFees ? 'Paid' : 'Pending';

  if (paid >= totalFees) {
    paid = totalFees;
  }

  var randomPaymentStatus = faker.number.int({ min: 1, max: 10 });
  if (randomPaymentStatus === 1) {
    paid = totalFees;
    pending = 0;
    paymentStatus = 'Paid';
  }

  // Generate references that reflect the financial status
  const references = generateReferences(pending, paid);

  return {
    enrollment_id: faker.number.int(),
    student: student,
    enrollment: {
      enrollment_mode: faker.helpers.arrayElement(['Full-time', 'Part-time']),
      enrollment_date: isCurrentYear
        ? new Date().toISOString().split('T')[0]  // Current year date
        : faker.date.past({ years: 2 }).toISOString().split('T')[0],  // Past years date
      course_id: courseid,
      financial_status: {
        total_fees: totalFees,
        paid: paid,
        pending: pending,  // Ensure pending is non-negative
        payment_due_date: faker.date.future({
          years: 0.5,
          refDate: '2024-01-01',
        }).toISOString().split('T')[0],
        payment_status: paymentStatus, // Correct payment status (Paid or Pending)
      },
      tuitions: references, // Pass the references array
    },

  };
};

const generateReferences = (pending: number, paid: number) => {
  const numReferences = faker.number.int({ min: 2, max: 6 }); // Number of references to generate
  const references = [];
  let totalPaid = 0; // Track the total paid for references
  let totalPending = 0; // Track the total pending for references
  let remainingPaid = paid; // Remaining amount of paid to be assigned
  let remainingPending = pending; // Remaining amount of pending to be assigned

  // Generate references
  for (let i = 0; i < numReferences; i++) {
      const generationDate = faker.date.past({ years: 0.1 }).toISOString().split('T')[0]; // Random generation date
      const expirationDate = faker.date.soon({ days: 30 }).toISOString().split('T')[0];
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

const generateMockStudent = (studentid: number) => ({
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
          identification_number : faker.string.numeric(8).toUpperCase(),
    identification_type : faker.helpers.arrayElement(['BI', 'CC', 'Passport']),
    identification_expiration_date : faker.date.future({
      years: 10,
      refDate: '2024-01-01',
    }).toISOString().split('T')[0],
    identification_issue_date : faker.date.past({
      years: 10,
      refDate: '2003-01-01',
    }).toISOString().split('T')[0],
    identification_issue_location : faker.address.city(),
    nif : faker.string.numeric(9).toUpperCase(),
    nusns : faker.string.numeric(11).toUpperCase(),
    gender: faker.helpers.arrayElement(['Male', 'Female','Male', 'Female', 'Other']),
  },
});

// ex: http://localhost:3001/api/enrollments/course/1/student/1
router.get('/course/:courseid/student/:studentid', async (req: Request, res: Response) => {
  try {
    const { studentid, courseid } = req.params;
    const mockStudent = generateMockStudent(parseInt(studentid));
    // Gera um ano letivo aleatório entre 2010 e o ano atual
    const mockYear = faker.date.between({
      from: new Date('2010-01-01'),
      to: new Date(),
    }).getFullYear();
    const mockEnrollment = generateMockEnrollment(mockStudent, mockYear, parseInt(courseid) );

    //await sendMessageToKafka('enrollment-topic', mockEnrollment);

    res.status(201).json(mockEnrollment);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating enrollment');
  }
});

export default router;
