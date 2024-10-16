const axios = require('axios');

async function makePostRequest(index) {
  const url = 'http://127.0.0.1:3001/mock/user';

  try {
    console.log(`Making request ${index}...`);
    // Se a API precisar de um payload, ajusta aqui
    const response = await axios.post(url, {}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(`Request ${index} completed successfully with status ${response.status}.`);
  } catch (error) {
    console.error(`Request ${index} encountered an error: ${error.response ? error.response.status : error.message}`);
    if (error.response) {
      console.error('Error data:', error.response.data);
    }
  }
}

async function makeMultipleRequests() {
  const totalRequests = 100000; // Tenta com um número menor primeiro

  for (let i = 1; i <= totalRequests; i++) {
    await makePostRequest(i);
  }

  console.log('All requests finished.');
}

makeMultipleRequests();
