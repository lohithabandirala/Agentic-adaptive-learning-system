// Script to update adkAgent.ts to use Vertex AI instead of genAI
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'services', 'adkAgent.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of genAI.getGenerativeModel with vertexAI.getGenerativeModel
content = content.replace(/genAI\.getGenerativeModel\(/g, 'vertexAI.getGenerativeModel(');

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Updated adkAgent.ts to use Vertex AI!');
console.log('   Replaced genAI.getGenerativeModel → vertexAI.getGenerativeModel');
