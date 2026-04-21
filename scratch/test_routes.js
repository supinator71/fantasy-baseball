const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:3000/api/yahoo/leagues');
    console.log('Leagues response status:', res.status);
  } catch (err) {
    console.error('Leagues request failed:', err.response?.status || err.message);
  }
}

test();
