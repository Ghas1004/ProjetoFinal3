# Projeto corrigido para Vercel

## O que foi alterado
- Adicionadas funções serverless em `api/categorias.js` e `api/categorias/[id].js`.
- Mantido o `servidor-local.js` para execução local.
- Mantidas as operações existentes de listar, cadastrar, editar e excluir categorias.
- O arquivo `.env` real não está incluído no ZIP por segurança.

## Configuração na Vercel
1. Importe/atualize este projeto pelo GitHub.
2. Em **Settings > Environment Variables**, crie `DATABASE_URL` com a string de conexão do Neon.
3. Selecione Production (e Preview, se desejar).
4. Faça um novo deploy.

Depois, teste:
`https://SEU-DOMINIO.vercel.app/api/categorias`

A resposta esperada é um JSON com as categorias.

## Execução local
1. Copie `.env.example` para `.env`.
2. Coloque sua conexão Neon em `DATABASE_URL`.
3. Execute `npm install` e `npm start`.
4. Acesse `http://localhost:3001`.

**Segurança:** a conexão do banco que estava no arquivo `.env` enviado não foi copiada para o ZIP. Como ela foi compartilhada, troque a senha/credencial no Neon e use a nova string na Vercel e no `.env` local.
