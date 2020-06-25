const express = require('express');
const itemsRouter = require('./items');
const settingsRouter = require('./settings');
const casesRouter = require('./cases');
const homeRouter = require('./home');

const router = express.Router();

router.use('/', homeRouter);
router.use('/items', itemsRouter);
router.use('/settings', settingsRouter);
router.use('/cases', casesRouter);

module.exports = router;
