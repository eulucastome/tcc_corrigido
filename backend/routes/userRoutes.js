// Rotas de usuário: CRUD para usuários e perfil.
const { Router } = require('express');
const UserController = require('../controllers/UserController');
const { authenticate } = require('../middlewares/authMiddleware');
const { adminOnly, ownerOrAdmin } = require('../middlewares/authorizationMiddleware');
const { updateUser } = require('../middlewares/validators');

const router = Router();

router.use(authenticate);

// ── Admin: lista todos usuários ──────────────────────────────
router.get('/',       adminOnly,                       UserController.index);

// ── Dono ou Admin: visualiza perfil ──────────────────────────
router.get('/:id',    ownerOrAdmin('id'),              UserController.show);

// ── Dono ou Admin: atualiza perfil ──────────────────────────
router.patch('/:id',  ownerOrAdmin('id'), updateUser,  UserController.update);

// ── Admin: deleta usuário ───────────────────────────────────
router.delete('/:id', adminOnly,                       UserController.destroy);

module.exports = router;