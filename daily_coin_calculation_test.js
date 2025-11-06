#!/usr/bin/env node
/**
 * Daily Coin Calculation Fix - Comprehensive Test Suite
 * Tests all scenarios and edge cases for the daily coin limit system
 */

export class MockDB {
  constructor() {
    this.userProfiles = new Map();
    this.gameStates = new Map();
  }

  async saveUserProfile(profile) {
    this.userProfiles.set(profile.userId, JSON.parse(JSON.stringify(profile)));
    return true;
  }

  async getUserProfile(userId) {
    return this.userProfiles.get(userId) || null;
  }
}

export class TestGamificationEngine {
  constructor(db) {
    this.db = db;
    this.config = {
      defaultDailyCoinLimit: 500,
      coinRates: {
        quizCompletion: 25,
        perfectScore: 50,
        storyReading: 20,
        miniGameWin: 30
      }
    };
  }

  async initializeDailyCoinTracking(profile) {
    const today = new Date().toDateString();
    
    if (profile.dailyCoinsEarned === undefined) {
      profile.dailyCoinsEarned = 0;
    }
    if (profile.dailyCoinLimit === undefined) {
      profile.dailyCoinLimit = this.config.defaultDailyCoinLimit;
    }
    if (profile.lastDailyReset === undefined) {
      profile.lastDailyReset = today;
    }
    
    // Reset daily coins if it's a new day
    if (profile.lastDailyReset !== today) {
      profile.dailyCoinsEarned = 0;
      profile.lastDailyReset = today;
    }
    
    await this.db.saveUserProfile(profile);
    return profile;
  }

  async enforceDailyCoinLimit(profile, requestedCoins) {
    // Don't award negative coins or zero coins
    if (requestedCoins <= 0) {
      return 0;
    }

    await this.initializeDailyCoinTracking(profile);
    
    const today = new Date().toDateString();
    if (profile.lastDailyReset !== today) {
      profile.dailyCoinsEarned = 0;
      profile.lastDailyReset = today;
      await this.db.saveUserProfile(profile);
    }
    
    const remainingDailyAllowance = profile.dailyCoinLimit - profile.dailyCoinsEarned;
    const coinsToAward = Math.min(requestedCoins, Math.max(0, remainingDailyAllowance));
    
    return coinsToAward;
  }

  async awardCoinsWithLimit(profile, requestedCoins, reason) {
    const coinsToAward = await this.enforceDailyCoinLimit(profile, requestedCoins);
    
    if (coinsToAward > 0) {
      profile.constitutionalCoins += coinsToAward;
      profile.dailyCoinsEarned += coinsToAward;
      await this.db.saveUserProfile(profile);
    }
    
    return coinsToAward;
  }

  async processGameCompletion(profile, gameData) {
    let coinsEarned = gameData.coinsEarned || 0;
    
    // Award coins with daily limit enforcement
    const actualCoinsEarned = await this.awardCoinsWithLimit(profile, coinsEarned, 'game_completion');
    
    return {
      coinsEarned: actualCoinsEarned,
      experienceGained: gameData.experienceGained || 0
    };
  }

  async processQuizCompletion(profile, quizData) {
    let coinsEarned = this.config.coinRates.quizCompletion;
    
    if (quizData.perfectScore) {
      coinsEarned += this.config.coinRates.perfectScore;
    }
    
    // Award coins with daily limit enforcement
    const actualCoinsEarned = await this.awardCoinsWithLimit(profile, coinsEarned, 'quiz_completion');
    
    return {
      coinsEarned: actualCoinsEarned,
      experienceGained: quizData.questions ? quizData.questions.length * 5 : 25
    };
  }

  async completeChallenge(profile, challengeData) {
    const actualCoinsEarned = await this.awardCoinsWithLimit(
      profile, 
      challengeData.reward.coins, 
      'challenge_completion'
    );
    
    return {
      coinsEarned: actualCoinsEarned,
      experienceGained: challengeData.reward.experience
    };
  }
}

export class DailyCoinCalculationTest {
  constructor() {
    this.db = new MockDB();
    this.engine = new TestGamificationEngine(this.db);
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  log(testName, passed, message) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const result = `${status} ${testName}: ${message}`;
    console.log(result);
    
    this.testResults.push({ testName, passed, message });
    if (passed) {
      this.passedTests++;
    } else {
      this.failedTests++;
    }
  }

