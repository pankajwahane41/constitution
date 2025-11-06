# Constitution Learning Hub - AI Coding Instructions

## Project Overview
This is a comprehensive **gamified educational platform** for learning the Indian Constitution. Built with React, TypeScript, Vite, and extensive use of Radix UI components. The app features a sophisticated gamification engine with points, achievements, daily challenges, mini-games, and story mode.

## Architecture Fundamentals

### Core Gamification System
- **PointCalculator** (`src/lib/pointCalculator.ts`) - Single source of truth for ALL point calculations
- **GamificationEngine** (`src/lib/gamification.ts`) - Orchestrates achievements, badges, and rewards using PointCalculator
- **ConstitutionDB** (`src/lib/storage.ts`) - IndexedDB wrapper with event-sourcing pattern
- **UserProfile** (`src/types/gamification.ts`) - Central user state with coins, XP, achievements, streaks

### State Management Pattern
The app uses a **centralized state pattern** in `App.tsx` with the main `AppState` object managing:
```tsx
const [appState, setAppState] = useState<AppState>({
  currentView: 'home' | 'learn' | 'quiz' | 'games' | 'profile' | 'challenges',
  userProfile: UserProfile | null,
  currentGame: GameType | null,
  // ... other view states
});
```

### Mobile-First Architecture
- **Responsive Components**: Separate mobile components (`MobileNavigation`, `MobileDashboard`, `MobileQuestionCard`)
- **Mobile Detection**: Use `useIsMobile()` and `useScreenSize()` hooks from `src/hooks/useIsMobile`
- **Mobile CSS**: Dedicated `mobile.css` for mobile-specific styles

## Critical Development Patterns

### Point System Integration
**NEVER** hardcode point calculations. Always use PointCalculator:
```typescript
// ✅ Correct
const result = PointCalculator.calculateQuizPoints(performance, userProfile, streak);

// ❌ Wrong - creates inconsistencies
const points = score * 5 + bonus;
```

### Gamification Flow
1. User completes activity → 2. Process through GamificationEngine → 3. Update UserProfile → 4. Save to ConstitutionDB
```typescript
const rewards = await gamificationEngine.processQuizCompletion(userProfile, quizSession);
await updateUserProfile({ ...userProfile, ...rewards });
```

### Component Loading Strategy
Components are **lazy-loaded** for performance. New components should follow this pattern:
```tsx
const NewComponent = lazy(() => import('./components/NewComponent'));

// In JSX
<Suspense fallback={<SectionLoader>Loading New Component...</SectionLoader>}>
  <NewComponent />
</Suspense>
```

## Key Development Workflows

### Adding New Game Types
1. Create game component in `src/components/games/`
2. Add GameType to `src/types/gamification.ts`
3. Update `GameRouter.tsx` with new case
4. Add scoring logic to PointCalculator if needed
5. Test integration with `gamification-integration-test.js`

### Testing Strategy
- **Integration Tests**: Use existing `.js` test files in root (e.g., `unified-point-system-test.js`)
- **Manual Testing**: Run `pnpm dev` and test on both desktop and mobile viewports
- **Point Validation**: Use `PointCalculator.validateCalculation()` for debugging

### Build Commands
```bash
pnpm dev                    # Development with hot reload
pnpm build                  # Production build
pnpm build:prod            # Production build with BUILD_MODE=prod
pnpm preview               # Preview production build
```

## Data Flow Architecture

### Quiz/Game Completion Flow
```
Component → GameRouter → GamificationEngine → PointCalculator → ConstitutionDB → UserProfile Update → UI Refresh
```

### Daily Challenges System
- Real-time progress tracking from IndexedDB
- Auto-completion detection every 30 seconds
- Midnight reset with `DailyResetService`
- Mobile-optimized countdown timers

### Storage Pattern
All persistent data goes through `ConstitutionDB` which implements:
- Event sourcing for audit trails
- Atomic state management to prevent race conditions
- Automatic daily resets and cleanup

## Component Conventions

### Props Interface Pattern
```typescript
interface ComponentProps {
  userProfile: UserProfile;
  onGameComplete: (gameType: string, results: any) => void;
  onBack: () => void;
}
```

### Error Boundary Usage
Wrap lazy components in `<ErrorBoundary>` for graceful failure handling.

### Mobile Responsive Pattern
```tsx
const isMobile = useIsMobile();
return isMobile ? <MobileVersion /> : <DesktopVersion />;
```

## Critical Files to Understand
- `src/App.tsx` - Main application state and navigation
- `src/lib/gamification.ts` - Core gamification logic
- `src/lib/pointCalculator.ts` - All point calculation logic
- `src/types/gamification.ts` - Type definitions
- `src/components/GameRouter.tsx` - Game routing and integration
- `public/data/` - Static educational content (JSON files)

## Common Gotchas
- Always check if `userProfile` and `gamificationEngine` exist before using
- Use `getStoredData()` and `setStoredData()` from `lib/utils` for localStorage
- Mobile components may have different prop requirements than desktop versions
- Point calculations must go through PointCalculator to maintain consistency across the entire system