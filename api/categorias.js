const { executarQueryNeon } = require('../scriptdb');

module.exports = async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            const linhas = await executarQueryNeon(
                'SELECT * FROM categoria ORDER BY id_categoria'
            );

            if (linhas === null) {
                return res.status(500).json({ erro: 'Falha ao consultar o banco' });
            }

            return res.status(200).json(linhas);
        }

        if (req.method === 'POST') {
            const descricao = String(req.body?.descricao ?? '').trim();

            if (!descricao) {
                return res.status(400).json({ erro: 'Informe o nome da categoria' });
            }

            const linhas = await executarQueryNeon(
                'INSERT INTO categoria (descricao) VALUES ($1) RETURNING *',
                [descricao]
            );

            if (linhas === null) {
                return res.status(500).json({ erro: 'Falha ao cadastrar categoria' });
            }

            return res.status(201).json(linhas[0]);
        }

        res.setHeader('Allow', 'GET, POST');
        return res.status(405).json({ erro: 'Método não permitido' });
    } catch (error) {
        console.error('Erro na API /api/categorias:', error);
        return res.status(500).json({ erro: 'Erro interno no servidor' });
    }
};
