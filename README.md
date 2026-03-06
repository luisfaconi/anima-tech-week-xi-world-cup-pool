# World Cup Pool - Spec Driven Development Workshop

Um projeto prático para demonstrar desenvolvimento orientado por especificação com IA, construído durante o workshop da Animatec Week.

## 🏆 Sobre o Projeto

Este é um sistema de bolão da Copa do Mundo onde usuários podem:
- Criar conta
- Fazer palpites nos jogos
- Competir no ranking com outros usuários

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (Em execução)

### Instalação Completa (1 comando)
```bash
pnpm setup
```

### Ou passo a passo:
```bash
# 1. Instalar dependências
pnpm install

# 2. Copiar variáveis de ambiente
cp .env.example .env
cp .env.example apps/api/.env

# 3. Subir banco de dados
pnpm db:up

# 4. Aplicar migrações
pnpm --filter api db:migrate
```

### Desenvolvimento
```bash
# Rodar tudo (API + Web)
pnpm dev

# Apenas API
pnpm --filter api dev

# Apenas Web
pnpm --filter web dev

# Testes
pnpm test
```

## 🏗️ Arquitetura

### Backend (Clean Architecture)
```
apps/api/src/
├── domain/           # Entidades e regras de negócio puras
├── application/      # Casos de uso e portas (interfaces)
├── infrastructure/   # Implementações (Prisma, etc)
└── interfaces/http/  # Controllers e rotas HTTP
```

### Frontend (Vue 3 + Clean Components)
```
apps/web/src/
├── pages/           # Componentes de rota
├── components/      # Componentes reutilizáveis
├── stores/          # Estado global (Pinia)
├── services/api/    # Cliente HTTP
└── router/          # Configuração de rotas
```

## 🛠️ Stack Tecnológica

**Backend:**
- Node.js + TypeScript
- Fastify (HTTP server)
- Prisma (ORM)
- PostgreSQL (Docker)
- Jest (testes)
- Zod (validação)

**Frontend:**
- Vue 3 + TypeScript
- Vite (build tool)
- Vue Router (roteamento)
- Pinia (estado global)

**DevTools:**
- pnpm (workspace management)
- Docker Compose (database)
- ESLint + TypeScript

## 📋 Endpoints da API

```
POST   /api/users                    # Criar usuário
GET    /api/users/:id                # Buscar usuário

GET    /api/matches                  # Listar partidas
GET    /api/matches/:id              # Buscar partida

POST   /api/picks                    # Criar palpite
PUT    /api/picks/:id                # Atualizar palpite
GET    /api/picks/user/:userId       # Palpites do usuário

GET    /api/leaderboard              # Ranking geral
```

## 🎯 Para IAs/Assistentes

**IMPORTANTE:** Sempre leia o arquivo `AGENTS.md` antes de fazer alterações. Ele contém:
- Regras de arquitetura obrigatórias
- Padrões de código a seguir
- Comandos de setup e desenvolvimento
- Guidelines de qualidade

### Comandos Úteis para IA
```bash
# Ler documentação principal
cat AGENTS.md

# Ver estrutura do projeto
tree -I node_modules

# Rodar testes antes de commitar
pnpm test

# Ver logs do banco
docker compose logs db
```

## 📚 Documentação

- [`AGENTS.md`](./AGENTS.md) - Guidelines para desenvolvimento com IA
- [`docs/spec.md`](./docs/spec.md) - Especificação técnica completa
- [`docs/api.md`](./docs/api.md) - Documentação da API REST

## 🧪 Testes

```bash
# Rodar todos os testes
pnpm test

# Testes em modo watch
pnpm --filter api test:watch

# Coverage
pnpm --filter api test --coverage
```

## 🐳 Docker

```bash
# Subir apenas o banco
pnpm db:up

# Ver logs do banco
docker compose logs -f db

# Parar tudo
pnpm db:down

# Resetar banco (cuidado!)
docker compose down -v
```

## 🌟 Features Implementadas

- ✅ CRUD de usuários
- ✅ CRUD de partidas
- ✅ CRUD de palpites
- ✅ Sistema de pontuação
- ✅ Ranking/leaderboard
- ✅ Testes unitários
- ✅ Validação de dados
- ✅ Clean Architecture
- ✅ Documentação completa

## 🎓 Workshop: Spec Driven Development

Este projeto demonstra como:
1. **Especificar** requisitos claramente em `docs/`
2. **Documentar** padrões em `AGENTS.md`
3. **Guiar** IAs com regras arquiteturais
4. **Manter** qualidade com testes
5. **Iterar** rapidamente com feedback

### Fluxo do Workshop
1. IA lê `AGENTS.md` e `docs/spec.md`
2. Implementa seguindo padrões estabelecidos
3. Executa testes para validar
4. Itera baseado no feedback
5. Mantém documentação atualizada

---

Feito com ❤️ para a Anima Tech Week | Spec Driven Development