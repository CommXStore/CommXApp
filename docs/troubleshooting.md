# Troubleshooting

## 401 Unauthorized nas rotas de API

- Verifique se ha uma organizacao ativa no Clerk.
- Confirme as chaves `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` e `CLERK_SECRET_KEY`.
- Para chamadas externas, use `Authorization: Bearer org_api_key_...`.

## Slug ou key duplicado

- Slugs e keys precisam ser unicos por organizacao.
- Ajuste o slug ou a key antes de salvar novamente.

## Campo nao vinculado ao tipo

- O campo precisa estar vinculado ao tipo de conteudo antes de ser usado em entradas.
- Verifique em `/custom-fields` se o campo esta associado ao tipo correto.

## 429 Too many requests

- As rotas de mutacao possuem rate limit simples por org e IP.
- Aguarde alguns segundos e tente novamente.

## Erros ao gerar tipos

- `npm run generate:types` usa `tsx` e pode falhar em ambientes restritos.
- Execute localmente ou rode via Node em um ambiente com permissao de IPC.
