# GameManager - Comprehensive Game Data Management System

## Overview

The GameManager is a central hub for all game-related data management in the Constitution Learning Hub. It provides unified game state management, scoring systems, achievement tracking, analytics, and seamless integration with the existing gamification engine.

## Features

### 🎮 Core Game Management
- **Game State Persistence**: Save/load complete game progress and states
- **Session Tracking**: Real-time game session management with start/complete/abandon functionality
- **High Score Management**: Unified high score system with leaderboards and rankings
- **Game Validation**: Comprehensive data validation and integrity checks

### 🏆 Unified Scoring System
- **Multi-factor Scoring**: Combines base score, time bonus, difficulty multiplier, and game-specific bonuses
- **Game Type Aware**: Different scoring algorithms for each game type (memory, puzzle, race, etc.)
- **Performance Metrics**: Tracks accuracy, completion time, streaks, and special achievements
- **Real-time Calculations**: Dynamic score calculation during gameplay

### 🎯 Achievement System Integration
- **Game-specific Achievements**: Custom achievements for each game type
- **Standard Achievement Integration**: Seamlessly integrates with the existing gamification engine
- **Progress Tracking**: Real-time achievement progress monitoring
- **Automatic Unlocking**: Smart achievement detection and reward distribution

### 📊 Analytics & Tracking
- **Performance Analytics**: Detailed statistics on gameplay patterns and performance
- **Engagement Metrics**: Track user retention, session completion, and activity patterns
- **Progress Insights**: Identify strengths, weaknesses, and improvement areas
- **Trending Analysis**: Performance trends over time with 7-day and 30-day views

### 📈 Difficulty Progression
- **Adaptive Difficulty**: AI-driven difficulty recommendations based on performance
- **Performance Metrics**: Analyzes win rate, score average, and consistency
- **Confidence Scoring**: Provides confidence levels for difficulty recommendations
- **Dynamic Adjustment**: Real-time difficulty updates based on recent performance

### 💾 Data Management
- **Persistent Storage**: All game data stored in IndexedDB with event sourcing
- **Data Export/Import**: Backup and restore functionality for user data
- **Memory Caching**: Efficient in-memory caching for performance
- **Data Validation**: Comprehensive validation for all game data

## Architecture

```
GameManager
├── Game State Management
│   ├── saveGameState()
│   ├── loadGameState()
│   └── getAllGameStates()
├── Unified Scoring
│   ├── calculateUnifiedScore()
│   ├── getTimeBonusMultiplier()
│   └── getDifficultyMultiplier()
├── High Score System
│   ├── updateHighScore()
│   ├── getHighScore()
│   └── getTopHighScores()
├── Achievement Integration
│   ├── checkGameAchievements()
│   ├── evaluateAchievementRequirement()
│   └── processAchievementRewards()
├── Session Management
│   ├── startGameSession()
│   ├── updateGameSession()
│   ├── completeGameSession()
│   └── abandonGameSession()
├── Analytics & Progress
│   ├── getGameAnalytics()
│   ├── getOverallGameProgress()
│   └── trackGameEvent()
└── Difficulty Management
    ├── getRecommendedDifficulty()
    └── updateDifficulty()
```

## Installation & Setup

### 1. Import the GameManager

```typescript
import { gameManager } from '../lib/gameManager';
```

### 2. Initialize Storage

```typescript
// The storage system is automatically initialized with the GameManager
const db = ConstitutionDB.getInstance();
await db.initialize(userId);
```

### 3. Basic Usage

```typescript
// Start a game session
const session = await gameManager.startGameSession(
  'constitutional_memory', 
  userId, 
  'medium'
);

// Update session with real-time data
await gameManager.updateGameSession(session.sessionId, {
  score: currentScore,
  gameData: { accuracy: 85, flipsUsed: 12 }
});

// Complete the session
const result = await gameManager.completeGameSession(
  session.sessionId, 
  finalScore, 
  gameData
);

console.log('Rewards:', result.rewards);
console.log('New Achievements:', result.newAchievements);
```

