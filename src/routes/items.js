const express = require('express');
const knexInstance = require('../knexInstance');

const TABLE_NAME = 'steam_items';

const router = express.Router();

router.get('/', async (request, response) => {
    const items = await knexInstance(TABLE_NAME).select();
    const itemsMap = items.map((item) => ({
        steamId: item.steam_id,
        itemName: item.item_name,
        watch: item.watch === 1,
    }));

    response.json(itemsMap);
});

router.get('/check', async (request, response) => {
    const { itemId } = request.query;

    const items = await knexInstance(TABLE_NAME).where({ steam_id: itemId }).select();
    response.json({ isBookmarked: items.length > 0 });
});

router.post('/set_watch_status', async (request, response) => {
    const { itemId, watchStatus } = request.body;

    await knexInstance(TABLE_NAME).where({ steam_id: itemId }).update({
        watch: watchStatus ? 1 : 0,
    });

    response.json({ updated: true });
});

router.post('/', async (request, response) => {
    const { itemId, itemName } = request.body;

    await knexInstance(TABLE_NAME).insert({
        steam_id: itemId,
        item_name: itemName,
        watch: true,
    });

    response.json({ isBookmarked: true });
});

router.delete('/', async (request, response) => {
    const { itemId } = request.body;

    await knexInstance(TABLE_NAME).where({ steam_id: itemId }).del();

    response.json({ isBookmarked: false });
});

module.exports = router;