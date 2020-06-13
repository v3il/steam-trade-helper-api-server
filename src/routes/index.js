const express = require('express');
const itemsRouter = require('./items');

const router = express.Router();

router.use('/items', itemsRouter);

module.exports = router;
