# ProjectScene Web

Frontend base em Vue 3 + Vite para trabalhar junto com o backend `projectscene-api`.

Estrutura atual baseada em flat structure para projetos pequenos, com `views`, `components`,
`composables`, `services`, `types` e `router` organizados diretamente dentro de `src/`.

## Stack inicial

- Vue 3
- Vite
- TypeScript
- Vue Router
- Pinia
- ESLint + Prettier

## Ambiente local

O projeto usa `VITE_API_BASE_URL` para apontar para a API.

Valor padrao configurado para desenvolvimento:

```sh
http://localhost:5046
```

Se precisar mudar, edite o arquivo `.env.development`.

## Comandos

```sh
npm install
npm run dev
```

Para build de producao:

```sh
npm run build
```

Para lint:

```sh
npm run lint
```

## Relacao com o backend

- backend: `../projectscene-api`
- frontend: `../projectscene-web`
- API local padrao do backend ASP.NET Core: `http://localhost:5046`

Suba o backend antes de integrar telas que consumam dados reais.
