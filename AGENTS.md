# Regras obrigatorias

Este arquivo define como o Codex deve atuar neste repositorio.

## Fluxo de trabalho

* Faca um commit ao concluir cada tarefa solicitada.
* Mantenha o escopo do commit pequeno e alinhado ao pedido do usuario.
* Nao altere arquivos fora do escopo sem confirmar.

## Qualidade e consistencia

* Preserve o padrao existente (Next.js App Router, Clerk, Tailwind, Radix).
* Mantenha boas praticas de codigo, modularidade e type-check sempre passando.
* Respeite padroes de componentes e rotas em `src/app` e `src/components`.
* Evite logica duplicada; prefira utilitarios em `src/lib` quando fizer sentido.

## Strings e traducao

* Utilize apenas strings traduziveis via nosso sistema de traducao.
* Se precisar criar novas chaves de traducao e nao souber onde ficam, pergunte antes.
* Estrutura: `languages/<locale>/common.json` para textos compartilhados e `languages/<locale>/routes/<rota>.json` para textos por rota.
* Mantenha as mesmas chaves entre idiomas.

## Testes e checagens

* Rode os testes relevantes quando alterar comportamento (Vitest/Playwright).
* Garanta que `npm run lint` e `npm run format` continuem passando.
* Se nao puder rodar testes, informe claramente o que ficou pendente.

## Documentacao

* Atualize `docs/` quando alterar regras de negocio ou fluxos.
