const express = require('express');
const { getMetrics } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect, requireRole('Admin'));

// GET /api/admin/metrics
router.get('/metrics', getMetrics);

module.exports = router;
