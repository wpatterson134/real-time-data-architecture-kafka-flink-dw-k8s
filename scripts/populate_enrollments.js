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
  const totalCourses = 50;
  const maxStudents = 40;
  const yearsToIterate = [2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019, 2020, 2021];
  let currentStudent = 1;
  console.log('Starting requests...');
  for ( currentYear of yearsToIterate){
    for(let i = 1; i <= totalCourses; i++) {
      for (let index = 1; index < maxStudents; index++) {
        await makeRequest(currentYear, i, currentStudent);
        currentStudent++;
      }
    }
  }
  console.log('All requests finished.');
}

makeMultipleRequests();
