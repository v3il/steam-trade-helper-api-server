const express = require('express');
const itemsRouter = require('./items');
const settingsRouter = require('./settings');
const casesRouter = require('./dynamic_items');
const homeRouter = require('./home');

const router = express.Router();

router.use('/', homeRouter);
router.use('/items', itemsRouter);
router.use('/settings', settingsRouter);
router.use('/dynamic_items', casesRouter);

module.exports = router;
