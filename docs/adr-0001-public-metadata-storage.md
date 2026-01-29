# ADR-0001: Armazenamento em publicMetadata (Clerk)

## Contexto
O CommX App armazena tipos de conteudo, campos personalizados e entradas por organizacao. A necessidade inicial e ter persistencia simples, multi-tenant e com baixo overhead operacional.

## Decisao
Usar o `publicMetadata` da organizacao no Clerk como storage atual.

## Consequencias
- **Pro**: simplicidade e baixo custo operacional; dados ja escopados por organizacao.
- **Pro**: integracao direta com o modelo de autenticacao existente.
- **Contra**: limites de tamanho e performance para colecoes grandes.
- **Contra**: concorrencia e controle transacional limitados.
- **Contra**: consultas sao apenas in-memory (sem filtros complexos).

## Mitigacoes
- Validacoes de tamanho e profundidade para evitar payloads excessivos.
- Limpeza de referencias orfas nas rotas de delete.
- Planejamento de abstracao de storage para migracao futura.

## Status
Aceita.
