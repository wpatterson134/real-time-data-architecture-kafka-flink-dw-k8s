const axios = require('axios');

async function makeRequest(studentId, year) {
  const url = `http://localhost:3001/api/benchmarks/student/${studentId}/year/${year}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(`benchmark request for studentId ${studentId} and year ${year} finished with status code ${response.status}`);
  } catch (error) {
    console.error(`Request ${studentId} encountered an error: ${error.response ? error.response.status : error.message}`);
    if (error.response) {
      console.error('Error data:', error.response.data);
    }
  }
}

async function makeMultipleRequests() {
  console.log('Starting requests...');
  const totalStudents = 40000;
  const year = 2024;
  for(let i = 1; i <= totalStudents; i++) {
    await makeRequest(i, year);
  }
  console.log('All requests finished.');
}

makeMultipleRequests();
