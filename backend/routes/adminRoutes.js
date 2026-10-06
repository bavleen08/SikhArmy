const express = require('express');
const { getAdminStats } = require('../controller/adminController');
const { protect, admin } = require('../middleware/userMiddleware');

const router = express.Router();

router.get('/', protect, admin, getAdminStats);

module.exports = router;