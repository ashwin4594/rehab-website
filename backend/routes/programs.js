const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/programsController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', ctrl.getAll);
router.get('/:slug', ctrl.getBySlug);

// protected: admin or manager can create/update/delete
router.post('/', auth, authorize('admin','manager'), ctrl.create);
router.put('/:id', auth, authorize('admin','manager'), ctrl.update);
router.delete('/:id', auth, authorize('admin','manager'), ctrl.delete);

module.exports = router;
