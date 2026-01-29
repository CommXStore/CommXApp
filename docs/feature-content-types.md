# Plano: Tipos de Conteúdo e Campos Personalizados

## Objetivo
Disponibilizar uma funcionalidade de Tipos de Conteúdo (similar a Custom Post Types do WordPress) permitindo criar, listar, editar e remover tipos de conteúdo em rotas próprias, além de gerenciar Campos Personalizados vinculados a cada tipo. A criação/edição deve ocorrer em página dedicada (não modal), e o tipo deve exibir os campos personalizados associados.

## Escopo
- Criar novos endpoints e páginas para Tipos de Conteúdo e Campos Personalizados.
- Listagem em tabela, criação e edição com formulários completos.
- Integração com Clerk (org-scoped) usando o mesmo modelo de autenticação existente.
- Persistência em `publicMetadata` da organização, análoga ao módulo de agentes.
- **Novo**: criar o ciclo completo de Entradas (conteúdos) para cada Tipo de Conteúdo: rotas API, UI de listagem e páginas de criação/edição específicas por tipo.

## Fora de escopo (por agora)
- Versionamento de campos ou histórico de alterações.
- Validação avançada por regex ou máscaras por campo.
- Paginação server-side (manter client-side como agents).

## Modelagem de dados (publicMetadata)
- `contentTypes: Array<ContentType>`
  - `id: string` (ex: `ct_{nanoid}`)
  - `name: string`
  - `slug: string` (único por org, kebab-case)
  - `description?: string`
  - `status: 'draft' | 'published'`
  - `icon?: string` (opcional para UI)
  - `fields: string[]` (lista de `customField.id` associados)
  - `createdAt: string` ISO
  - `updatedAt: string` ISO
- `customFields: Array<CustomField>`
  - `id: string` (ex: `cf_{nanoid}`)
  - `label: string`
  - `key: string` (slug/identifier usado para storage)
  - `type: 'text' | 'number' | 'boolean' | 'date' | 'select'`
  - `options?: string[]` (apenas para `select`)
  - `required: boolean`
  - `helpText?: string`
  - `attachedTo: string | null` (`contentType.id` ou null para não associado)
  - `createdAt: string`
  - `updatedAt: string`
- `contentEntries: Record<ContentType['id'], Array<ContentEntry>>`
  - `id: string` (ex: `ce_{nanoid}`)
  - `contentTypeId: string`
  - `slug: string` (único dentro do tipo)
  - `status: 'draft' | 'published'`
  - `fields: Record<CustomField['key'], unknown>` (valores conforme tipo)
  - `createdAt: string`
  - `updatedAt: string`

## API/Server
- Reaproveitar `checkAuth` para aceitar `api_key` e `session_token`.
- Novas rotas (Next Route Handlers):
  - `GET /api/content-types` → lista por `orgId`.
  - `POST /api/content-types` → cria novo tipo.
  - `PATCH /api/content-types/[id]` → atualiza.
  - `DELETE /api/content-types/[id]` → remove (e limpa refs em `customFields.attachedTo`).
  - `GET /api/custom-fields` → lista por `orgId`.
  - `POST /api/custom-fields` → cria campo e associa (opcional) a um tipo.
  - `PATCH /api/custom-fields/[id]` → atualiza e pode reatribuir a outro tipo.
  - `DELETE /api/custom-fields/[id]` → remove campo e retira id de `contentTypes.fields`.
- **Entradas**:
  - `GET /api/content/[contentTypeSlug]` → lista entradas do tipo.
  - `POST /api/content/[contentTypeSlug]` → cria entrada (valida campos).
  - `PATCH /api/content/[contentTypeSlug]/[entryId]` → atualiza.
  - `DELETE /api/content/[contentTypeSlug]/[entryId]` → remove.
  - Validação: slug único por tipo; validar campos contra `customFields` vinculados; coerção por tipo; required.
- Schemas com Zod; validar unicidade de `slug` e `key` por organização.
- Utilitários em `src/lib/clerk/metadata-utils.ts` semelhantes aos de agentes, separados por domínio (`content-types-utils.ts`, `custom-fields-utils.ts`).

