const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/appointmentsController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', ctrl.create);
router.get('/', auth, authorize('admin','manager','doctor','therapist'), ctrl.getAll);

module.exports = router;
