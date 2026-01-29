# CommX App - Visao Geral

O CommX App e uma aplicacao multi-tenant voltada para criacao de estruturas de conteudo dinamicas, inspiradas em Custom Post Types do WordPress. Cada organizacao pode definir seus tipos de conteudo, cadastrar campos personalizados e gerar entradas (conteudos) a partir dessas definicoes.

## Componentes principais

- Tipos de conteudo: definem estrutura, slug e status.
- Campos personalizados: definem labels, tipos e validacoes.
- Entradas: conteudos dinamicos gerados pelos campos do tipo.

## Como o dado e armazenado

- Os dados sao persistidos no `publicMetadata` da organizacao (Clerk).
- O escopo e sempre por organizacao ativa.

## Fluxos principais

1. Criar um campo personalizado e associar a um ou mais tipos.
2. Criar um tipo de conteudo e selecionar campos.
3. Criar entradas do tipo de conteudo, com formulario dinamico.
4. Editar e manter entradas com validacao server e client.

## Autenticacao

- A app exige autenticacao.
- As rotas de API aceitam session token e organization API keys.
