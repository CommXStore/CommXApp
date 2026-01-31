# Rotas de API

As rotas aceitam session token (cookies) e organization API key (Bearer token). A maioria e escopada pela organizacao ativa.

## Agents

- `GET /api/agents` lista
- `POST /api/agents` cria
- `DELETE /api/agents` remove

## Organizacoes

- `POST /api/organizations/memberships` cria usuario e adiciona como member. Quando `joinAsCurrentUser=true`, adiciona o usuario atual; nesse caso pode receber `organizationId` se nao houver organizacao ativa.

## Tipos de conteudo

- `GET /api/content-types` lista
- `POST /api/content-types` cria
- `PATCH /api/content-types/[id]` atualiza
- `DELETE /api/content-types/[id]` remove

## Campos personalizados

- `GET /api/custom-fields` lista
- `POST /api/custom-fields` cria
- `PATCH /api/custom-fields/[id]` atualiza
- `DELETE /api/custom-fields/[id]` remove

## Entradas (conteudos)

- `GET /api/content/[contentTypeSlug]` lista entradas do tipo
- `POST /api/content/[contentTypeSlug]` cria entrada
- `PATCH /api/content/[contentTypeSlug]/[entryId]` atualiza entrada
- `DELETE /api/content/[contentTypeSlug]/[entryId]` remove entrada

## Observacoes

- Rotas de mutacao possuem rate limit simples por org + IP.
- Respostas de erro retornam `{ error: string }` com status adequado.
