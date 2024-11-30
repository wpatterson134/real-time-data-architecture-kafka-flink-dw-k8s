import express, { Request, Response } from 'express';
import { faker } from '@faker-js/faker';

const router = express.Router();

const validSubjects = [
    "Mathematics",
    "Communication Studies",
    "Computer Programming",
    "Web Development",
    "Mobile Development",
    "Game Development",
    "Database Management",
    "Software Engineering",
    "Computer Graphics",
    "Computer Security",
    "Computer Networks",
    "Operating Systems",
    "Algorithms",
    "Data Structures",
    "Artificial Intelligence",
    "Machine Learning",
    "Deep Learning",
    "Computer Vision",
    "Natural Language Processing",
    "Robotics",
    "Cybersecurity",
    "Ethical Hacking",
    "Penetration Testing",
    "Digital Forensics",
    "Cryptography",
    "Blockchain",
    "Internet of Things",
    "Cloud Computing",
    "Big Data",
    "Data Science",
    "Data Analytics",
    "Data Mining",
    "Business Intelligence",
    "Predictive Analytics",
    "Prescriptive Analytics",
    "Descriptive Analytics",
    "Quantitative Analysis",
    "Qualitative Analysis",
    "Statistical Analysis",
    "Financial Analysis",
    "Risk Analysis",
    "Investment Analysis",
    "Portfolio Analysis",
    "Technical Analysis",
    "Fundamental Analysis",
    "Economic Analysis",
    "Market Analysis",
    "Competitor Analysis",
    "Customer Analysis",
    "Product Analysis",
    "Service Analysis",
    "Process Analysis",
    "Performance Analysis",
    "Quality Analysis",
    "Cost Analysis",
    "Quantum Computing",
    "Quantum Cryptography",
    "Quantum Algorithms",
    "Quantum Machine Learning",
    "Quantum Artificial Intelligence",
    "Quantum Robotics",
    "Quantum Cybersecurity",
    "Quantum Internet of Things",
    "Quantum Cloud Computing",
    "Quantum Big Data",
    "Quantum Data Science",
    "Quantum Data Analytics",
    "Quantum Data Mining",
    "Quantum Business Intelligence",
    "Quantum Predictive Analytics",
    "Quantum Prescriptive Analytics",
];

const validCourses = [
    "Bachelor of Science in Computer Science",
    "Bachelor of Science in Software Engineering",
    "Bachelor of Science in Information Technology",
    "Bachelor of Science in Information Systems",
    "Bachelor of Science in Cybersecurity",
    "Bachelor of Science in Data Science",
    "Bachelor of Science in Business Analytics",
    "Bachelor of Science in Financial Analytics",
    "Bachelor of Science in Marketing Analytics",
    "Bachelor of Science in Operations Analytics",
    "Master of Science in Computer Science",
    "Master of Science in Software Engineering",
    "Master of Science in Information Technology",
    "Master of Science in Information Systems",
    "Master of Science in Cybersecurity",
    "Master of Science in Data Science",
    "Master of Science in Business Analytics",
    "Master of Science in Financial Analytics",
    "Master of Science in Marketing Analytics",
    "Master of Science in Operations Analytics",
]

const mockSubject = (credits: number, first_semester: boolean, year: number) => {
    return {
        subject_id: faker.number.int(),
        subject_name: faker.helpers.arrayElement(validSubjects),
        subject_code: faker.helpers.replaceSymbols('###-###'),
        subject_description: faker.lorem.paragraph(),
        subject_credits: credits,
        first_semester : first_semester ? 1 : 0,
        second_semester : first_semester ? 0 : 1,
        year : year,
    };
}

const mockCourse = (courseid: number) => {
    const mock = {
        course: {
            course_id: courseid,
            course_name: faker.helpers.arrayElement(validCourses),
            course_code: faker.helpers.replaceSymbols('###-###'),
            course_description: faker.lorem.paragraph(),
            course_credits: 0,
            subjects: [],
        },
    } as any;

    let credits = 0;
    const isBachelor = mock.course.course_name.includes('Bachelor');
    const isMaster = mock.course.course_name.includes('Master');

    if (isBachelor) {
        credits = 180;
    } else if (isMaster) {
        credits = faker.number.int({ min: 90, max: 120 });
    }
    mock.course.course_credits = credits;

    const years = isBachelor ? 3 : 2;
    const creditsPerYear = Math.floor(credits / years);
    const creditsPerSemester = Math.floor(creditsPerYear / 2);

    let remainingCredits = credits; // Para ajustar erros de arredondamento
    const subjects: any[] = [];
    const usedSubjectNames = new Set<string>(); // Controlar disciplinas já adicionadas

    for (let year = 1; year <= years; year++) {
        for (let semester = 0; semester < 2; semester++) {
            let semesterCredits = semester === 1 && year === years
                ? remainingCredits // Ajuste no último semestre
                : creditsPerSemester;

            while (semesterCredits > 0) {
                const subjectCredits = Math.min(semesterCredits, faker.helpers.arrayElement([4, 6]));
                let subjectName: string;

                // Gera um nome único
                do {
                    subjectName = faker.helpers.arrayElement(validSubjects);
                } while (usedSubjectNames.has(subjectName));

                usedSubjectNames.add(subjectName);

                // Adiciona a disciplina
                subjects.push({
                    subject_id: faker.number.int(),
                    subject_name: subjectName,
                    subject_code: faker.helpers.replaceSymbols('###-###'),
                    subject_description: faker.lorem.paragraph(),
                    subject_credits: subjectCredits,
                    first_semester: semester === 0 ? 1 : 0,
                    second_semester: semester === 1 ? 1 : 0,
                    year: year,
                });

                semesterCredits -= subjectCredits;
                remainingCredits -= subjectCredits;
            }
        }
    }

    mock.course.subjects = subjects;
    //mock.total_amount_credits_of_subjects = subjects.reduce((acc: number, subject: any) => acc + subject.subject_credits, 0);

    return mock;
};


// ex: http://localhost:3001/api/courses/1
router.get('/:courseid', async (req: Request, res: Response) => {
    try {
        const { courseid } = req.params;
        res.json(mockCourse(parseInt(courseid)));
    } catch (error) {
      console.error(error);
      res.status(500).send('Error creating enrollment');
    }
});

export default router;