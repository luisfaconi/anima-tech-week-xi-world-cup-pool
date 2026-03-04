# World Cup Pool - Technical Specification

## Overview
A simple World Cup betting pool application where users can predict match scores and compete with friends.

## Features Roadmap

### 🚀 Phase 0: Pre-Workshop Setup
**⭐ Recomendação: Implementar ANTES do workshop**

#### 1. **Cadastro de Jogos da Copa**
- **Complexidade**: Baixa | **Tempo**: 5min | **Impacto**: ⭐
- Seed/script admin que popula base com jogos reais da Copa
- Times, datas, horários, grupos e fases
- Dados estruturados para demonstração realista
- **Deliverable**: Script `pnpm seed` funcional

### 🎯 Phase 1: Core Features (Durante Workshop)
**⭐⭐⭐ Recomendação ALTA: Implementar AO VIVO**

#### 2. **Criação e Gerenciamento de Bolões**
- **Complexidade**: Baixa-Média | **Tempo**: 10-15min | **Impacto**: ⭐⭐
- Criar bolão com nome personalizado
- Definir regras básicas de pontuação
- Gerar código de convite único
- Gerenciar participantes do bolão
- **Deliverable**: CRUD completo de bolões

#### 3. **Realização de Palpites**
- **Complexidade**: Média | **Tempo**: 15-20min | **Impacto**: ⭐⭐⭐
- Interface intuitiva para registrar palpites
- Validação de prazos (não permite após início do jogo)
- Histórico de palpites do usuário
- Edição de palpites antes do deadline
- **Deliverable**: Sistema completo de palpites

#### 4. **Cálculo Automático de Pontuação**
- **Complexidade**: Média | **Tempo**: 10-15min | **Impacto**: ⭐⭐⭐
- Sistema configurável de regras de pontuação
- Cálculo automático após resultado do jogo
- Histórico detalhado de pontuação
- Multiple scoring systems support
- **Deliverable**: Engine de pontuação flexível

#### 5. **Ranking do Bolão em Tempo Real**
- **Complexidade**: Baixa-Média | **Tempo**: 8-12min | **Impacto**: ⭐⭐⭐
- Tabela classificatória dinâmica
- Ordenação por pontuação total
- Estatísticas individuais (acertos, pontos médios)
- Filtros por bolão e período
- **Deliverable**: Leaderboard responsivo e atualizado

### 🤖 Phase 2: AI-Powered Features (Workshop Highlight) - Fase futura (dever de casa)
**Demonstra capacidade da IA**

#### 6. **🌟 Assistente de Palpites com IA**
- **Complexidade**: Média-Alta | **Tempo**: 20-25min | **Impacto**: ⭐⭐⭐
- **✅✅✅ DEMONSTRA IA**: Este é o destaque do workshop!
- IA sugere palpites baseada em:
  - Histórico de confrontos entre times
  - Performance recente dos times
  - Estatísticas de gols, defesa, etc.
  - Contexto do campeonato (fase, importância)
- Interface conversacional para sugestões
- Explicação das recomendações da IA
- **Deliverable**: Chat bot integrado com sugestões inteligentes

### 🔧 Phase 3: Enhanced Features (Opcional)
**⭐ Recomendação BAIXA: Se sobrar tempo**

#### 7. **Integração com Calendário**
- **Complexidade**: Média | **Tempo**: 12-18min | **Impacto**: ⭐⭐
- Adicionar jogos ao Google/Apple Calendar
- Lembretes antes dos jogos importantes
- Sincronização automática de horários
- **Deliverable**: Feature de export para calendário

## Core MVP Features (Base)
1. **User Management**
   - Create user account (name + email)
   - Simple user authentication (no complex auth for workshop)

2. **Match Management**
   - List upcoming/ongoing World Cup matches
   - Display match details (teams, date, time)
   - Update match results (admin functionality)

3. **Basic Predictions (Picks)**
   - Users can predict scores for matches
   - One prediction per user per match
   - Predictions can be updated until match starts
   - View own predictions and basic leaderboard

## Technical Architecture

### Backend (Node.js + TypeScript + Fastify)
```
Domain Layer (Pure Business Logic):
- User entity
- Match entity
- Pick entity
- Domain errors and validations

Application Layer (Use Cases):
- CreateUser
- ListMatches
- CreatePick
- UpdatePick
- GetLeaderboard
- Repository interfaces (ports)

Infrastructure Layer (External Concerns):
- Prisma repositories
- Database connection
- External services (if any)

Interface Layer (HTTP API):
- REST endpoints
- Request/response DTOs
- Input validation with Zod
- Error handling middleware
```

