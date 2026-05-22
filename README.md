# 🌳 Myggdrasil

> Um museu de decisões pessoais — registre as escolhas importantes da sua vida e acompanhe como uma decisão levou à outra, que levou à outra.

## O que é?

Myggdrasil é uma aplicação fullstack onde o usuário registra decisões importantes da sua vida — mudar de cidade, trocar de emprego, terminar um relacionamento — e ao longo do tempo vai anotando os desdobramentos. Cada decisão pode se conectar a outras, formando um grafo pessoal de causa e efeito.

O nome vem da mitologia nórdica: a árvore que conecta todos os mundos.

## Stack

**Backend**
- Node.js + NestJS
- TypeScript
- TypeORM
- MySQL

**Frontend** _(em desenvolvimento)_
- React
- TypeScript

## Arquitetura do banco de dados

```
users           — dados do usuário
events          — decisões/eventos registrados
event_types     — categorias (profissional, relacionamentos, pessoal, qualidade de vida)
event_relations — relações pai-filho entre eventos (grafo N:N)
```

A tabela `event_relations` resolve o problema de múltiplos ancestrais — uma decisão pode ter vários pais e vários filhos. A prevenção de ciclos temporais (A causou B, B causou A) é tratada no backend antes de qualquer inserção.

## Estrutura do projeto

```
src/
  users/
    dto/
      create-user.dto.ts
    entities/
      user.entity.ts
    users.controller.ts
    users.service.ts
    users.module.ts
  app.module.ts
  main.ts
  data-source.ts
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
MYSQLHOST=host1
MYSQLPORT=portdaora
MYSQLUSER=seu_user
MYSQLPASSWORD=sua_senha
BDNAME=myggdrasil
PORT=1111
```

## Como rodar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run start:dev

# Build
npm run build
```

## Roadmap

- [x] Modelagem do banco de dados
- [x] Setup NestJS + TypeORM
- [x] Conexão com MySQL local
- [x] Entity e DTO de usuário
- [ ] Autenticação JWT
- [ ] Módulo de eventos
- [ ] Grafo de decisões
- [ ] Frontend React
- [ ] Deploy na nuvem