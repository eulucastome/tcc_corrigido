const { validationResult } = require('express-validator');
const UserModel = require('../models/UserModel');

// Controlador de usuários: operações CRUD e listagem.
const UserController = {
  // Função que lista todos os usuários (admin somente).
  async index(req, res, next) {
    try {
      const users = await UserModel.findAll();
      return res.json({ users });
    } catch (err) { next(err); }
  },

  // Função que mostra os dados de um usuário específico.
  async show(req, res, next) {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
      return res.json({ user });
    } catch (err) { next(err); }
  },

  // Função que atualiza um usuário, com controle de acesso.
  async update(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

      if (req.user.role !== 'admin' && req.user.id !== req.params.id)
        return res.status(403).json({ message: 'Acesso negado.' });

      const user = await UserModel.update(req.params.id, req.body);
      if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });
      return res.json({ user });
    } catch (err) { next(err); }
  },

  // Função que exclui um usuário do sistema.
  async destroy(req, res, next) {
    try {
      await UserModel.delete(req.params.id);
      return res.status(204).send();
    } catch (err) { next(err); }
  },
};

module.exports = UserController;