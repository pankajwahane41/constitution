// Debug test for Constitution Builder validation
console.log('=== CONSTITUTION BUILDER DEBUG ===');

// Check if validation is working by testing the logic
const testArticle = {
  id: 'preamble-1',
  title: 'We, the People of India',
  correctSection: 'preamble'
};

const testSections = [
  { id: 'preamble', title: 'Preamble' },
  { id: 'fundamental_rights', title: 'Part III - Fundamental Rights' }
];

// Test different guidance levels
const guidanceLevels = ['basic', 'expert'];

guidanceLevels.forEach(level => {
  console.log(`\n--- Testing with guidanceLevel: ${level} ---`);
  
  // Test correct placement
  const correctPlacement = testArticle.correctSection === 'preamble';
  const shouldAllowCorrect = true; // Always allow correct placements
  console.log(`Correct placement (preamble → preamble): ${correctPlacement ? 'ALLOWED' : 'BLOCKED'}`);
  
  // Test incorrect placement  
  const incorrectPlacement = testArticle.correctSection === 'fundamental_rights';
  const shouldAllowIncorrect = level === 'expert'; // Only expert mode allows incorrect
  const wouldBlock = !incorrectPlacement && level !== 'expert';
  console.log(`Incorrect placement (preamble → fundamental_rights): ${wouldBlock ? 'BLOCKED ✓' : 'ALLOWED ❌'}`);
  console.log(`Expected behavior: ${shouldAllowIncorrect ? 'ALLOW (expert mode)' : 'BLOCK (validation active)'}`);
});

// Test the actual validation logic
function testValidation(article, sectionId, guidanceLevel) {
  const isCorrectPlacement = article.correctSection === sectionId;
  
  if (!isCorrectPlacement && guidanceLevel !== 'expert') {
    return 'BLOCKED - Validation active';
  }
  
  return 'ALLOWED - Placement accepted';
}

console.log('\n=== VALIDATION FUNCTION TESTS ===');
console.log('Preamble → Preamble (basic):', testValidation(testArticle, 'preamble', 'basic'));
console.log('Preamble → Rights (basic):', testValidation(testArticle, 'fundamental_rights', 'basic'));
console.log('Preamble → Rights (expert):', testValidation(testArticle, 'fundamental_rights', 'expert'));

export {};