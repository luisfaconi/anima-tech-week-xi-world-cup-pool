# 🎯 Workshop: Spec Driven Development - Roteiro para Apresentação

## 📋 Checklist Pré-Workshop

- [ ] Verificar se Docker está instalado e funcionando
- [ ] Verificar se Node.js 18+ está instalado
- [ ] Verificar se pnpm está instalado (`npm install -g pnpm`)
- [ ] Testar `pnpm setup` funciona sem erros
- [ ] Abrir projeto no VS Code
- [ ] Preparar IA (Claude, ChatGPT, etc.)

## 🎪 Roteiro da Apresentação (45min)

### 1. Introdução (5min)
**"O que é Spec Driven Development?"**
- Especificação primeiro, código depois
- IA como parceira de desenvolvimento
- Importância da documentação estruturada

**Mostrar estrutura:**
```bash
tree -I node_modules -L 3
```

### 2. Configuração ao Vivo (10min)
**"Setup em 30 segundos"**
```bash
# Demonstrar o poder do pnpm setup
pnpm setup

# Mostrar que tudo funciona
pnpm dev
```

**Explicar arquivos chave:**
- `AGENTS.md` - Instruções para IA
- `docs/spec.md` - Especificação técnica
- `docs/api.md` - Contratos de API

### 3. Desenvolvimento com IA (25min)

#### Round 1: Implementar CreateUser no Backend (8min)
**Prompt para IA:**
```
Leia o arquivo AGENTS.md e implemente o caso de uso CreateUser completo:
1. Repository implementation (Prisma)
2. Controller HTTP
3. Routes registration
4. Error handling middleware

Siga exatamente os padrões da Clean Architecture definidos.
```

**Mostrar:**
- IA lendo AGENTS.md
- Implementação seguindo padrões
- Testes passando
- API funcionando

#### Round 2: Frontend - Tela de Cadastro (8min)
**Prompt para IA:**
```
Implemente a página de registro de usuário no frontend Vue 3:
1. Componente UserForm
2. Página de registro
3. Integração com API via httpClient
4. Store Pinia para gerenciar estado

Use os padrões definidos em AGENTS.md.
```

#### Round 3: Feature Completa - Picks (9min)
**Prompt para IA:**
```
Implemente o sistema completo de palpites (picks):
1. Backend: use cases, repository, controllers
2. Frontend: componentes, páginas, store
3. Incluir testes unitários
4. Seguir todos os padrões arquiteturais
```

### 4. Demonstração Final (5min)
**"Aplicação Funcionando"**
- Criar usuário
- Fazer palpite
- Ver ranking
- Mostrar testes passando

## 🎭 Pontos-Chave para Enfatizar

### 🎯 Vantagens do Spec Driven Development
- **Clareza**: IA entende exatamente o que fazer
- **Consistência**: Padrões são mantidos automaticamente
- **Qualidade**: Testes e validações são incluídos
- **Velocidade**: Menos iterações e correções
- **Documentação**: Sempre atualizada e útil

### 🚀 Diferencial da Abordagem
1. **Documentação como Código**: AGENTS.md é executable documentation
2. **Arquitetura Enforced**: IA não pode quebrar padrões
3. **Testing First**: Testes são parte da especificação
4. **Onboarding Automático**: Novos devs (humanos ou IA) se adaptam rapidamente

### 💡 Tips para Desenvolvedores
- Investir tempo na especificação economiza horas de desenvolvimento
- AGENTS.md é seu melhor amigo para onboarding
- Clean Architecture facilita manutenção e testes
- IA funciona melhor com instruções claras e específicas

## 🔥 Comandos de Demonstração

### Setup Rápido
```bash
pnpm setup     # Tudo em um comando
pnpm dev       # Subir aplicação completa
pnpm test      # Validar qualidade
```

### Desenvolvimento
```bash
# Ver estrutura
tree -I node_modules

# Logs do banco
docker compose logs -f db

# Testes em watch mode
pnpm --filter api test:watch

# Build production
pnpm --filter web build
```

### Debug
```bash
# Status do banco
docker compose ps

# Restart banco
pnpm db:down && pnpm db:up

# Reset completo
pnpm clean && pnpm setup
```

## 🎨 Slides Sugeridos

1. **Problema**: Código inconsistente, IA perdida, retrabalho
2. **Solução**: Spec Driven Development
3. **Demo**: Implementação ao vivo em 20 minutos
4. **Resultados**: Aplicação completa, testada, documentada
5. **Takeaways**: Como aplicar na sua empresa/projeto

## 📚 Recursos para Distribuir

- Link do repositório GitHub
- AGENTS.md template
- Clean Architecture cheat sheet
- Lista de prompts úteis para IA

---

**Lembre-se:** O objetivo é mostrar como a especificação correta permite desenvolvimento rápido, consistente e de qualidade com IA. O código é consequência, a especificação é o que importa! 🚀