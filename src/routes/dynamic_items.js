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
    const { items } = request.body;
    const savedItems = await DynamicItems.getAll();

    for (const savedItem of savedItems) {
        const itemData = items.find(item => item.name === savedItem.item_steam_name);

        await DynamicItems.update({ id: savedItem.id }, {
            my_auto_price: itemData ? itemData.price : null,
        });
    }

    response.sendStatus(200);
});

router.delete('/', async (request, response) => {
    const { id } = request.query;
    await DynamicItems.delete({ id });

    response.sendStatus(200);
});

module.exports = router;