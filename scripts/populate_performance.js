const axios = require('axios');

async function makeRequest(enrollmentId, subjectId) {
  const url = `http://localhost:3001/api/performance/enrollment/${enrollmentId}/subject/${subjectId}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(`performance request for enrollmentId ${enrollmentId} and subjectId ${subjectId} finished with status code ${response.status}`);
  } catch (error) {
    console.error(`Request ${enrollmentId} encountered an error: ${error.response ? error.response.status : error.message}`);
    if (error.response) {
      console.error('Error data:', error.response.data);
    }
  }
}

async function makeMultipleRequests() {
  const totalEnrollments = 100000;
  const totalSubjects = 3000;
  console.log('Starting requests...');
  for(let i = 1; i <= totalEnrollments; i++) {
    for (let index = 1; index <= totalSubjects; index++) {
      await makeRequest(i, index);
    }
  }
  console.log('All requests finished.');
}

makeMultipleRequests();
