# Project Scene Web

Frontend em Vue 3 + Vite para a tela de autenticacao do projeto Project Scene.

## Stack

- Vue 3
- Vite
- TypeScript
- Vue Router
- Bootstrap 5
- ESLint
- Prettier

## Estrutura

O projeto esta organizado em camadas simples dentro de `src/`:

- `features/`: fluxos por dominio, como autenticacao e cadastro
- `components/`: componentes visuais reutilizaveis
- `views/`: composicao das telas ligadas ao roteamento
- `app/`: shell raiz da aplicacao
- `lib/`: infraestrutura compartilhada, como cliente HTTP
- `router/`: rotas e guards
- `assets/`: estilos globais

## Ambiente local

Crie seu arquivo de ambiente com base em `.env.example`.

Variavel usada no frontend:

```sh
VITE_API_BASE_URL=http://localhost:5046
```

## Comandos

Instalacao:

```sh
npm install
```

Desenvolvimento:

```sh
npm run dev
```

Build de producao:

```sh
npm run build
```

Lint:

```sh
npm run lint
```

Formatacao:

```sh
npm run format
```

## Integracao com backend

O frontend ja esta integrado com a API via `VITE_API_BASE_URL`.

Pontos principais:

- autenticacao centralizada em `src/features/auth/`
- cliente HTTP compartilhado em `src/lib/api/client.ts`
- refresh token transportado por cookie HttpOnly
