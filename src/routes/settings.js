const express = require('express');

const router = express.Router();

router.get('/', async (request, response) => {
    response.json({});
});

router.post('/', async (request, response) => {
    response.json({ isBookmarked: true });
});

module.exports = router;