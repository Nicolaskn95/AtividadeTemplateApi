import { Router, Request, Response } from 'express';
import { dbService, hashPassword, verifyPassword } from './db.ts';
import { createToken, requireAuth, optionalAuth, AuthenticatedRequest } from './auth.ts';

export const apiRouter = Router();

// ==========================================
// 1. AUTENTICAÇÃO E USUÁRIOS
// ==========================================

// POST /api/auth/register - Cadastro de Usuário
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, telefone, cpf, avatar } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: 'Nome, e-mail e senha são obrigatórios.',
        fields: ['nome', 'email', 'senha'],
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        error: 'A senha deve conter no mínimo 6 caracteres.',
      });
    }

    // Check if email already registered
    const existing = await dbService.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        error: 'Este e-mail já está cadastrado no sistema.',
        code: 'EMAIL_ALREADY_EXISTS',
      });
    }

    const newUser = await dbService.createUser({
      nome: String(nome).trim(),
      email: String(email).trim().toLowerCase(),
      senhaHash: hashPassword(String(senha)),
      telefone: telefone ? String(telefone).trim() : '',
      cpf: cpf ? String(cpf).trim() : '',
      avatar: avatar ? String(avatar).trim() : '',
      role: 'admin', // In this application, registered users have access to admin panel
    });

    const token = createToken(newUser._id);

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      token,
      user: {
        _id: newUser._id,
        nome: newUser.nome,
        email: newUser.email,
        telefone: newUser.telefone,
        cpf: newUser.cpf,
        avatar: newUser.avatar,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/auth/register:', err);
    return res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' });
  }
});

// POST /api/auth/login - Autenticação
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: 'E-mail e senha são obrigatórios para efetuar login.',
      });
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas. Verifique seu e-mail e senha.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const isValid = verifyPassword(String(senha), user.senhaHash);
    if (!isValid) {
      return res.status(401).json({
        error: 'Credenciais inválidas. Verifique seu e-mail e senha.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const token = createToken(user._id);

    return res.json({
      message: 'Login efetuado com sucesso!',
      token,
      user: {
        _id: user._id,
        nome: user.nome,
        email: user.email,
        telefone: user.telefone,
        cpf: user.cpf,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/auth/login:', err);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
});

// GET /api/auth/me - Dados do Usuário Logado
apiRouter.get('/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  return res.json({
    _id: user._id,
    nome: user.nome,
    email: user.email,
    telefone: user.telefone,
    cpf: user.cpf,
    avatar: user.avatar,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

// PUT /api/auth/profile - Atualização de Perfil (como em Perfil.js)
apiRouter.put('/auth/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { nome, email, telefone, cpf, senha, avatar } = req.body;

    const updates: any = {};
    if (nome) updates.nome = String(nome).trim();
    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (normalizedEmail !== user.email) {
        const inUse = await dbService.findUserByEmail(normalizedEmail);
        if (inUse && inUse._id !== user._id) {
          return res.status(409).json({ error: 'Este e-mail já está em uso por outro usuário.' });
        }
        updates.email = normalizedEmail;
      }
    }
    if (telefone !== undefined) updates.telefone = String(telefone).trim();
    if (cpf !== undefined) updates.cpf = String(cpf).trim();
    if (avatar !== undefined) updates.avatar = String(avatar).trim();
    if (senha && String(senha).trim().length >= 6) {
      updates.senhaHash = hashPassword(String(senha));
    }

    const updated = await dbService.updateUser(user._id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json({
      message: 'Perfil atualizado com sucesso!',
      user: {
        _id: updated._id,
        nome: updated.nome,
        email: updated.email,
        telefone: updated.telefone,
        cpf: updated.cpf,
        avatar: updated.avatar,
        role: updated.role,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err: any) {
    console.error('Error in /api/auth/profile:', err);
    return res.status(500).json({ error: 'Erro ao atualizar dados do perfil.' });
  }
});

// ==========================================
// 2. CONTEÚDOS / SÉRIES (CRUD DINÂMICO)
// ==========================================

// GET /api/contents - Listar conteúdos (filtro por categoria e busca opcional)
apiRouter.get('/contents', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { categoria, q } = req.query;
    const contents = await dbService.findContents({
      categoria: categoria ? String(categoria) : undefined,
      query: q ? String(q) : undefined,
    });

    return res.json({
      total: contents.length,
      isAuthenticated: Boolean(req.user),
      data: contents,
    });
  } catch (err: any) {
    console.error('Error in GET /api/contents:', err);
    return res.status(500).json({ error: 'Erro ao consultar conteúdos no banco de dados.' });
  }
});

// GET /api/contents/:id - Consultar conteúdo por ID
apiRouter.get('/contents/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const item = await dbService.findContentById(id);
    if (!item) {
      return res.status(404).json({ error: 'Registro não encontrado.' });
    }
    return res.json({
      isAuthenticated: Boolean(req.user),
      data: item,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao obter registro.' });
  }
});

// POST /api/contents - Cadastrar novo conteúdo (Apenas autenticados)
apiRouter.post('/contents', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { titulo, subtitulo, descricao, categoria, imagem, ano, temporada, episodio, duracao, classificacao } = req.body;

    if (!titulo || !subtitulo) {
      return res.status(400).json({
        error: 'Título e subtítulo (ex: 1x01 - Pilot) são obrigatórios.',
      });
    }

    const created = await dbService.createContent({
      titulo: String(titulo).trim(),
      subtitulo: String(subtitulo).trim(),
      descricao: descricao ? String(descricao).trim() : 'Sem descrição disponível.',
      categoria: categoria ? String(categoria).trim() : 'TELA 01',
      imagem: imagem ? String(imagem).trim() : '',
      ano: ano ? Number(ano) : new Date().getFullYear(),
      temporada: temporada ? Number(temporada) : 1,
      episodio: episodio ? Number(episodio) : 1,
      duracao: duracao ? String(duracao).trim() : '45 min',
      classificacao: classificacao ? String(classificacao).trim() : '14+',
      criadoPor: req.user!.nome,
    });

    return res.status(201).json({
      message: 'Conteúdo cadastrado com sucesso no MongoDB!',
      data: created,
    });
  } catch (err: any) {
    console.error('Error in POST /api/contents:', err);
    return res.status(500).json({ error: 'Erro ao cadastrar novo conteúdo.' });
  }
});

// PUT /api/contents/:id - Alterar conteúdo (Apenas autenticados)
apiRouter.put('/contents/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await dbService.findContentById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Conteúdo não encontrado para alteração.' });
    }

    const { titulo, subtitulo, descricao, categoria, imagem, ano, temporada, episodio, duracao, classificacao } = req.body;
    const updates: any = {};
    if (titulo !== undefined) updates.titulo = String(titulo).trim();
    if (subtitulo !== undefined) updates.subtitulo = String(subtitulo).trim();
    if (descricao !== undefined) updates.descricao = String(descricao).trim();
    if (categoria !== undefined) updates.categoria = String(categoria).trim();
    if (imagem !== undefined) updates.imagem = String(imagem).trim();
    if (ano !== undefined) updates.ano = Number(ano);
    if (temporada !== undefined) updates.temporada = Number(temporada);
    if (episodio !== undefined) updates.episodio = Number(episodio);
    if (duracao !== undefined) updates.duracao = String(duracao).trim();
    if (classificacao !== undefined) updates.classificacao = String(classificacao).trim();

    const updated = await dbService.updateContent(id, updates);
    return res.json({
      message: 'Conteúdo atualizado com sucesso!',
      data: updated,
    });
  } catch (err: any) {
    console.error('Error in PUT /api/contents/:id:', err);
    return res.status(500).json({ error: 'Erro ao atualizar conteúdo.' });
  }
});

