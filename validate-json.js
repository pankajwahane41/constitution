const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'public', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

console.log('Validating JSON files...\n');

let errors = [];

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
  } catch (error) {
    errors.push({ file, error: error.message });
    console.log(`ERROR in ${file}: ${error.message}`);
  }
});

console.log(`\n${files.length - errors.length} files valid, ${errors.length} files with errors`);

if (errors.length > 0) {
  console.log('\nFiles with errors:');
  errors.forEach(e => console.log(`  - ${e.file}`));
}
