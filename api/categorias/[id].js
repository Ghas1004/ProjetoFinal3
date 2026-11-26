const {
    atualizarCategoria,
    excluirCategoriaBanco
} = require('../../scriptdb');

module.exports = async function handler(req, res) {
    try {
        const id = Number(req.query.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ erro: 'ID inválido' });
        }

        if (req.method === 'PUT') {
            const descricao = String(req.body?.descricao ?? '').trim();

            if (!descricao) {
                return res.status(400).json({ erro: 'Informe o nome da categoria' });
            }

            const linhas = await atualizarCategoria(id, descricao);

            if (linhas === null) {
                return res.status(500).json({ erro: 'Falha ao atualizar categoria' });
            }

            if (!linhas.length) {
                return res.status(404).json({ erro: 'Categoria não encontrada' });
            }

            return res.status(200).json(linhas[0]);
        }

        if (req.method === 'DELETE') {
            const resultado = await excluirCategoriaBanco(id);

            if (resultado.erro) {
                return res.status(409).json({ erro: resultado.erro });
            }

            if (!resultado.excluido) {
                return res.status(404).json({ erro: 'Categoria não encontrada' });
            }

            return res.status(200).json({
                mensagem: 'Categoria excluída com sucesso'
            });
        }

        res.setHeader('Allow', 'PUT, DELETE');
        return res.status(405).json({ erro: 'Método não permitido' });
    } catch (error) {
        console.error('Erro na API /api/categorias/[id]:', error);
        return res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};
