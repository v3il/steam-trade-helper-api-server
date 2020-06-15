const fsp = require('fs').promises;
const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', async (request, response) => {
    const settings = require('../settings.json');
    response.json(settings);
});

router.post('/', async (request, response) => {
    const settings = require('../settings.json');
    const newSettings = request.body;
    const updatedSettings = { ...settings, ...newSettings };

    await fsp.writeFile(path.join(__dirname, '../settings.json'), JSON.stringify(updatedSettings));

    response.json({ updated: true });
});

module.exports = router;