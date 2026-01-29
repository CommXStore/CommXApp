# Migracao de Storage

O armazenamento atual usa `publicMetadata` no Clerk. Para migracao futura para um banco, siga esta estrategia:

## Fases sugeridas

1) **Abstracao de repositorio**
   - Use `content-repository` como ponto unico de acesso a dados.

2) **Mirror de escrita**
   - Enviar gravacoes para `publicMetadata` e para o banco (dual write) durante a fase de transicao.

3) **Leitura gradual**
   - Habilitar leitura do banco por feature flag por organizacao.

4) **Backfill**
   - Importar dados do `publicMetadata` para o banco via script.

5) **Desativar metadata**
   - Remover dual write e manter apenas banco.

## Boas praticas

- Manter schemas e validacoes em Zod.
- Executar backups antes de migracoes.
- Validar integridade dos dados (slugs, keys, campos orfaos).
