require('dotenv').config();
console.log('Key length:', process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 'NULL');
console.log('Key prefix:', process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.slice(0, 10) : 'NULL');
