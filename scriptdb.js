const DATABASE_URL = process.env.DATABASE_URL;

async function executarQueryNeon(querySQL, parametros = []) {
    if (!DATABASE_URL) {
        console.error('DATABASE_URL não encontrada nas variáveis de ambiente.');
        return null;
    }

    let neonHttpEndpoint;
    try {
        const host = new URL(DATABASE_URL).host;
        neonHttpEndpoint = `https://${host}/sql`;
    } catch (error) {
        console.error('DATABASE_URL inválida:', error);
        return null;
    }

    try {
        const resposta = await fetch(neonHttpEndpoint, {
            method: 'POST',
            headers: {
                'Neon-Connection-String': DATABASE_URL,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: querySQL,
                params: parametros
            })
        });

        if (!resposta.ok) {
            const erroTexto = await resposta.text();
            throw new Error(`Erro HTTP ${resposta.status}: ${erroTexto}`);
        }

        const dados = await resposta.json();
        return dados.rows ?? [];
    } catch (error) {
        console.error('Falha ao comunicar com o banco de dados:', error);
        return null;
    }
}

async function atualizarCategoria(id, descricao) {
    return executarQueryNeon(
        'UPDATE categoria SET descricao = $1 WHERE id_categoria = $2 RETURNING *',
        [descricao, id]
    );
}

async function excluirCategoriaBanco(id) {
    const relacionados = await executarQueryNeon(
        'SELECT 1 FROM produto WHERE id_categoria = $1 LIMIT 1',
        [id]
    );

    if (relacionados === null) {
        return { erro: 'Falha ao consultar os produtos relacionados' };
    }

    if (relacionados.length) {
        return {
            erro: 'Esta categoria possui produtos vinculados. Exclua os produtos primeiro.'
        };
    }

    const linhas = await executarQueryNeon(
        'DELETE FROM categoria WHERE id_categoria = $1 RETURNING id_categoria',
        [id]
    );

    if (linhas === null) {
        return { erro: 'Falha ao acessar o banco de dados' };
    }

    return { excluido: linhas.length > 0 };
}

module.exports = {
    executarQueryNeon,
    atualizarCategoria,
    excluirCategoriaBanco
};
