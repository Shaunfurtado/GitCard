const https = require('https');
const fs = require('fs');
const username = process.argv[2];
if (!username) {
  console.error('Please provide a Github Username as a command-line argument. \nExample: node script.js your-github-username');
  process.exit(1);
}
const url = `https://streak-stats.demolab.com/?user=${username}`;
https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const regex = /<text[^>]*>([\s\S]*?)<\/text>/g;
    let matches;
    const extractedLines = [];
    while ((matches = regex.exec(data)) !== null) {
      const rawText = matches[1];
      const cleanText = rawText.trim();
      if (cleanText) {
        extractedLines.push(cleanText);
      }
    }
    const formattedOutput = [
      extractedLines[0],
      extractedLines[2],
      extractedLines[6],
      extractedLines[8]
    ];
    const jsonArray = JSON.stringify(formattedOutput, null, 2);
    fs.writeFileSync('output.txt', jsonArray);
    console.log('Data extracted and saved Successfully to output.txt for the username:', username);
  });
}).on('error', (err) => {
  console.error('Error fetching the page:', err);
});
