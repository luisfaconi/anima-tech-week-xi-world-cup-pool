# AGENTS.md - AI Development Guidelines

## Project Overview
This is a **World Cup Pool** application for the Animatec Week workshop on Spec Driven Development.

## One-time setup
```bash
# Install dependencies
pnpm install

# Start database
pnpm db:up

# Run migrations (after database is up)
pnpm --filter api db:migrate

# Copy environment file
cp .env.example .env
```

## Daily development
```bash
# Start everything (API + Web)
pnpm dev

# Run tests
pnpm test

# Seed database with World Cup data
pnpm --filter api seed

# Stop database
pnpm db:down
```

## Architecture Rules (CRITICAL - ALWAYS FOLLOW)

### Backend (API) - Clean Architecture
1. **domain/** and **application/** MUST NOT import Prisma, Fastify, or any external libraries
2. **Use-cases** (in application/) can only depend on:
   - Domain entities/errors (from domain/)
   - Application ports/interfaces (repositories, services)
   - DTOs and validation schemas
3. **infrastructure/** implements repositories using Prisma
4. **interfaces/http/** is thin: validate input → call use-case → map response
5. **NO business logic in controllers** - keep them simple

### Frontend (Web) - Vue 3 Best Practices
1. **Pages** go in `src/pages/`, **reusable components** in `src/components/`
2. **API calls ONLY through** `src/services/api/*` (no direct fetch in components)
3. **State management** only in Pinia stores (`src/stores/*`) when needed
4. **Use Vue Router** for navigation, keep pages focused and small
5. **Props down, events up** - follow Vue component communication patterns

### 🤖 AI Features Implementation Rules (WORKSHOP HIGHLIGHT)
6. **AI Service Layer**: Create dedicated services for AI functionality
   - `AIPickSuggestionService` for generating predictions
   - `AIChatService` for conversational interface
   - **Mock Implementation**: Use rule-based logic for workshop demo
7. **AI in Clean Architecture**:
   - AI services are **infrastructure layer** concerns
   - Use cases depend on AI service interfaces (ports)
   - Domain remains AI-agnostic
8. **AI API Endpoints**:
   - `/api/ai/suggest-pick` - Generate pick suggestions
   - `/api/ai/chat` - Interactive AI conversations
   - `/api/ai/match-analysis/:id` - Detailed match insights
9. **Frontend AI Integration**:
   - AI components in `src/components/ai/`
   - AI service calls through `src/services/api/ai.ts`
   - AI state in dedicated Pinia store (`src/stores/ai.ts`)

## Technology Constraints
- **Backend**: Node.js + TypeScript + Fastify + Prisma + PostgreSQL + Jest
- **Frontend**: Vue 3 + Vite + Vue Router + Pinia + TypeScript
- **Database**: PostgreSQL (via Docker Compose)
- **Testing**: Jest for backend, focus on use-cases and integration
- **Validation**: Zod for input validation

## Quality Standards
- ✅ **Zod validation** on all API inputs
- ✅ **Jest unit tests** for at least core use-cases
- ✅ **TypeScript strict mode** enabled
- ✅ **Clean separation** of concerns (no mixing layers)
- ✅ **Readable code** for students (clear variable names, simple functions)
- ✅ **Consistent error handling** (domain errors + HTTP error mapping)

## File Structure Standards
```
apps/api/src/
├── domain/           # Entities, Value Objects, Domain Errors
├── application/      # Use Cases, DTOs, Ports (interfaces)
├── infrastructure/   # Repository implementations, database
└── interfaces/http/  # Controllers, routes, HTTP concerns

apps/web/src/
├── pages/           # Route components
├── components/      # Reusable UI components
├── stores/          # Pinia state management
├── services/api/    # HTTP client and API calls
└── router/          # Vue Router configuration
```

## Development Guidelines for AI
1. **ALWAYS read existing code** before making changes
2. **Follow the established patterns** in the codebase
3. **Test your changes** - run `pnpm test` after implementation
4. **Keep it simple** - this is for learning, not production complexity
5. **Document key decisions** in code comments when necessary
6. **Prefer composition over inheritance**
7. **Use TypeScript types** effectively but don't over-engineer

## 🎯 Workshop Feature Implementation Priority

### PHASE 0: Pre-Workshop (Must Complete Before Demo)
- ✅ **Seed Script**: Implement `prisma/seed.ts` with real World Cup matches
- ✅ **Database Schema**: Update Prisma schema with pools, AI suggestions tables
- ✅ **Basic API Structure**: Ensure core CRUD operations work

### PHASE 1: Core Features (Live Implementation - 40 min)
**Implement in this exact order during workshop:**

1. **Pool Management (10 min)**:
   - Pool entity and repository
   - CreatePool, JoinPool use cases
   - Pool CRUD API endpoints
   - Basic pool management UI

2. **Enhanced Picks (15 min)**:
   - Update Pick entity to include poolId
   - Pool-aware pick creation
   - Pick validation (deadline, pool membership)
   - Enhanced pick UI with pool selection

3. **Smart Scoring (8 min)**:
   - Configurable scoring rules in pool settings
   - Point calculation service
   - Automated score updates when match finishes
   - Scoring rules UI

4. **Live Rankings (7 min)**:
   - Pool-specific leaderboard calculation
   - User statistics aggregation
   - Real-time ranking display
   - Ranking UI with filters

### PHASE 2: AI SHOWCASE (25 min - WORKSHOP CLIMAX)
**🤖 This is the main attraction!**

5. **AI Pick Suggestions (15 min)**:
   - Mock AIPickSuggestionService implementation
   - AI suggestion API endpoints
   - Team data mock objects
   - AI suggestion UI components

6. **AI Chat Interface (10 min)**:
   - Simple pattern-matching chat bot
   - Conversational pick recommendations
   - Match analysis responses
   - Interactive chat UI modal

### PHASE 3: Polish (If time remains)
7. **Calendar Integration**: Export matches feature
8. **Advanced Stats**: Detailed analytics

## 🚨 Workshop Implementation Rules

### Critical Success Factors
- **Feature Completeness**: Each phase must be fully working before proceeding
- **Demo-Ready Code**: All features must be visually demonstrable
- **AI Emphasis**: Spend the most time making AI features impressive
- **Error Handling**: Graceful fallbacks, no crashes during demo
- **User Experience**: Intuitive interfaces that work without explanation

### AI Implementation Strategy for Workshop
- **Rule-Based Logic**: Use simple algorithms, not real ML
- **Mock Data**: Pre-populate team statistics and historical data
- **Deterministic Results**: AI suggestions should be consistent for demo
- **Explainable Logic**: Simple reasoning that can be understood quickly
- **Interactive Elements**: Make AI feel conversational and helpful

### Code Quality for Workshop
- **Clean but Fast**: Prioritize working features over perfect architecture
- **TypeScript First**: Strong typing prevents runtime errors during demo
- **Component Reuse**: Build reusable UI components for consistency
- **Error Boundaries**: Prevent single failures from breaking entire demo
- **Loading States**: Show progress to audience during API calls

## Common Anti-patterns to AVOID
❌ Business logic in controllers
❌ Prisma imports in domain/application layers
❌ Direct database queries in components
❌ Massive components (break them down)
❌ Prop drilling (use stores when needed)
❌ Inconsistent error handling
❌ Skipping input validation

Remember: This project demonstrates **clean, maintainable code practices** for students. Keep solutions simple, well-tested, and educational.