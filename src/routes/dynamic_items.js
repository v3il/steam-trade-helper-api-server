const express = require('express');
const DynamicItems = require('../services/DynamicItems');

const { prepareItemData } = require('../util');

const router = express.Router();

router.get('/', async (request, response) => {
    const dynamicItems = await DynamicItems.getAll();
    const parsedCasesData = dynamicItems.map(prepareItemData);

    response.json({
        cases: parsedCasesData,
    });
});

router.post('/', async (request, response) => {
    const { steamName, steamId, steamNameEn } = request.body;
    await DynamicItems.create(steamId, steamName, steamNameEn);

    response.sendStatus(200);
});

router.post('/pin', async (request, response) => {
    const { id } = request.body;

    if (!id) {
        return response.sendStatus(400);
    }

    await DynamicItems.update({ id }, {
        pinned: 1,
    });

    response.sendStatus(200);
});

router.post('/unpin', async (request, response) => {
    const { id } = request.body;

    if (!id) {
        return response.sendStatus(400);
    }

    await DynamicItems.update({ id }, {
        pinned: 0,
    });

    response.sendStatus(200);
});

router.post('/update_price', async (request, response) => {
    const { price, name } = request.body;

    const selectedItems = await DynamicItems.get({ item_steam_name: name });

    if (!selectedItems.length) {
        return response.sendStatus(404);
    }

    await DynamicItems.update({ item_steam_name: name }, {
        my_auto_price: price || null,
    });

    response.sendStatus(200);
});

router.delete('/', async (request, response) => {
    const { id } = request.query;
    await DynamicItems.delete({ id });

    response.sendStatus(200);
});

module.exports = router;