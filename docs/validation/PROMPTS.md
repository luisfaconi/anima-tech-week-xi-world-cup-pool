# Documentação de Prompts - Processo de Desenvolvimento

Este documento registra os prompts utilizados no desenvolvimento do projeto World Cup Pool, servindo como referência para desenvolvimento orientado por IA e garantindo rastreabilidade das decisões técnicas.

---

## 📋 Índice

1. [Fase 0: Pre-Workshop Setup](#fase-0-pre-workshop-setup)
   - [Tarefa 1: Cadastro de Jogos da Copa](#tarefa-1---cadastro-de-jogos-da-copa)
   - [Tarefa 2: Criação e Gerenciamento de Bolões](#tarefa-2---criação-e-gerenciamento-de-bolões)
   - [Tarefa 3: Realização de Palpites](#tarefa-3---realização-de-palpites)
2. [Fase 1: Core Features](#fase-1-core-features-durante-workshop)
   - [Tarefa 4: Cálculo Automático de Pontuação](#tarefa-4---cálculo-automático-de-pontuação)
   - [Tarefa 5: Ranking do Bolão em Tempo Real](#tarefa-5---ranking-do-bolão-em-tempo-real)

---

## Fase 0: Pre-Workshop Setup

### TAREFA 1 - Cadastro de Jogos da Copa

**Objetivo**: Implementar seed script completo para popular o banco de dados com jogos reais da Copa do Mundo 2026.

#### 📝 Prompt Inicial

```
Estrutura de Specs:
@/docs/spec.md   - Guidelines para desenvolvimento com IA
@/docs/spec.md   - Especificação técnica completa
@/docs/api.md    - Documentação da API REST

Implemente a tarefa 1. **Cadastro de Jogos da Copa** da Phase 0: Pre-Workshop Setup seguindo TODAS as specs acima.

Siga as especificações 100%
Execute testes para validação.
Após aprovar, solicitarei as próximas fases.
```

---

### TAREFA 2 - Criação e Gerenciamento de Bolões

**Objetivo**: Implementar sistema completo de gerenciamento de bolões com Clean Architecture.

#### 📝 Prompt Inicial

```
Estrutura de Specs:
@/docs/spec.md   - Guidelines para desenvolvimento com IA
@/docs/spec.md   - Especificação técnica completa
@/docs/api.md    - Documentação da API REST

Implemente a tarefa 2. **Criação e Gerenciamento de Bolões** da Phase 0: Pre-Workshop Setup seguindo TODAS as specs acima.
Integre o backend e o frontend, ajuste os dados das páginas @/docs/prototipo/home.png e @/apps/web/src/pages/PoolPage.vue com os do banco de dados.

Considere que os dados exibidos na tela devem ser de um usuário teste, já que a implementação de cadastro de usuário não foi implementado.

Siga as especificações 100%, não se desvie do escopo da tarefa
Execute testes para validação.
Após aprovar, solicitarei as próximas fases.
```

---

### TAREFA 3 - Realização de Palpites

**Objetivo**: Implementar sistema completo de palpites com validação de deadline e associação a bolões.

#### 📝 Prompt Inicial

```
Estrutura de Specs:
@/docs/spec.md   - Guidelines para desenvolvimento com IA
@/docs/spec.md   - Especificação técnica completa
@/docs/api.md    - Documentação da API REST

Implemente a tarefa 3. **Realização de Palpites** da Phase 0: Pre-Workshop Setup seguindo TODAS as specs acima.
Integre o backend e o frontend, ajuste os dados da página @/apps/web/src/pages/PickPage.vue com os do banco de dados.

Considere que os dados exibidos na tela devem ser de um usuário teste, já que a implementação de cadastro de usuário não foi implementado.

Siga as especificações 100%, não se desvie do escopo da tarefa
Execute testes para validação.
Após aprovar, solicitarei as próximas fases.
Atualize o @/README.md com as novas implementações
Atualize a doc @/docs/validation/PHASE-0-IMPLEMENTATION.md com os detalhes da implementação
```

---

## Fase 1: Core Features (Durante Workshop)

### TAREFA 4 - Cálculo Automático de Pontuação

**Objetivo**: Implementar sistema completo de cálculo automático de pontuação com regras configuráveis por bolão.

#### 📝 Prompt Inicial

```
Estrutura de Specs:
@/docs/spec.md   - Guidelines para desenvolvimento com IA
@/docs/spec.md   - Especificação técnica completa
@/docs/api.md    - Documentação da API REST

Implemente a tarefa 4. Cálculo Automático de Pontuação da Phase 1: Core Features seguindo TODAS as specs acima.

Considere que os dados exibidos na tela devem ser de um usuário teste, já que a implementação de cadastro de usuário não foi implementado.

Siga as especificações 100%, não se desvie do escopo da tarefa
Execute testes para validação.
Execute a aplicação para validar erros.
Atualize o @/README.md com as novas implementações.
Crie a doc @/docs/validation/PHASE-1-CORE_FEATURES.md com os detalhes da implementação.
Após aprovar, solicitarei as próximas fases.
```

---

### TAREFA 5 - Ranking do Bolão em Tempo Real

**Objetivo**: Implementar sistema completo de ranking em tempo real com estatísticas detalhadas e navegação integrada.

#### 📝 Prompt Inicial

```
Estrutura de Specs:
@/docs/spec.md   - Guidelines para desenvolvimento com IA
@/docs/spec.md   - Especificação técnica completa
@/docs/api.md    - Documentação da API REST

Implemente a tarefa 5. Ranking do Bolão em Tempo Real da Phase 1: Core Features seguindo TODAS as specs acima.

Integre o backend e o frontend, implemente a rota para a RankingPage com o id de um dos bolões, ajuste os dados da página @/apps/web/src/pages/RankingPage.vue e ajuste os dados do card "Posição Média" com a média de pontos do usuário nos bolões que participa e cada botão da seção "Meus Bolões" com a rota do bolão correspondente @/apps/web/src/pages/HomePage.vue com os do banco de dados.

Considere que os dados exibidos na tela devem ser de um usuário teste, já que a implementação de cadastro de usuário não foi implementado.

Siga as especificações 100%, não se desvie do escopo da tarefa
Execute testes para validação.
Execute a aplicação para validar erros.
Atualize o @/README.md com as novas implementações.
Atualize a doc @/docs/validation/PHASE-1-CORE_FEATURES.md com os detalhes da implementação.
Após aprovar, solicitarei as próximas fases.
```

---
