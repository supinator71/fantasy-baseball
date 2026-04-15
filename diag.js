const axios = require('axios');
const yahooService = require('./server/services/yahooService');
require('dotenv').config();

async function run() {
  // Let's grab the first league and team
  const tempToken = process.env.YAHOO_ACCESS_TOKEN || "NO_TOKEN"; // Might need an active user context, which Node doesn't have if I just run it.
  
  // Let's just grep yahooService.js for starting_status!
}
run();
