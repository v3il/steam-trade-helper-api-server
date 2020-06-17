const express = require('express');
const knexInstance = require('../knexInstance');

const TABLE_NAME = 'steam_items';

const router = express.Router();

const mapItem = (item) => ({
    steamId: item.steam_id,
    itemName: item.item_name,
    watch: item.watch === 1,
});

router.get('/', async (request, response) => {
    const items = await knexInstance(TABLE_NAME).select();
    const itemsMap = items.map(mapItem);

    console.log(items);

    response.json(itemsMap);
});

router.get('/find', async (request, response) => {
    const { itemName } = request.query;

    const items = await knexInstance(TABLE_NAME).where({ item_name: itemName }).select();

    if (!items.length) {
        throw new Error('Item not found');
    }

    response.json(mapItem(items[0]));
});

router.get('/check', async (request, response) => {
    const { itemId } = request.query;

    const items = await knexInstance(TABLE_NAME).where({ steam_id: itemId }).select();
    response.json({ isBookmarked: items.length > 0 });
});

router.post('/', async (request, response) => {
    const { itemId, itemName } = request.body;

    await knexInstance(TABLE_NAME).insert({
        steam_id: itemId,
        item_name: itemName,
    });

    response.json({ isBookmarked: true });
});

router.delete('/', async (request, response) => {
    const { itemId } = request.body;

    await knexInstance(TABLE_NAME).where({ steam_id: itemId }).del();

    response.json({ isBookmarked: false });
});

module.exports = router;