### Frontend (Vue 3 + TypeScript + Vite)
```
Pages:
- Home (match list)
- User registration
- Pick creation/editing
- Leaderboard

Components:
- MatchCard
- PickForm
- UserForm
- LeaderboardTable

Services:
- API client (HTTP requests)
- Local storage utilities

Stores (Pinia):
- User store (current user)
- Matches store (matches list)
- Picks store (user predictions)
```

## Database Schema (PostgreSQL)
```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Pools (Bolões) table
CREATE TABLE pools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    owner_id INTEGER REFERENCES users(id),
    scoring_rules JSONB DEFAULT '{"exact_score": 3, "correct_winner": 1, "wrong": 0}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Pool memberships
CREATE TABLE pool_memberships (
    id SERIAL PRIMARY KEY,
    pool_id INTEGER REFERENCES pools(id),
    user_id INTEGER REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(pool_id, user_id)
);

-- Matches table (expanded)
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    team_a VARCHAR(50) NOT NULL,
    team_b VARCHAR(50) NOT NULL,
    team_a_flag VARCHAR(10), -- Country code for flags
    team_b_flag VARCHAR(10),
    scheduled_at TIMESTAMP NOT NULL,
    team_a_score INTEGER,
    team_b_score INTEGER,
    status VARCHAR(20) DEFAULT 'scheduled',
    match_type VARCHAR(30) DEFAULT 'group', -- group, round_16, quarter, semi, final
    group_name VARCHAR(10), -- A, B, C, etc.
    venue VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Picks table (expanded)
CREATE TABLE picks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    match_id INTEGER REFERENCES matches(id),
    pool_id INTEGER REFERENCES pools(id),
    predicted_team_a_score INTEGER NOT NULL,
    predicted_team_b_score INTEGER NOT NULL,
    points INTEGER DEFAULT 0,
    ai_suggested BOOLEAN DEFAULT false, -- Track AI suggestions
    confidence_score FLOAT, -- AI confidence (0-1)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, match_id, pool_id)
);

-- AI suggestions log
CREATE TABLE ai_suggestions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    match_id INTEGER REFERENCES matches(id),
    suggested_team_a_score INTEGER,
    suggested_team_b_score INTEGER,
    confidence FLOAT,
    reasoning TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Calendar integrations
CREATE TABLE calendar_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    match_id INTEGER REFERENCES matches(id),
    calendar_type VARCHAR(20), -- 'google', 'apple', 'outlook'
    event_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Users
```
POST   /api/users                    # Create user
GET    /api/users/:id                # Get user by ID
GET    /api/users                    # List users (for admin)
```

### Pools (Bolões)
```
POST   /api/pools                    # Create new pool
GET    /api/pools                    # List user's pools
GET    /api/pools/:id                # Get pool details
PUT    /api/pools/:id                # Update pool settings
POST   /api/pools/:id/join           # Join pool via invite code
GET    /api/pools/:id/members        # List pool members
DELETE /api/pools/:id/members/:userId # Remove member
```

### Matches
```
GET    /api/matches                  # List all matches
GET    /api/matches/:id              # Get match details
POST   /api/matches                  # Create match (admin)
PUT    /api/matches/:id/result       # Update match result (admin)
GET    /api/matches/upcoming         # Get upcoming matches
GET    /api/matches/live             # Get live matches
```

### Picks (Palpites)
```
POST   /api/picks                    # Create prediction
PUT    /api/picks/:id                # Update prediction
GET    /api/picks/user/:userId       # Get user's picks
GET    /api/picks/match/:matchId     # Get all picks for a match
GET    /api/picks/pool/:poolId       # Get all picks in a pool
DELETE /api/picks/:id               # Delete pick (before deadline)
```

### 🤖 AI Features
```
POST   /api/ai/suggest-pick         # Get AI pick suggestions
GET    /api/ai/match-analysis/:id   # Get AI match analysis
POST   /api/ai/chat                 # Chat with AI assistant
GET    /api/ai/suggestions/history  # Get user's AI suggestion history
```

### Leaderboard & Rankings
```
GET    /api/leaderboard             # Global rankings
GET    /api/pools/:id/leaderboard   # Pool-specific rankings
GET    /api/users/:id/stats         # User statistics
GET    /api/pools/:id/stats         # Pool statistics
```

### Calendar Integration
```
POST   /api/calendar/export         # Export matches to calendar
POST   /api/calendar/subscribe      # Subscribe to match updates
DELETE /api/calendar/unsubscribe    # Unsubscribe from updates
```

## Business Rules

### Core Rules
1. **Picks Constraints**:
   - Users can only create one pick per match per pool
   - Picks cannot be modified after match starts (scheduled_at)
   - Users must be pool members to create picks in that pool

2. **Pool Management**:
   - Each pool has unique invite code (6-digit alphanumeric)
   - Pool owners can modify scoring rules and remove members
   - Users can join multiple pools
   - Inactive pools don't accept new picks

3. **Scoring System** (Configurable per pool):
   - **Exact score**: 3 points (default)
   - **Correct winner**: 1 point (default)
   - **Wrong prediction**: 0 points
   - **Bonus points**: Configurable for special matches (finals, etc.)

4. **Match Lifecycle**:
   - Status flow: 'scheduled' → 'live' → 'finished'
   - Results can only be updated by admin users
   - Points are calculated automatically after match finishes

### 🤖 AI Features Rules
5. **AI Suggestions**:
   - AI can suggest picks for any scheduled match
   - Suggestions include confidence score (0-100%)
   - Users can accept, modify, or reject AI suggestions
   - AI learns from user preferences over time
   - Reasoning is provided for each suggestion

6. **AI Analysis**:
   - Match analysis considers: historical data, team form, head-to-head
   - AI provides match insights and key factors
   - Confidence decreases for less predictable matches
   - Analysis updates as match approaches

### Calendar Integration Rules
7. **Calendar Features**:
   - Users can export matches to personal calendars
   - Reminders sent 1 hour before match deadline
   - Only subscribed users receive calendar updates
   - Users can customize reminder preferences

## Development Priorities for Workshop

### 🎯 Pre-Workshop (5 minutes)
1. **Seed Script**: Populate database with real World Cup matches
   - Teams, dates, groups, venues
   - Realistic match schedule
   - Test data for demonstrations

### 🚀 Phase 1: Core Live Demo (40-50 minutes)
2. **Pool Management**: Create and join pools system
3. **Enhanced Picks**: Full prediction system with pool support
4. **Smart Scoring**: Configurable point calculation engine
5. **Live Rankings**: Real-time leaderboard with statistics

### ⭐ Phase 2 - Workshop Highlight: AI Integration (20-25 minutes)
6. **🤖 AI Pick Assistant**:
   - **MUST HAVE**: This is the workshop's wow factor!
   - Intelligent suggestions with reasoning
   - Confidence scoring
   - Interactive AI chat for match analysis
   - Demonstrates practical AI integration

### 🔧 Optional Extensions (If time permits)
7. **Calendar Integration**: Export matches to personal calendars
8. **Advanced Analytics**: Detailed statistics and insights

## Success Criteria

### Technical Excellence
- ✅ **Clean Architecture**: Clear separation of domain, application, infrastructure
- ✅ **AI Integration**: Working AI assistant with real suggestions
- ✅ **Test Coverage**: Unit tests for core business logic
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **API Design**: RESTful endpoints with proper validation

### Workshop Impact
- ✅ **Demonstrable Features**: All features work live during presentation
- ✅ **Student-Friendly Code**: Readable, well-documented, educational
- ✅ **Quick Setup**: Single command deployment (`pnpm setup`)
- ✅ **AI Showcase**: Clear demonstration of AI capabilities
- ✅ **Scalable Foundation**: Architecture ready for production expansion

### Learning Objectives
- ✅ **Spec-Driven Development**: How proper documentation guides AI development
- ✅ **Clean Architecture**: Practical implementation of architectural patterns
- ✅ **AI Integration**: Real-world AI features that add business value
- ✅ **Modern Stack**: Current industry-standard technologies
- ✅ **Testing Strategy**: Practical approach to quality assurance

## 🎪 Workshop Demo Flow
1. **Show Spec**: "This is our blueprint" (AGENTS.md + spec.md)
2. **Setup**: `pnpm setup` → Everything works in 30 seconds
3. **Core Features**: Live implementation of pools, picks, rankings
4. **AI Magic**: Build the AI assistant live with chat interface
5. **Testing**: Show tests passing and quality metrics
6. **Wow Factor**: Working application with AI suggestions

This specification serves as the definitive guide for AI-driven development during the Animatec Week workshop, emphasizing practical implementation of Spec-Driven Development principles.