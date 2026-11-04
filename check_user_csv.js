const fs = require('fs');
const path = require('path');

// Read the user prompt's transcript to see the exact text
const transcriptPath = 'C:/Users/immad/.gemini/antigravity/brain/4386de08-52e6-4199-b712-e350e471404e/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').split(/\r?\n/).filter(l => l.trim().length > 0);
const lastUserLine = lines.filter(l => l.includes('"USER_INPUT"')).pop();
const parsed = JSON.parse(lastUserLine);

console.log('User prompt text length:', parsed.content.length);

// Save the user's pasted text to a file so we can analyze it
fs.writeFileSync('C:/Users/immad/.gemini/antigravity/scratch/rareu-streetwear/user_pasted_data.csv', parsed.content, 'utf8');
console.log('Saved user pasted data to user_pasted_data.csv');