## Páginas e Fluxos (App Router)
- `GET /content-types` → tabela (tanstack table) semelhante a `/agents`, com ações de editar/ deletar.
- `GET /content-types/new` → formulário de criação.
- `GET /content-types/[id]/edit` → formulário de edição (preload dados).
- Formulário inclui seção “Campos personalizados” com multi-select dos `customFields` já criados e botão para abrir rota de criação de campo (navega, não modal).
- `GET /custom-fields` → tabela + botão “Adicionar campo”.
- `GET /custom-fields/new` e `/custom-fields/[id]/edit` → formulário com campos: label, key, type, required, helpText, options (se `select`), select de tipo de conteúdo para vincular.
- Navegação: adicionar itens ao sidebar existente para “Tipos de Conteúdo” e “Campos Personalizados”.
- **Entradas**:
  - `GET /content/[contentTypeSlug]` → tabela de entradas daquele tipo (usa schema dinâmico para colunas básicas: slug, status, updatedAt, + “Campos” mostra contagem/preview).
  - `GET /content/[contentTypeSlug]/new` → formulário gerado dinamicamente a partir dos `customFields` do tipo.
  - `GET /content/[contentTypeSlug]/[entryId]/edit` → formulário com valores existentes.
  - Navegação: ao visualizar um tipo, botão “Ver entradas” abre `/content/<slug>`.

## UX/Comportamento
- Criação de tipo de conteúdo em página dedicada (não popup). Após salvar, redirecionar para `/content-types` com toast de sucesso.
- Ao editar tipo, a lista de campos personalizados mostra vinculados e permite adicionar/remover via multi-select (sem inline create; criação leva a rota de campos).
- Ao excluir tipo, perguntar confirmação; também remover referência em `customFields.attachedTo` e em qualquer `fields` de outros tipos (consistência).
- Ao excluir campo, remover o id de `contentTypes.fields`.
- Usar feedback de loading e toasts como no fluxo de agentes.
- Entradas: formulário dinâmico respeita tipo de campo (text/number/boolean/date/select), required, options; validação no client e server; slug opcional auto-gerado do título se existir campo `title`/`name`.

## Componentes Reutilizáveis
- Aproveitar `DataTable` para listas (content types e custom fields).
- Criar um form component base usando Radix + UI kit existente para campos comuns; reutilizar para create/edit.
- Helpers para date formatting, slugify e key normalization.
- Builder de formulário dinâmico para entradas (mapeia `customField.type` → componente UI).
- Hook utilitário para carregar schema + opções (content type + campos) e montar colunas básicas na tabela.

## Validação e Regras
- `slug` e `key` devem ser kebab-case; bloquear duplicados (case-insensitive).
- `options` obrigatórias se `type === 'select'`.
- `fields` só aceita ids válidos.
- Manter timestamps `createdAt`/`updatedAt`.
- Entradas: campos required; tipos coerentes; slug único por tipo; impedir uso de campos não vinculados.

## Segurança e Permissões
- Mesmo modelo dos agentes: autenticação obrigatória e `orgId` requerido.
- Operações são sempre escopadas à organização ativa; nenhuma leitura cruzada.

## Testes
- Unit: schemas Zod, utils de merge/removal de refs.
- API: happy path + duplicidade de slug/key + remoção cascata.
- E2E/light manual: criar campo, criar tipo vinculando campo, editar tipo trocando campos, excluir campo e verificar remoção em tipo, excluir tipo e checar limpeza.
- Entradas: criar entrada com todos os tipos de campo, validar required, editar, deletar, colisão de slug, tentativa de usar campo não vinculado.

## Entregáveis
- Novos handlers em `/api/content-types/*` e `/api/custom-fields/*`.
- Utils de metadata por domínio.
- Páginas (App Router) descritas acima e navegação no sidebar.
- Componentes de formulário + integração com toasts/loading.
- Documentação curta em README ou `/docs` descrevendo uso e payloads.
