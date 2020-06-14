const express = require('express');
const itemsRouter = require('./items');
const settingsRouter = require('./settings');

const router = express.Router();

router.use('/items', itemsRouter);
router.use('/settings', settingsRouter);

module.exports = router;
