function tryParse(str) {
  function extract(s) {
    let startIndex = s.indexOf('{');
    if (startIndex === -1) return null;
    let depth = 0;
    let inString = false;
    let escapeNext = false;
    for (let i = startIndex; i < s.length; i++) {
      const char = s[i];
      if (escapeNext) { escapeNext = false; continue; }
      if (char === '\\') { escapeNext = true; continue; }
      if (char === '"') { inString = !inString; continue; }
      if (!inString) {
        if (char === '{') depth++;
        else if (char === '}') {
          depth--;
          if (depth === 0) return s.substring(startIndex, i + 1);
        }
      }
    }
    return null;
  }
  return extract(str);
}
console.log("TEST 1 (Valid):", tryParse('{"a":1}'));
console.log("TEST 2 (Truncated):", tryParse('{"a":1, "b": {"c": 2}'));
console.log("TEST 3 (Quotes inside string):", tryParse('{"a": "hello \\"world\\""}'));
console.log("TEST 4 (Unescaped quotes inside string):", tryParse('{"a": "hello "world""}'));
