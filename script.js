const https = require('https');
const fs = require('fs');
https.get('https://streak-stats.demolab.com/?user=GITHUB_USERNAME', (res) => {
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
    fs.writeFileSync('final_output.txt', jsonArray);
  });
}).on('error', (err) => {
  console.error('Error fetching the page:', err);
});
