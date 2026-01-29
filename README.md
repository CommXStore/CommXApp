# CommX App

Aplicacao web multi-tenant para criacao de tipos de conteudo, campos personalizados e entradas (conteudos), com autenticacao por organizacao via Clerk.

## O que o app entrega

- Tipos de conteudo com rotas proprias de criacao e edicao
- Campos personalizados com associacao a varios tipos de conteudo
- Entradas (conteudos) dinamicas geradas a partir dos campos do tipo
- Tabelas e formularios dedicados (sem modal) para os fluxos principais
- Autenticacao por organizacao e escopo de dados por org
- API com suporte a session token e organization API key

## Stack

- Next.js (App Router)
- React 19
- Clerk (orgs, sessao e API keys)
- Tailwind CSS + Radix UI
- Zod para validacao
- Vitest + Testing Library + Playwright

## Estrutura rapida

- `src/app` rotas e paginas (UI e API)
- `src/components` tabelas e formularios
- `src/lib/clerk` utils de metadata e schemas
- `docs` documentacao funcional e tecnica

## Rotas principais (UI)

- `/agents`
- `/content-types`
- `/content-types/new`
- `/content-types/[id]/edit`
- `/custom-fields`
- `/custom-fields/new`
- `/custom-fields/[id]/edit`
- `/content/[contentTypeSlug]`
- `/content/[contentTypeSlug]/new`
- `/content/[contentTypeSlug]/[entryId]/edit`

## Rotas principais (API)

- `GET/POST /api/agents`
- `GET/POST /api/content-types`
- `PATCH/DELETE /api/content-types/[id]`
- `GET/POST /api/custom-fields`
- `PATCH/DELETE /api/custom-fields/[id]`
- `GET/POST /api/content/[contentTypeSlug]`
- `PATCH/DELETE /api/content/[contentTypeSlug]/[entryId]`

## Autenticacao

As rotas de API aceitam dois modos:

- Session token (cookies, para usuarios logados)
- Organization API key (Bearer token)

Exemplo:

```bash
curl -X GET http://localhost:3000/api/content-types \
  -H "Authorization: Bearer org_api_key_..."
```

## Configuracao local

1) Instale dependencias

```bash
npm install
```

2) Configure o ambiente

Crie `.env.local` a partir de `.env.example` e preencha:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/dashboard"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/dashboard"
```

3) Rode o app

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Scripts

- `npm run dev` inicia o servidor
- `npm run build` build de producao
- `npm run start` roda a build
- `npm run lint` verifica o codigo (usa ultracite)
- `npm run format` formata o codigo (usa ultracite)
- `npm test` roda unit e component tests
- `npm run test:watch` roda testes em modo watch
- `npm run test:e2e` roda Playwright
- `npm run generate:types` gera tipos a partir dos schemas Zod

## Backup e restore de metadata

```bash
node scripts/export-content-metadata.mjs <orgId> ./backup.json
node scripts/import-content-metadata.mjs <orgId> ./backup.json
```

## Troubleshooting

Consulte `docs/troubleshooting.md` para erros comuns (auth, slug duplicado, campos orfaos).

## Documentacao

- `docs/feature-content-types.md` plano e regras dos tipos de conteudo
- `docs/visao-geral.md` resumo funcional
- `docs/rotas-api.md` referencias de API
- `docs/testes.md` estrategia e execucao de testes
- `docs/migracao-storage.md` notas sobre migracao futura de storage
- `docs/troubleshooting.md` problemas comuns e resolucoes

## Observacoes

- Os dados ficam armazenados em `publicMetadata` da organizacao (Clerk).
- Campos personalizados podem ser ligados a varios tipos de conteudo.
- A criacao/edicao de tipos e entradas ocorre em paginas dedicadas.
