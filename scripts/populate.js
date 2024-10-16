// save as postRequests.js
const axios = require('axios');

async function makePostRequest(index) {
  const url = 'http://localhost:3000/mock/user';

  try {
    const response = await axios.post(url, {}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Request ${index} completed successfully with status ${response.status}.`);
  } catch (error) {
    console.error(`Request ${index} encountered an error: ${error.response ? error.response.status : error.message}`);
  }
}

async function makeMultipleRequests() {
  const totalRequests = 100;
  const promises = [];

  for (let i = 1; i <= totalRequests; i++) {
    promises.push(makePostRequest(i));
  }

  await Promise.all(promises);
  console.log('All requests finished.');
}

makeMultipleRequests();
