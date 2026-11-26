const http = require('http')
const fs = require('fs')
const path = require('path')

// Carregar .env antes de importar scriptdb.js.
require('dotenv').config({ path: path.join(__dirname, '.env') })
const {
    executarQueryNeon, atualizarCategoria, excluirCategoriaBanco
} = require('./scriptdb')

const PORTA = process.env.PORT || 3001
const arquivos = {
    '/': { arquivo: 'index.html', tipo: 'text/html; charset=utf-8' },
    '/index.html': { arquivo: 'index.html', tipo: 'text/html; charset=utf-8' },
    '/app.js': { arquivo: 'app.js', tipo: 'text/javascript; charset=utf-8' },
    '/style.css': { arquivo: 'style.css', tipo: 'text/css; charset=utf-8' }
}

function responderJSON(res, status, dados) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(dados))
}

async function lerCorpo(req) {
    let dados = ''
    for await (const parte of req) {
        dados += parte
        if (dados.length > 1_000_000) {
            const erro = new Error('Corpo da requisição muito grande')
            erro.status = 413
            throw erro
        }
    }
    try { return JSON.parse(dados || '{}') }
    catch {
        const erro = new Error('JSON inválido')
        erro.status = 400
        throw erro
    }
}

const servidor = http.createServer(async (req, res) => {
    const url = req.url.split('?')[0]
    try {
        const rotaCategoria = /^\/api\/categorias\/(\d+)$/.exec(url)

        if (rotaCategoria && req.method === 'DELETE') {
            const resultado = await excluirCategoriaBanco(Number(rotaCategoria[1]))
            if (resultado.erro) return responderJSON(res, 409, { erro: resultado.erro })
            if (!resultado.excluido) return responderJSON(res, 404, { erro: 'Categoria não encontrada' })
            return responderJSON(res, 200, { mensagem: 'Categoria excluída com sucesso' })
        }
        if (rotaCategoria && req.method === 'PUT') {
            const corpo = await lerCorpo(req)
            const descricao = String(corpo.descricao ?? '').trim()
            if (!descricao) return responderJSON(res, 400, { erro: 'Informe o nome da categoria' })
            const linhas = await atualizarCategoria(Number(rotaCategoria[1]), descricao)
            if (linhas === null) return responderJSON(res, 500, { erro: 'Falha ao atualizar categoria' })
            if (!linhas.length) return responderJSON(res, 404, { erro: 'Categoria não encontrada' })
            return responderJSON(res, 200, linhas[0])
        }
        if (url === '/api/categorias' && req.method === 'GET') {
            const linhas = await executarQueryNeon('SELECT * FROM categoria ORDER BY id_categoria')
            return linhas === null ? responderJSON(res, 500, { erro: 'Falha ao consultar o banco' }) : responderJSON(res, 200, linhas)
        }
        if (url === '/api/categorias' && req.method === 'POST') {
            const corpo = await lerCorpo(req)
            const descricao = String(corpo.descricao ?? '').trim()
            if (!descricao) return responderJSON(res, 400, { erro: 'Informe o nome da categoria' })
            const linhas = await executarQueryNeon('INSERT INTO categoria (descricao) VALUES ($1) RETURNING *', [descricao])
            if (linhas === null) return responderJSON(res, 500, { erro: 'Falha ao cadastrar categoria' })
            return responderJSON(res, 201, linhas[0])
        }
        if (req.method === 'GET' && Object.hasOwn(arquivos, url)) {
            const recurso = arquivos[url]
            const conteudo = await fs.promises.readFile(path.join(__dirname, recurso.arquivo))
            res.writeHead(200, { 'Content-Type': recurso.tipo })
            return res.end(conteudo)
        }
        return responderJSON(res, 404, { erro: 'Rota não encontrada' })
    } catch (erro) {
        console.error(erro)
        if (!res.headersSent) responderJSON(res, erro.status || 500, { erro: erro.status ? erro.message : 'Erro interno no servidor' })
    }
})
servidor.listen(PORTA, () => console.log(`Loja do Zé rodando em http://localhost:${PORTA}`))
