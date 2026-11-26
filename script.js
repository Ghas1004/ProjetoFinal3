const lista = document.getElementById('lista-categorias')
const formulario = document.getElementById('form-categoria')
const campoDescricao = document.getElementById('descricao')
const mensagem = document.getElementById('mensagem')
const categoriaId = document.getElementById('categoria-id')
const tituloCategoria = document.getElementById('titulo-categoria')
const btnCategoria = document.getElementById('btn-categoria')
const btnCancelarCategoria = document.getElementById('btn-cancelar-categoria')

function mostrarMensagem(elemento, texto, erro = false) {
    elemento.textContent = texto
    elemento.classList.toggle('erro', erro)
}

function itemVazio(texto) {
    const item = document.createElement('li')
    item.className = 'vazio'
    item.textContent = texto
    return item
}

async function carregarCategorias() {
    lista.replaceChildren(itemVazio('Carregando...'))
    try {
        const resposta = await fetch('/api/categorias')
        const categorias = await resposta.json()
        if (!resposta.ok) throw new Error(categorias.erro)

        lista.replaceChildren()
        for (const categoria of categorias) {
            const item = document.createElement('li')
            item.textContent = `#${categoria.id_categoria} - ${categoria.descricao}`
            const botaoEditarCategoria = document.createElement('button')
            botaoEditarCategoria.type = 'button'
            botaoEditarCategoria.className = 'secundario pequeno'
            botaoEditarCategoria.textContent = 'Editar'
            botaoEditarCategoria.addEventListener('click', () => entrarModoEdicaoCategoria(categoria))
            // Botão adicional de exclusão da categoria.
            const botaoExcluirCategoria = document.createElement('button')
            botaoExcluirCategoria.type = 'button'
            botaoExcluirCategoria.className = 'perigo pequeno'
            botaoExcluirCategoria.textContent = 'Excluir'
            botaoExcluirCategoria.addEventListener('click', () => excluirCategoria(categoria))
            const acoesCategoria = document.createElement('div')
            acoesCategoria.className = 'acoes-registro'
            acoesCategoria.append(botaoEditarCategoria, botaoExcluirCategoria)
            item.appendChild(acoesCategoria)
            lista.appendChild(item)
        }
        if (categorias.length === 0) lista.replaceChildren(itemVazio('Nenhuma categoria cadastrada.'))
    } catch (erro) {
        lista.replaceChildren(itemVazio(`Erro: ${erro.message}`))
    }
}

function entrarModoEdicaoCategoria(categoria) {
    categoriaId.value = categoria.id_categoria
    campoDescricao.value = categoria.descricao
    tituloCategoria.textContent = `Editar categoria #${categoria.id_categoria}`
    btnCategoria.textContent = 'Salvar'
    btnCancelarCategoria.hidden = false
    mostrarMensagem(mensagem, '')
    formulario.scrollIntoView({ behavior: 'smooth', block: 'center' })
    campoDescricao.focus()
}

function sairModoEdicaoCategoria() {
    formulario.reset()
    categoriaId.value = ''
    tituloCategoria.textContent = 'Nova categoria'
    btnCategoria.textContent = 'Cadastrar'
    btnCancelarCategoria.hidden = true
}

btnCancelarCategoria.addEventListener('click', sairModoEdicaoCategoria)

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault()
    const id = categoriaId.value
    const url = id ? `/api/categorias/${encodeURIComponent(id)}` : '/api/categorias'
    try {
        const resposta = await fetch(url, {
            method: id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao: campoDescricao.value.trim() })
        })
        const dados = await resposta.json()
        if (!resposta.ok) throw new Error(dados.erro || 'Falha ao salvar categoria')
        sairModoEdicaoCategoria()
        mostrarMensagem(mensagem, id ? `Categoria "${dados.descricao}" atualizada!` : `Categoria "${dados.descricao}" cadastrada!`)
        await carregarCategorias()
    } catch (erro) {
        mostrarMensagem(mensagem, `Erro: ${erro.message}`, true)
    }
})

// Exclusão de categorias com confirmação.
async function excluirCategoria(categoria) {
    if (!confirm(`Deseja realmente excluir a categoria "${categoria.descricao}"?`)) return
    try {
        const resposta = await fetch(`/api/categorias/${encodeURIComponent(categoria.id_categoria)}`, { method: 'DELETE' })
        const dados = await resposta.json()
        if (!resposta.ok) throw new Error(dados.erro || 'Falha ao excluir categoria')
        if (categoriaId.value === String(categoria.id_categoria)) sairModoEdicaoCategoria()
        mostrarMensagem(mensagem, `Categoria "${categoria.descricao}" excluída!`)
        await carregarCategorias()
    } catch (erro) {
        mostrarMensagem(mensagem, `Erro: ${erro.message}`, true)
    }
}

carregarCategorias()
