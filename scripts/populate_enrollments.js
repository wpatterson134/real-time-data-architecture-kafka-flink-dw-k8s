const axios = require('axios');

async function makeRequest(firstYear, courseId, studentId) {
  const url = `http://127.0.0.1:3001/api/enrollments/course/${courseId}/student/${studentId}/year/${firstYear}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(`Request for studentId ${studentId} finished with status code ${response.status}`);
  } catch (error) {
    console.error(`Request ${studentId} encountered an error: ${error.response ? error.response.status : error.message}`);
    if (error.response) {
      console.error('Error data:', error.response.data);
    }
  }
}

async function makeMultipleRequests() {
  const totalCourses = 30;
  const maxStudents = 40;
  const firstYear = 2019;

  let currentStudent = 1;

  console.log('Starting requests...');
  for(let i = 1; i <= totalCourses; i++) {
    for (let index = 1; index < maxStudents; index++) {
      await makeRequest(firstYear, i, currentStudent);
      currentStudent++;
    }
  }
  console.log('All requests finished.');
}

makeMultipleRequests();