## API Reference

### Game State Management

#### `saveGameState(gameState: GameState): Promise<void>`
Saves comprehensive game state including scores, progress, settings, and achievements.

#### `loadGameState(gameId: string, userId: string): Promise<GameState | null>`
Loads game state from cache or database.

#### `getAllGameStates(userId: string): Promise<GameState[]>`
Retrieves all game states for a user.

### Unified Scoring

#### `calculateUnifiedScore(gameType, baseScore, timeSpent, difficulty, perfectGame?, additionalMetrics?): UnifiedScoreResult`
Calculates final score with all bonuses and multipliers applied.

**Example:**
```typescript
const scoreResult = gameManager.calculateUnifiedScore(
  'quiz_race',
  85,           // base score
  120,          // time spent in seconds
  'hard',       // difficulty level
  false,        // perfect game
  { consecutiveCorrect: 5, speedBonus: true }  // additional metrics
);

// Result:
// {
//   finalScore: 142,
//   baseScore: 85,
//   timeBonus: 25,
//   difficultyBonus: 18,
//   perfectGameBonus: 0,
//   additionalBonuses: 14,
//   scoreBreakdown: { ... }
// }
```

### High Score Management

#### `updateHighScore(gameType, userId, newScore, gameDetails): Promise<HighScoreResult>`
Updates high score and checks for achievements.

#### `getHighScore(gameType, userId): Promise<HighScore | null>`
Retrieves current high score for a game.

#### `getTopHighScores(gameType, limit): Promise<HighScore[]>`
Gets leaderboard for a specific game.

### Achievement Integration

#### `checkGameAchievements(userId, gameType, sessionData): Promise<Achievement[]>`
Checks and unlocks game-specific achievements.

### Session Management

#### `startGameSession(gameType, userId, difficulty): Promise<GameSession>`
Starts a new game session.

#### `updateGameSession(sessionId, updates): Promise<void>`
Updates active session data.

#### `completeGameSession(sessionId, finalScore, gameData): Promise<CompletionResult>`
Completes session and processes all rewards.

#### `abandonGameSession(sessionId, reason): Promise<void>`
Handles abandoned sessions.

### Analytics

#### `getGameAnalytics(gameType, userId): Promise<GameAnalytics>`
Gets comprehensive analytics for a specific game.

#### `getGameDashboard(userId): Promise<GameDashboard>`
Gets complete game dashboard with all metrics.

#### `getOverallGameProgress(userId): Promise<OverallProgress>`
Gets aggregate progress across all games.

### Difficulty Management

#### `getRecommendedDifficulty(gameType, userId): Promise<DifficultyRecommendation>`
Gets AI-driven difficulty recommendations.

#### `updateDifficulty(gameType, userId, newDifficulty): Promise<void>`
Updates user's difficulty preference.

## Integration Examples

### With Existing Gamification Engine

```typescript
// The GameManager automatically integrates with the gamification engine
const gamificationResult = await gameManager.completeGameSession(sessionId, score, gameData);

// Rewards are automatically processed through the gamification engine
console.log(gamificationResult.rewards.coins);
console.log(gamificationResult.rewards.experience);
console.log(gamificationResult.newAchievements);
```

### With Game Components

```typescript
// Constitutional Memory Game Integration
const handleGameComplete = async (score: number, gameData: any) => {
  try {
    const result = await gameManager.completeGameSession(
      sessionId, 
      score, 
      { 
        accuracy: gameData.accuracy,
        flipsUsed: gameData.flipsUsed,
        timeEfficiency: gameData.timeEfficiency
      }
    );
    
    // Show rewards
    if (result.rewards.achievements.length > 0) {
      showAchievementModal(result.rewards.achievements);
    }
    
    // Update UI with new high score
    if (result.rewards.coins > 0) {
      updateCoins(result.rewards.coins);
    }
  } catch (error) {
    console.error('Game completion failed:', error);
  }
};
```

