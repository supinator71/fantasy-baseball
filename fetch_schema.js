const fs = require('fs');
const https = require('https');

// Read token from the mock JSON database
const dbPath = 'c:\\\\users\\\\supri\\\\projects\\\\fantasy-baseball\\\\server\\\\db\\\\data.json';
const content = fs.readFileSync(dbPath, 'utf8');

const match = content.match(/"access_token":"([^"]+)"/);

if (!match) {
  console.log('Could not find JWT token in database.json');
  process.exit(1);
}

const token = match[1];
console.log('Extracted Token starting with:', token.substring(0, 10));

const options = {
  hostname: 'fantasysports.yahooapis.com',
  port: 443,
  path: '/fantasy/v2/users;use_login=1/games;game_keys=mlb/teams?format=json',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Accept': 'application/json'
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      let teamKey = '';
      try { teamKey = parsed.fantasy_content.users[0].user[1].games[0].game[1].teams[0].team[0][0].team_key; } catch(e) {}
      if (!teamKey) { console.log('Could not find team key'); return; }
      
      console.log('Querying Team:', teamKey);
      const rOptions = { ...options, path: '/fantasy/v2/team/' + teamKey + '/roster/players?format=json' };
      https.get(rOptions, rRes => {
        let rData = '';
        rRes.on('data', c => rData += c);
        rRes.on('end', () => {
           console.log('\n=== DIRECT ROSTER JSON HEAD ===\n');
           const obj = JSON.parse(rData);
           console.log(JSON.stringify(obj, null, 2).substring(0, 1500));
        });
      });
      
    } catch(e) { console.log('Error parsing team:', e.message); }
  });
});