// DELETE /api/contents/:id - Excluir conteúdo (Apenas autenticados)
apiRouter.delete('/contents/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await dbService.deleteContent(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Registro não encontrado para exclusão.' });
    }
    return res.json({
      message: 'Conteúdo excluído com sucesso do banco de dados.',
      deletedId: id,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao excluir conteúdo.' });
  }
});

// ==========================================
// 3. GERENCIAMENTO DE IMAGENS
// ==========================================

// PUT /api/contents/:id/image - Editar imagem (Apenas autenticados)
apiRouter.put('/contents/:id/image', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { imagem } = req.body;

    if (!imagem) {
      return res.status(400).json({ error: 'URL ou payload da imagem é obrigatório.' });
    }

    const existing = await dbService.findContentById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Conteúdo não encontrado.' });
    }

    const updated = await dbService.updateContentImage(id, String(imagem).trim());
    return res.json({
      message: 'Imagem atualizada com sucesso!',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao atualizar imagem do conteúdo.' });
  }
});

// DELETE /api/contents/:id/image - Excluir imagem (Apenas autenticados)
apiRouter.delete('/contents/:id/image', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await dbService.findContentById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Conteúdo não encontrado.' });
    }

    const updated = await dbService.deleteContentImage(id);
    return res.json({
      message: 'Imagem removida com sucesso!',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao excluir imagem.' });
  }
});

// ==========================================
// 4. PESQUISA
// ==========================================

// GET /api/search?q=termo - Pesquisa dinâmica
apiRouter.get('/search', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q, categoria } = req.query;
    const termo = q ? String(q).trim() : '';

    const results = await dbService.findContents({
      categoria: categoria ? String(categoria) : undefined,
      query: termo,
    });

    return res.json({
      termo,
      total: results.length,
      data: results,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao processar pesquisa.' });
  }
});

// ==========================================
// 5. BANCO DE DADOS & STATUS
// ==========================================

// GET /api/db/status - Status da conexão MongoDB
apiRouter.get('/db/status', async (_req: Request, res: Response) => {
  return res.json(dbService.getStatus());
});

// POST /api/db/seed - Restaurar dados padrão de exemplo
apiRouter.post('/db/seed', async (_req: Request, res: Response) => {
  try {
    await dbService.resetSeed();
    return res.json({ message: 'Dados de exemplo restaurados com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao resetar dados.' });
  }
});
