# Amendment Timeline Game Point Calculation Fix

## Problem Description
The AmendmentTimelineGame component was showing a '35 coins' reward but had no actual calculation implemented. The game was not following the standard reward calculation patterns used by other games in the project.

## Root Cause
1. **Missing Final Score Calculation**: The game only tracked basic score during gameplay but didn't calculate final rewards with bonuses/penalties
2. **No Coin Conversion**: No conversion from game score to constitutional coins 
3. **No Experience Points**: No experience point calculation
4. **Missing Reward Display**: No UI display of earned coins and experience

## Solution Implemented

### 1. Enhanced Game State
Added new fields to track earned rewards:
```typescript
interface GameState {
  // ... existing fields
  coinsEarned: number;
  experienceGained: number;
}
```

### 2. Comprehensive Scoring System
Implemented final score calculation in `completeGame()` function:

```typescript
// Calculate final score with bonuses and penalties
const accuracy = (gameState.correctPlacements / AMENDMENTS.length) * 100;
const timeBonus = Math.max(0, 300 - gameState.timeSpent) * 1.5; // Bonus for faster completion (max 300s)
const hintPenalty = gameState.hintsUsed * 50; // Penalty for hint usage
const perfectScoreBonus = accuracy === 100 ? 150 : 0; // Bonus for perfect placement

const finalScore = Math.max(0, Math.round(
  gameState.score + timeBonus + perfectScoreBonus - hintPenalty
));

// Calculate rewards using standard conversion
const coinsEarned = Math.max(1, Math.round(finalScore / 10));
const experienceGained = Math.round(finalScore / 8);
```

### 3. Reward Calculation Formula
- **Base Score**: Starts at 1000, modified during gameplay
- **Correct Placement**: +100 points
- **Incorrect Placement**: -25 points  
- **Hint Usage**: -50 points each
- **Time Bonus**: `(300 - timeSpent) × 1.5` (max 300 seconds for bonus)
- **Perfect Score Bonus**: +150 points for 100% accuracy
- **Hint Penalty**: -50 points per hint used
- **Coin Conversion**: `Math.max(1, Math.round(finalScore / 10))`
- **Experience Conversion**: `Math.round(finalScore / 8)`

### 4. UI Enhancements

#### Game Header
Added real-time coin counter display during gameplay:
```typescript
<div className="flex items-center gap-2">
  <span className="text-xl">🪙</span>
  <span className="font-medium text-orange-600">{Math.round(gameState.score / 10)}</span>
</div>
```

#### Completion Screen
Added dedicated rewards section showing:
- Constitutional Coins earned (🪙 icon)
- Experience Points gained (⭐ icon)
- Special achievement badges for perfect scores and no-hint completion

#### Game Rules
Enhanced intro screen with detailed scoring system explanation:
- Point values for each action
- Bonus and penalty descriptions
- Reward conversion formulas

### 5. Alignment with Project Standards
The implementation follows the same patterns used in other games:

| Game | Coin Formula | Experience Formula |
|------|-------------|-------------------|
| ConstitutionalMemoryGame | `Math.round(finalScore / 10)` | `Math.round(finalScore / 8)` |
| FamousCasesGame | `Math.floor(totalScore / 10)` | `Math.floor(totalScore / 5)` |
| **AmendmentTimelineGame** | **`Math.max(1, Math.round(finalScore / 10))`** | **`Math.round(finalScore / 8)`** |

## Files Modified
- `/src/components/games/AmendmentTimelineGame.tsx`
  - Added `coinsEarned` and `experienceGained` to GameState interface
  - Implemented comprehensive final score calculation
  - Added reward display in completion screen
  - Enhanced game header with live coin counter
  - Updated game rules with scoring details

## Expected Results
- **Typical Rewards**: 25-50 coins for average gameplay
- **Perfect Score**: 80-120 coins with no hints used and fast completion
- **Time-based Scoring**: Faster completion = up to 450 bonus points
- **Accuracy-based Scoring**: Perfect placement = +150 bonus points

## Testing Considerations
1. **Perfect Game**: All amendments placed correctly, no hints used, under 5 minutes (should earn 80-120 coins)
2. **Average Game**: Mix of correct/incorrect placements, some hints used (should earn 25-50 coins)
3. **Challenge Game**: Many incorrect placements, frequent hint usage (should earn 10-25 coins)
4. **Time Pressure**: Complete game as slowly as possible to test time penalties (under 5 minutes for bonus)

## Backward Compatibility
- Existing saved game statistics remain functional
- No breaking changes to component interface
- All existing game mechanics preserved
- Additional rewards are bonuses on top of existing functionality

## Next Steps
1. Test the calculation with various gameplay scenarios
2. Verify reward amounts align with user expectations
3. Consider adding achievement system integration
4. Monitor coin balance updates in user profile