### React Component Integration

```typescript
function GameComponent({ userProfile }: { userProfile: UserProfile }) {
  const [session, setSession] = useState<GameSession | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    // Load existing game state
    loadGameState();
  }, [userProfile.userId]);

  const startGame = async () => {
    const newSession = await gameManager.startGameSession(
      'constitutional_memory',
      userProfile.userId,
      'medium'
    );
    setSession(newSession);
  };

  const handleScoreChange = async (score: number, gameData: any) => {
    if (session) {
      await gameManager.updateGameSession(session.sessionId, {
        score,
        gameData
      });
    }
  };

  return (
    <div>
      {/* Game UI */}
      {gameState && (
        <div>
          <p>High Score: {gameState.highScore}</p>
          <p>Games Played: {gameState.totalGamesPlayed}</p>
        </div>
      )}
    </div>
  );
}
```

## Game Types Supported

- `constitutional_memory` - Memory matching game
- `rights_puzzle` - Rights categorization puzzle
- `quiz_race` - Fast-paced quiz competition
- `famous_cases` - Constitutional cases matching
- `preamble_builder` - Preamble construction game
- `amendment_timeline` - Timeline arrangement game
- `constitution_builder` - Virtual constitution builder
- `story_quiz` - Story-based quizzes
- `daily_challenge` - Special daily challenges

## Data Models

### GameState
```typescript
interface GameState {
  gameId: string;
  gameType: GameType;
  userId: string;
  currentLevel: number;
  currentScore: number;
  highScore: number;
  totalGamesPlayed: number;
  averageScore: number;
  bestTime?: number;
  totalTimeSpent: number;
  lastPlayed: string;
  isUnlocked: boolean;
  difficulty: GameDifficulty;
  settings: GameSettings;
  achievements: GameAchievement[];
  statistics: GameStatistics;
}
```

### GameSession
```typescript
interface GameSession {
  sessionId: string;
  gameType: GameType;
  startTime: string;
  endTime?: string;
  duration?: number;
  score: number;
  perfectGame: boolean;
  accuracy: number;
  difficulty: GameDifficulty;
  level: number;
  coinsEarned: number;
  experienceGained: number;
  achievementsUnlocked: string[];
  gameData: Record<string, any>;
  isCompleted: boolean;
  isAbandoned: boolean;
}
```

## Error Handling

The GameManager includes comprehensive error handling:

```typescript
try {
  const result = await gameManager.completeGameSession(sessionId, score, gameData);
} catch (error) {
  if (error instanceof Error) {
    switch (error.message) {
      case 'Session not found':
        // Handle invalid session
        break;
      case 'Invalid game data':
        // Handle data validation errors
        break;
      default:
        // Handle general errors
        break;
    }
  }
}
```

## Performance Considerations

### Memory Management
- Game states are cached in memory for performance
- Caches are automatically cleared when needed
- Large datasets are paginated and loaded on demand

### Database Operations
- All database operations are async and non-blocking
- Batch operations are used where possible
- Event sourcing pattern ensures data consistency

### Analytics Optimization
- Analytics are cached and invalidated on changes
- Expensive calculations are performed asynchronously
- Progressive loading for dashboard data

## Testing

### Unit Tests
```typescript
describe('GameManager', () => {
  test('should calculate unified score correctly', () => {
    const result = gameManager.calculateUnifiedScore(
      'quiz_race', 85, 120, 'hard', false, { consecutiveCorrect: 3 }
    );
    expect(result.finalScore).toBeGreaterThan(85);
    expect(result.timeBonus).toBeGreaterThan(0);
  });

  test('should update high score when beaten', async () => {
    const result = await gameManager.updateHighScore(
      'constitutional_memory', 'user123', 95, { difficulty: 'hard', timeSpent: 180 }
    );
    expect(result.isNewHighScore).toBe(true);
  });
});
```

