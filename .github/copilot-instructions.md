# Constitution Learning Hub - AI Coding Assistant Guide

## Project Overview
This is a **React TypeScript** gamified educational platform focused on the Indian Constitution. The app transforms constitutional learning through interactive quizzes, games, and Dr. B.R. Ambedkar's story mode. Built with modern React patterns, comprehensive gamification, and mobile-first design.

## Architecture & Key Patterns

### Core Stack
- **Frontend**: React 18 + TypeScript + Vite + Path Aliases (`@/` → `src/`)
- **UI**: Radix UI + Tailwind CSS + Framer Motion + class-variance-authority (CVA)
- **State**: Unified AppState in App.tsx + IndexedDB (no external state management)
- **Storage**: Custom `ConstitutionDB` singleton with event sourcing + atomic operations
- **Routing**: React Router DOM with React.lazy() for all major sections

### Critical Component Structure
```
src/
├── components/           # Main UI components (ALL lazy-loaded in App.tsx)
│   ├── games/           # Educational games with unified GameManager integration
│   │   ├── index.ts     # Games export hub
│   │   └── *.tsx        # Individual games (PreambleBuilder, RightsPuzzle, etc.)
│   ├── ui/              # Radix UI component wrappers with CVA styling
│   └── Mobile*.tsx      # Mobile-first variants (MobileNavigation, MobileDashboard, etc.)
├── lib/                 # Core business logic - NEVER modify scoring outside PointCalculator
│   ├── gamification.ts  # GamificationEngine - achievement & badge system
│   ├── storage.ts       # ConstitutionDB singleton with event sourcing pattern
│   ├── pointCalculator.ts # PointCalculator - UNIFIED scoring (all points go through here)
│   ├── atomicStateManager.ts # Race condition prevention
│   └── storyMode.ts     # AmbedkarStoryMode progression system
├── hooks/               # Custom hooks (useIsMobile for responsive behavior)
├── types/               # TypeScript interfaces (gamification.ts is the main one)
└── public/data/         # Static JSON files loaded at runtime (NOT in src/)
```

### State Management Pattern
The app uses **unified state architecture** via `App.tsx` with an `AppState` interface:
- Single source of truth in main App component (1392 lines - all major routing logic)
- Lazy-loaded sections with `SectionLoader` component for performance
- Mobile-specific components detected via `useIsMobile()` hook (screen width + user agent)
- `AtomicStateManager` prevents race conditions in critical operations
- All components imported as `React.lazy()` for code splitting

### Gamification System
**Critical**: All scoring goes through `PointCalculator` class - never calculate points manually:
```typescript
// Correct - use PointCalculator
const result = PointCalculator.calculateQuizScore(performance);
const gameResult = PointCalculator.calculateGameScore(gamePerformance);

// Incorrect - don't hardcode point values
const points = correctAnswers * 10; // Don't do this
```

Key classes:
- `GamificationEngine`: Achievements, badges, user progression with TimeSync integration
- `PointCalculator`: All scoring calculations (unified system) - 1200+ lines of logic
- `UserProfile`: Complete user state with daily limits, streaks, and virtual currency
- `ConstitutionDB`: Singleton storage with event sourcing + atomic operations (982 lines)
- `GameManager`: Unified game state management with analytics (see GAME_MANAGER_README.md)

## Development Workflows

### Build & Deploy
```bash
# Development
npm run dev                    # Starts Vite dev server

# Production builds
npm run build:prod            # TypeScript + Vite production build
npm run deploy:aws            # Deploy to AWS S3 + CloudFront via deploy-aws.bat
npm run deploy:aws:infra      # Deploy infrastructure only
npm run deploy:aws:app        # Deploy application only
```

**Critical**: Uses pnpm for package management. Deploy script supports Windows (.bat) and includes AWS CLI validation.

### Data Management
Educational content lives in `public/data/*.json` - these are static files loaded at runtime:
- Quiz questions organized by constitutional topics (30+ JSON files)
- Story mode content for Ambedkar's journey (`ambedkar_*.json`)
- Achievement definitions and badge metadata
- **Important**: Content is in `public/data/`, NOT `src/data/` - ensures runtime loading

### Mobile Development
**Always check mobile implementations**: Most components have `Mobile*` variants in `components/`. Use the `useIsMobile()` hook to conditionally render:
```typescript
const isMobile = useIsMobile();
return isMobile ? <MobileQuestionCard /> : <QuestionCard />;
```

### Game Development
Games follow a standard pattern in `components/games/`:
- Extend base game interface with scoring integration
- Use `GameManager` for state persistence and analytics (see GAME_MANAGER_README.md)
- Implement difficulty progression through `PointCalculator`
- Register achievements in `gamification.ts`
- Export through `games/index.ts` hub for clean imports

## Integration Points

### Storage Layer
All persistence goes through `ConstitutionDB` class:
```typescript
// Correct pattern
const db = ConstitutionDB.getInstance();
await db.saveUserProfile(profile);

// Use atomic operations for critical updates
await this.stateManager.executeAtomicOperation(async (state) => {
  // Multiple related updates here
});
```

### Quiz System
Quizzes use `QuizSession` interface with comprehensive tracking:
- Question randomization with duplicate prevention
- Time-based scoring with accuracy bonuses  
- Achievement integration for milestones
- Mobile-optimized question cards

### Deployment Architecture
**AWS-focused**: The app deploys to S3 + CloudFront via `deploy-aws.bat`:
- Static site with CDN distribution
- Amplify integration for CI/CD
- Environment-specific builds (`BUILD_MODE=prod`)

## Project-Specific Conventions

### File Naming
- Components: PascalCase (`QuestionCard.tsx`)
- Mobile variants: `Mobile` prefix (`MobileNavigation.tsx`)
- Games: Descriptive names (`PreambleBuilderGame.tsx`)
- Utils/libs: camelCase (`gamification.ts`)

### TypeScript Patterns
- Interfaces in `types/` directory with descriptive names
- Strict typing with comprehensive interface definitions
- Lazy loading with React.lazy() for performance

### Error Handling
Use `ErrorBoundary` component and comprehensive validation:
- Race condition prevention in quiz processing
- Timeout mechanisms for long-running operations
- Fallback UI states for failed lazy loads

## Testing & Validation

### Performance Focus
- Lazy loading for all major sections
- Mobile-first responsive design
- Bundle size optimization (<640KB target)
- Lighthouse score 95+ maintained

### Key Files to Reference
- `App.tsx`: Main application state and routing logic
- `src/lib/gamification.ts`: Achievement and progression systems
- `src/lib/storage.ts`: Data persistence patterns
- `GAME_MANAGER_README.md`: Game system architecture
- `public/data/`: Educational content structure

When working on this codebase, prioritize mobile responsiveness, maintain the unified scoring system through PointCalculator, and ensure all user progress is properly persisted through the ConstitutionDB system.