const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', async (request, response) => {
    response.sendFile(path.join(__dirname, '../public/cases_page.html'));
});

module.exports = router;