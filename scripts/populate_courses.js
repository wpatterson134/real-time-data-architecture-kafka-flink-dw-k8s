const axios = require('axios');

async function makeRequest(courseId) {
  const url = `http://localhost:3001/api/courses/${courseId}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(`Request for courseId ${courseId} finished with status code ${response.status}`);
  } catch (error) {
    console.error(`Request ${courseId} encountered an error: ${error.response ? error.response.status : error.message}`);
    if (error.response) {
      console.error('Error data:', error.response.data);
    }
  }
}

async function makeMultipleRequests() {
  const totalCourses = 200;
  console.log('Starting requests...');
  for(let i = 1; i <= totalCourses; i++) {
      await makeRequest(i);
  }
  console.log('All requests finished.');
}

makeMultipleRequests();
