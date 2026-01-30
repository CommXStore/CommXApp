# Plano de Correções Arquiteturais (SaaS - Commx App)

## Objetivo
Endereçar riscos críticos de multi-tenant, RLS, autorização, billing, observabilidade e robustez de dados para escalar com segurança.

## Prioridades (ordem de execução)
1. **Dados + RLS**
2. **Autorização (RBAC)**
3. **Arquitetura modular do domínio**
4. **Observabilidade**
5. **Planos/Entitlements (Billing)**
6. **Operações seguras / Transações**
7. **Higienização de scripts SQL**

---

## 1) Dados + RLS
- **Problema**: RLS depende de claims (`org_id` / `o.id`); faltam transações e há deletes globais por organização.
- **Ações**:
  - Exigir `org_id` no token; falhar cedo se ausente (em `getSupabaseServerClient` ou camada de auth).
  - `organization-store`: substituir deletes+inserts por `upsert` por registro em transação. Evitar apagar a org inteira.
  - Adicionar coluna `version`/`updated_at` e checar “lost update”.
  - Revisar policies para `auth.jwt()->>'org_id'` com fallback a `o.id`, mas negar se ambos faltarem.
  - Separar `reset.sql` (dev) do `schema.sql` (prod).

## 2) Autorização (RBAC)
- **Problema**: Apenas admin vs não-admin; rotas de conteúdo usam `checkAuth` simples.
- **Ações**:
  - Aplicar `checkAdmin` ou permissões por operação em: `src/app/api/content/**`, `src/app/api/content-types/**`, `src/app/api/custom-fields/**`.
  - Usar `orgPermissions` ou mapear roles adicionais (ex.: editor, viewer).
  - No frontend, esconder/ desabilitar ações que requerem permissões.

## 3) Arquitetura modular do domínio
- **Problema**: Store monolítico (agents, content types, fields, entries, snapshots) e actions únicas.
- **Ações**:
  - Criar repositórios separados: `agents-repo`, `content-types-repo`, `custom-fields-repo`, `entries-repo`.
  - Mover snapshots para tabela/histórico opcional; remover dependência de store global.
  - Dividir `src/lib/clerk/actions.ts` por feature (agents, content types, entries, custom fields).

## 4) Observabilidade
- **Problema**: Logs sem contexto de tenant/user; sem tracing/metrics.
- **Ações**:
  - Middleware (Next) para `requestId`, `orgId`, `userId` e injeção no `logger`.
  - Adicionar tracing (OTel) básico nas rotas API e server actions; métricas por org (contagem de writes, erros RLS).
  - Padronizar logs de erros do Supabase com contexto (org, tabela, operação).

## 5) Planos/Entitlements (Billing)
- **Problema**: Só UI do `<PricingTable />`; nenhum enforcement.
- **Ações**:
  - Tabelas: `plans`, `subscriptions` (por `organization_id`), `entitlements`.
  - Webhook do Clerk Billing para sync de plano/status -> grava em `subscriptions`.
  - Middleware/guard de entitlements antes de: criar content type, custom field, agent, entry count, etc.
  - Expor limites no frontend e bloquear graceful (ex.: toast + disable CTA).

## 6) Operações seguras / Transações
- **Problema**: Múltiplos `delete/insert` sem transação; risco de race.
- **Ações**:
  - Usar `rpc` ou `supabase.from(...).upsert` dentro de transação (Postgres function) para updates de store.
  - Idempotência: chave natural (`id`, `organization_id`) + `ON CONFLICT`.
  - Remover `deleteByOrg` em writes regulares; usar somente em reset administrativo.

## 7) Scripts SQL
- **Problema**: `schema.sql` tinha truncate/drop; risco em prod.
- **Ações**:
  - Manter `supabase-schema.sql` apenas com DDL + RLS.
  - `supabase-reset.sql` só em dev; documentar o uso.
  - Adicionar índices: `(organization_id, slug)` em `content_types`, `(organization_id, content_type_id, slug)` em `content_entries`.

---

## Impacto de não corrigir
- Perda ou exposição de dados por falhas em RLS/claims e deletes globais.
- Usuários sem permissão alterando conteúdo crítico.
- Falta de observabilidade impede RCA em produção multi-tenant.
- Billing ineficaz: features liberadas sem limite → custo/abuso.
- Race conditions em escala horizontal causam inconsistência e suporte caro.

---

## Referências de código
- Auth/RBAC: `src/lib/clerk/check-auth.ts`, `src/lib/clerk/require-org-admin.ts`
- Store Supabase: `src/lib/supabase/organization-store.ts`, `src/lib/clerk/content-store.ts`
- Ações domínio: `src/lib/clerk/actions.ts` e utils em `src/lib/clerk/*-utils.ts`
- Billing UI: `src/app/billing/upgrade/pricing-table.tsx`
- SQL: `docs/supabase-schema.sql`, `docs/supabase-reset.sql`
