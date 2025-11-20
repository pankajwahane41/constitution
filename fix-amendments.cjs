const fs = require('fs');

console.log('Comprehensive fix for amendments_judiciary file...\n');

let content = fs.readFileSync('public/data/constitution_questions_amendments_judiciary.json', 'utf8');

// Fix all instances where tags array closes with }, instead of ]
// Match: "tags": ["...", "..."},
// Replace with: "tags": ["...", "..."]
content = content.replace(/"tags":\s*\[([^\]]+)\},/g, '"tags": [$1]');

// After tags with ],  ensure the object closes with }
// Pattern: "tags": [...],\n    {\n  should be "tags": [...]\n    },\n    {\n
content = content.replace(/("tags":\s*\[[^\]]+\]),\s*\n\s*\{/g, '$1\n    },\n    {');

fs.writeFileSync('public/data/constitution_questions_amendments_judiciary.json', content, 'utf8');

console.log('✓ Applied fixes');

// Validate
try {
  JSON.parse(fs.readFileSync('public/data/constitution_questions_amendments_judiciary.json', 'utf8'));
  console.log('✓ Valid JSON!');
} catch (e) {
  console.log('✗ Error:', e.message);
  const match = e.message.match(/position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    const snippet = content.substring(Math.max(0, pos - 50), pos + 50);
    console.log('\nNear position', pos, ':', snippet);
  }
}
