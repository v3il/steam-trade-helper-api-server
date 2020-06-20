const express = require('express');
const knexInstance = require('../knexInstance');

const TABLE_NAME = 'cases';

const router = express.Router();

router.get('/', async (request, response) => {


    response.json({});
});

router.post('/', async (request, response) => {


    response.json({ isBookmarked: true });
});

module.exports = router;