### Integration Tests
```typescript
describe('GameManager Integration', () => {
  test('should integrate with gamification engine', async () => {
    const session = await gameManager.startGameSession('quiz_race', 'user123');
    const result = await gameManager.completeGameSession(
      session.sessionId, 90, { accuracy: 90 }
    );
    
    expect(result.rewards.coins).toBeGreaterThan(0);
    expect(result.rewards.experience).toBeGreaterThan(0);
  });
});
```

## Best Practices

### 1. Session Management
```typescript
// Always start a session before gameplay
const session = await gameManager.startGameSession(gameType, userId);

// Update session regularly during gameplay
await gameManager.updateGameSession(session.sessionId, {
  score: currentScore,
  gameData: { accuracy: currentAccuracy }
});

// Complete or abandon properly
if (gameCompleted) {
  await gameManager.completeGameSession(session.sessionId, finalScore, gameData);
} else {
  await gameManager.abandonGameSession(session.sessionId, 'user_exit');
}
```

### 2. Error Handling
```typescript
try {
  const state = await gameManager.loadGameState(gameId, userId);
  if (!state) {
    // Handle missing state (create new one)
    state = createDefaultGameState(gameType, userId);
  }
} catch (error) {
  console.error('Failed to load game state:', error);
  // Show fallback UI or retry mechanism
}
```

### 3. Performance Optimization
```typescript
// Use specific game type queries
const state = await gameManager.loadGameState(`${gameType}_${userId}`, userId);

// Batch operations when possible
const allStates = await gameManager.getAllGameStates(userId);

// Cache frequently accessed data
const analytics = await gameManager.getGameAnalytics(gameType, userId);
```

### 4. Data Validation
```typescript
// Validate game data before saving
gameManager.validateGameSession(session);

try {
  await gameManager.saveGameState(gameState);
} catch (error) {
  if (error.message.includes('Invalid game state')) {
    // Handle validation errors
  }
}
```

## Migration Guide

### From Manual Game Management
1. **Replace manual state tracking** with GameManager state methods
2. **Update scoring calculations** to use unified scoring system
3. **Integrate achievement checking** into game completion flow
4. **Migrate existing high scores** to the new high score system

### Database Migration
```typescript
// Migrate existing game data
const migrateGameData = async () => {
  const existingData = await loadLegacyGameData();
  
  for (const gameData of existingData) {
    const gameState = convertLegacyToGameState(gameData);
    await gameManager.saveGameState(gameState);
  }
};
```

## Future Enhancements

- [ ] **Cloud Sync**: Sync game data across devices
- [ ] **Social Features**: Share achievements and compete with friends  
- [ ] **Advanced Analytics**: Machine learning-powered insights
- [ ] **Custom Challenges**: User-created challenges and tournaments
- [ ] **Accessibility**: Enhanced accessibility features
- [ ] **Offline Support**: Full offline gameplay with sync
- [ ] **A/B Testing**: Built-in A/B testing for game mechanics

## Support

For questions or issues with the GameManager:

1. Check the [Examples](./gameManagerExamples.tsx) for usage patterns
2. Review the API documentation in this README
3. Check the TypeScript types for detailed interfaces
4. Look at the existing game implementations for integration examples

## Contributing

When adding new games or features:

1. **Extend the GameType union** with new game types
2. **Add game-specific scoring logic** in `calculateAdditionalBonuses()`
3. **Implement achievement checks** in `getGameAchievementChecks()`
4. **Update database schema** if new data fields are needed
5. **Add comprehensive tests** for new functionality
6. **Update documentation** with new features

---

The GameManager provides a robust, scalable foundation for all game-related functionality in the Constitution Learning Hub, ensuring consistent gameplay experience and comprehensive progress tracking.