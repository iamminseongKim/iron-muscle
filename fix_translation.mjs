import fs from 'fs';
import https from 'https';

const text = fs.readFileSync('src/data/exercises.ts', 'utf-8');

function isEnglish(s) {
  if (typeof s !== 'string') return false;
  return !/[가-힣]/.test(s) && s.length > 3;
}

const lines = text.split('\n');
let englishStrings = new Set();

for (let line of lines) {
  const descMatch = line.match(/"description":\s*"([^"]+)"/);
  if (descMatch && isEnglish(descMatch[1])) {
    englishStrings.add(descMatch[1]);
  }
  
  // For instructions and tips, they are in arrays, but each element is on its own line in standard formatting
  const arrayStrMatch = line.match(/^\s*"([^"]+)",?\s*$/);
  if (arrayStrMatch) {
    if (isEnglish(arrayStrMatch[1])) {
      // Only if it looks like an instruction
      if (arrayStrMatch[1].includes(' ') && arrayStrMatch[1].length > 10) {
        englishStrings.add(arrayStrMatch[1]);
      }
    }
  }
}

const strList = Array.from(englishStrings);
console.log(`Found ${strList.length} English strings remaining.`);

if (strList.length === 0) {
  process.exit(0);
}

function translateBatch(texts) {
  return new Promise((resolve, reject) => {
    const combined = texts.join('\n###\n');
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=' + encodeURIComponent(combined);
    
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          let resCombined = parsed[0].map(item => item[0]).join('');
          resCombined = resCombined.replace(/\n\s*#\s*#\s*#\s*\n/g, '\n###\n');
          const results = resCombined.split('\n###\n').map(s => s.trim());
          if (results.length === texts.length) resolve(results);
          else resolve(texts.map(t => t + " (trans fail)")); // fallback
        } catch (e) {
          resolve(texts);
        }
      });
    }).on('error', () => resolve(texts));
  });
}

async function run() {
  const transDict = {};
  const BATCH_SIZE = 20;
  
  for (let i = 0; i < strList.length; i += BATCH_SIZE) {
    const batch = strList.slice(i, i + BATCH_SIZE);
    const results = await translateBatch(batch);
    for (let j = 0; j < batch.length; j++) {
      transDict[batch[j]] = results[j].replace(/"/g, "'");
    }
    console.log(`Translated ${Math.min(i + BATCH_SIZE, strList.length)} / ${strList.length}`);
  }
  
  let newText = text;
  for (const [eng, kor] of Object.entries(transDict)) {
    if (kor && !kor.includes("(trans fail)")) {
      // safely replace with exact match for string value
      newText = newText.split(`"${eng}"`).join(`"${kor}"`);
    }
  }
  
  fs.writeFileSync('src/data/exercises.ts', newText);
  console.log('Fixed translations.');
}

run();
