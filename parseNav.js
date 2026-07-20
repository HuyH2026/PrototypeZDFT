const fs = require('fs');
const content = fs.readFileSync('src/imports/02InsightsExpanded/index.tsx', 'utf-8');
const lines = content.split('\n');
console.log(lines.find(l => l.includes('function TopNavbar()')));