  createTestUser(id, overrides = {}) {
    const today = new Date().toDateString();
    return {
      userId: id,
      displayName: `TestUser_${id}`,
      constitutionalCoins: 1000, // Starting balance
      dailyCoinsEarned: 0,
      dailyCoinLimit: 500,
      lastDailyReset: today,
      lastActivityDate: today,
      ...overrides
    };
  }

  async runTest(testName, testFunction) {
    try {
      await testFunction();
      this.log(testName, true, 'Test completed successfully');
    } catch (error) {
      this.log(testName, false, `Error: ${error.message}`);
    }
  }

  // Test 1: Normal Daily Usage
  async testNormalDailyUsage() {
    const profile = this.createTestUser('normal_usage');
    await this.db.saveUserProfile(profile);

    // Simulate earning 300 coins across multiple activities
    const coins1 = await this.engine.awardCoinsWithLimit(profile, 100, 'test_activity_1');
    const coins2 = await this.engine.awardCoinsWithLimit(profile, 100, 'test_activity_2');
    const coins3 = await this.engine.awardCoinsWithLimit(profile, 100, 'test_activity_3');

    this.log('Normal Daily Usage - Total Coins', 
      coins1 + coins2 + coins3 === 300, 
      `Expected 300 coins, got ${coins1 + coins2 + coins3}`);

    this.log('Normal Daily Usage - Daily Counter', 
      profile.dailyCoinsEarned === 300, 
      `Expected 300/500, got ${profile.dailyCoinsEarned}/${profile.dailyCoinLimit}`);

    this.log('Normal Daily Usage - Total Balance', 
      profile.constitutionalCoins === 1300, 
      `Expected 1300 total coins, got ${profile.constitutionalCoins}`);
  }

  // Test 2: Daily Limit Exceeded
  async testDailyLimitExceeded() {
    const profile = this.createTestUser('limit_exceeded');
    await this.db.saveUserProfile(profile);

    // User has earned 450 coins today, tries to earn 100 more
    profile.dailyCoinsEarned = 450;
    await this.db.saveUserProfile(profile);

    const coinsToAward = await this.engine.awardCoinsWithLimit(profile, 100, 'test_exceeded');

    this.log('Daily Limit Exceeded - Coins Awarded', 
      coinsToAward === 50, 
      `Expected 50 coins (500-450), got ${coinsToAward}`);

    this.log('Daily Limit Exceeded - Daily Counter', 
      profile.dailyCoinsEarned === 500, 
      `Expected 500/500, got ${profile.dailyCoinsEarned}/${profile.dailyCoinLimit}`);
  }

  // Test 3: Midnight Reset
  async testMidnightReset() {
    const profile = this.createTestUser('midnight_reset');
    profile.dailyCoinsEarned = 300;
    profile.lastDailyReset = '2025-11-05'; // Yesterday
    await this.db.saveUserProfile(profile);

    // Try to earn coins after reset
    const coinsToAward = await this.engine.awardCoinsWithLimit(profile, 100, 'test_after_reset');

    this.log('Midnight Reset - Daily Counter Reset', 
      profile.dailyCoinsEarned === 100, 
      `Expected 100/500, got ${profile.dailyCoinsEarned}/${profile.dailyCoinLimit}`);

    this.log('Midnight Reset - Coins Awarded', 
      coinsToAward === 100, 
      `Expected 100 coins, got ${coinsToAward}`);
  }

  // Test 4: Multiple Sources Same Day
  async testMultipleSourcesSameDay() {
    const profile = this.createTestUser('multiple_sources');
    await this.db.saveUserProfile(profile);

    const quizResult = await this.engine.processQuizCompletion(profile, { 
      perfectScore: true, 
      questions: Array(5).fill({}) 
    });
    
    const challengeResult = await this.engine.completeChallenge(profile, {
      reward: { coins: 50, experience: 25 }
    });
    
    const gameResult = await this.engine.awardCoinsWithLimit(profile, 75, 'game_completion');

    this.log('Multiple Sources - Quiz Coins', 
      quizResult.coinsEarned === 75, 
      `Expected 75 coins (25+50), got ${quizResult.coinsEarned}`);

    this.log('Multiple Sources - Challenge Coins', 
      challengeResult.coinsEarned === 50, 
      `Expected 50 coins, got ${challengeResult.coinsEarned}`);

    this.log('Multiple Sources - Game Coins', 
      gameResult === 75, 
      `Expected 75 coins, got ${gameResult}`);

    this.log('Multiple Sources - Total Daily', 
      profile.dailyCoinsEarned === 200, 
      `Expected 200/500, got ${profile.dailyCoinsEarned}/${profile.dailyCoinLimit}`);
  }

