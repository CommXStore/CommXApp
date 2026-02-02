# Plano de Melhoria - CommX

## Status
- Concluido em 29 de janeiro de 2026.

## Fase 0 — Fundamentos (curto prazo)
- **Documentar decisões**: criar ADR inicial explicando uso de `publicMetadata` como storage e limitações atuais.
- **Husky/lefthook**: configurar pre-commit com `npm test` (modo rápido) + lint.
- **Limites de validação**: adicionar limites de tamanho em labels/help/options e profundidade de `fields` nas rotas.

## Fase 1 — Qualidade e Testes
- **E2E crítico (Playwright)**: fluxo login → criar tipo → criar campo → criar entrada → editar/deletar; rodar em CI.
- **Casos de erro nos handlers**: testes cobrindo auth falha, slug/key duplicados, campo não vinculado, payload inválido.
- **Acessibilidade**: incluir `@axe-core/playwright` para validar páginas principais e revisar mensagens/foco.

## Fase 2 — Resiliência de Dados
- **Snapshots antes de mutações**: salvar cópia de `publicMetadata` antes de writes e restaurar se falhar.
- **Limpeza de órfãos**: ao deletar tipo/campo, remover refs em `attachedTo`/`fields` e entradas relacionadas.
- **Script de export/import**: CLI simples para backup/restore por organização.

## Fase 3 — Observabilidade e Segurança
- **Logger estruturado**: pino no server com correlation id por request; níveis para validação vs erro inesperado.
- **Rate limiting**: limiter simples por org + IP nas rotas de mutação.
- **Erros amigáveis**: página/handler global de erro com mensagem user-friendly e log detalhado server-only.

## Fase 4 — Performance e UX
- **Caching leve**: cache de listas (content types, custom fields, entries) com revalidate tags em mutações.
- **Carregamento de fontes**: adiar fonts com `prefers-reduced-data` e manter woff2.
- **Form focus & empty states**: foco pós-submit/navegação, estados de loading/empty/skeleton nas tabelas.

## Fase 5 — UI e DX
- **Kit de formulário unificado**: componentes Text/Number/Select/Switch mapeados por `customField.type`.
- **Status UI consistente**: ícones/cores padronizadas para `draft/published` em tipos e entradas.
- **Tipos gerados**: gerar types a partir dos schemas Zod para evitar drift (zod-to-ts ou equivalente).

## Fase 6 — Migração futura
- **Abstração de storage**: interface de repo isolando `publicMetadata`; mock inicial para facilitar migração para DB.
- **Roadmap de DB**: esboçar passos de migração (schema, sync script, feature flag) mantendo API estável.

## Entregáveis de documentação
- Atualizar README com exemplos de requisição/resposta e troubleshooting (auth, slug duplicado, campos órfãos).
- Criar `docs/troubleshooting.md` com erros comuns e correções.
- Adicionar seção de testes no README com comandos e requisitos de Playwright.
