const { callClaude } = require('./server/routes/claude');
async function test() {
  try {
    const text = await callClaude([{ role: 'user', content: `Generate a fake json for a baseball game: { "projected_wins": 5, "categories": [{ "name": "HR" }] }`}]);
    console.log(text);
  } catch (e) { console.error(e) }
}
test();
