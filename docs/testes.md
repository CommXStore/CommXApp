# Testes

## Ferramentas

- Vitest para unit e component tests
- Testing Library para UI
- Playwright para smoke/e2e

## Como rodar

```bash
npm test
```

```bash
npm run test:watch
```

```bash
npm run test:e2e
```

Observacao: para Playwright, instale os browsers caso necessario:

```bash
npx playwright install
```

## O que cobrimos

- Utils de content types, custom fields e entries
- Handlers de API (routes)
- Formularios e tabelas principais
- Fluxo basico de criacao por UI