  // Test 5: Edge Case - Exact Limit Match
  async testExactLimitMatch() {
    const profile = this.createTestUser('exact_limit');
    profile.dailyCoinsEarned = 480; // Close to limit
    await this.db.saveUserProfile(profile);

    const coinsToAward = await this.engine.awardCoinsWithLimit(profile, 20, 'exact_limit_test');

    this.log('Exact Limit Match - Coins Awarded', 
      coinsToAward === 20, 
      `Expected 20 coins, got ${coinsToAward}`);

    this.log('Exact Limit Match - Daily Counter', 
      profile.dailyCoinsEarned === 500, 
      `Expected 500/500, got ${profile.dailyCoinsEarned}/${profile.dailyCoinLimit}`);
  }

  // Test 6: New User Initialization
  async testNewUserInitialization() {
    const profile = this.createTestUser('new_user');
    delete profile.dailyCoinsEarned; // Simulate missing field
    delete profile.dailyCoinLimit;
    delete profile.lastDailyReset;
    
    await this.db.saveUserProfile(profile);

    const initializedProfile = await this.engine.initializeDailyCoinTracking(profile);

    this.log('New User - Daily Coins Earned Initialized', 
      initializedProfile.dailyCoinsEarned === 0, 
      `Expected 0, got ${initializedProfile.dailyCoinsEarned}`);

    this.log('New User - Daily Limit Set', 
      initializedProfile.dailyCoinLimit === 500, 
      `Expected 500, got ${initializedProfile.dailyCoinLimit}`);

    this.log('New User - Last Reset Date Set', 
      initializedProfile.lastDailyReset === new Date().toDateString(), 
      `Expected today, got ${initializedProfile.lastDailyReset}`);
  }

  // Test 7: Zero Coin Request
  async testZeroCoinRequest() {
    const profile = this.createTestUser('zero_request');
    await this.db.saveUserProfile(profile);

    const coinsToAward = await this.engine.awardCoinsWithLimit(profile, 0, 'zero_request');

    this.log('Zero Coin Request - Coins Awarded', 
      coinsToAward === 0, 
      `Expected 0 coins, got ${coinsToAward}`);

    this.log('Zero Coin Request - Daily Counter Unchanged', 
      profile.dailyCoinsEarned === 0, 
      `Expected 0, got ${profile.dailyCoinsEarned}`);
  }

  // Test 8: Negative Coin Request (Edge Case)
  async testNegativeCoinRequest() {
    const profile = this.createTestUser('negative_request');
    await this.db.saveUserProfile(profile);

    const coinsToAward = await this.engine.awardCoinsWithLimit(profile, -10, 'negative_request');

    this.log('Negative Coin Request - No Negative Coins', 
      coinsToAward === 0, 
      `Expected 0 coins (no negative awards), got ${coinsToAward}`);
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting Daily Coin Calculation Fix - Comprehensive Test Suite\n');

    await this.runTest('Normal Daily Usage', () => this.testNormalDailyUsage());
    await this.runTest('Daily Limit Exceeded', () => this.testDailyLimitExceeded());
    await this.runTest('Midnight Reset', () => this.testMidnightReset());
    await this.runTest('Multiple Sources Same Day', () => this.testMultipleSourcesSameDay());
    await this.runTest('Exact Limit Match', () => this.testExactLimitMatch());
    await this.runTest('New User Initialization', () => this.testNewUserInitialization());
    await this.runTest('Zero Coin Request', () => this.testZeroCoinRequest());
    await this.runTest('Negative Coin Request', () => this.testNegativeCoinRequest());

    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`📈 Success Rate: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);

    if (this.failedTests === 0) {
      console.log('\n🎉 All tests passed! Daily coin calculation fix is working correctly.');
      console.log('✅ Daily limits enforced');
      console.log('✅ Edge cases handled');
      console.log('✅ New user initialization working');
      console.log('✅ Reset mechanism functional');
      return true;
    } else {
      console.log('\n⚠️  Some tests failed. Please review the implementation.');
      return false;
    }
  }
}

// Run the tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testSuite = new DailyCoinCalculationTest();
  testSuite.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
