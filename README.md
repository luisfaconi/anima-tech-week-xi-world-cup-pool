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

# 5. Popular banco com dados da Copa (IMPORTANTE!)
pnpm --filter api seed
```

### Desenvolvimento
```bash
# 1. Subir o banco (se não estiver rodando)
pnpm db:up

# 2. Iniciar aplicação
pnpm dev

```

**Comandos Adicionais:**
```bash
# Apenas API
pnpm --filter api dev

# Apenas Web
pnpm --filter web dev

# Testes
pnpm test

# Prisma Studio
cd apps/api && npx prisma studio
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
# Usuários
POST   /api/users                    # Criar usuário
GET    /api/users/:id                # Buscar usuário por ID
GET    /api/users?email=X            # Buscar usuário por email

# Bolões
POST   /api/pools                    # Criar bolão
POST   /api/pools/:id/join           # Entrar em bolão
GET    /api/pools/:id                # Detalhes do bolão
GET    /api/pools?userId=X           # Listar bolões do usuário
PUT    /api/pools/:id                # Atualizar bolão
DELETE /api/pools/:id/members/:userId # Remover membro
GET    /api/pools/:id/members        # Listar membros

# Partidas
GET    /api/matches                  # Listar partidas
GET    /api/matches/:id              # Buscar partida

# Palpites
POST   /api/picks                    # Criar palpite
PUT    /api/picks/:id                # Atualizar palpite
GET    /api/picks/user/:userId       # Palpites do usuário (com filtro por poolId)
DELETE /api/picks/:id                # Deletar palpite (antes do deadline)

# Ranking
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

## 🔄 Reinicialização Completa do Ambiente

Se você precisa reiniciar o ambiente do zero (limpar todos os dados):

```bash
# 1. Parar e remover volumes (apaga todos os dados!)
pnpm db:down
docker compose down -v

# 2. Subir banco novamente
pnpm db:up

# 4. Aplicar migrações
pnpm --filter api db:migrate

# 5. Popular com dados da Copa
pnpm --filter api seed

# 6. Iniciar desenvolvimento
pnpm dev
```

> **⚠️ Nota:** O comando `docker compose down -v` remove TODOS os dados do banco permanentemente.

## 🌟 Features Implementadas

### Phase 0: Pre-Workshop Setup
- ✅ **Cadastro de Jogos da Copa** (Tarefa 1)
  - 64 jogos da Copa do Mundo 2026
  - Seed script completo com dados reais
  - Validação de dados

- ✅ **Criação e Gerenciamento de Bolões** (Tarefa 2)
  - CRUD completo de bolões
  - Sistema de convites por código único
  - Gerenciamento de membros
  - Regras de pontuação configuráveis
  - Lookup dinâmico de usuários

- ✅ **Realização de Palpites** (Tarefa 3)
  - Sistema completo de palpites integrado com banco de dados
  - Criar/editar/deletar palpites
  - Validação de deadline (não permite após início do jogo)
  - Associar palpites a bolões e usuários
  - Interface intuitiva com dados reais
  - Histórico de palpites do usuário
  - Suporte a múltiplos bolões por usuário

### Qualidade e Arquitetura
- ✅ Clean Architecture (Domain, Application, Infrastructure, Interface)
- ✅ Testes unitários (20 testes passando)
- ✅ Validação de dados (Zod)
- ✅ Tratamento de erros consistente
- ✅ Documentação completa
- ✅ TypeScript strict mode

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