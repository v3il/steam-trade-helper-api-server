var express = require('express');
var router = express.Router();

const Item = require('../models/Item');

router.get('/', async (req, res) => {
    try {
        const items = await Item.find({});
        res.json(items);
    } catch (error) {
        res.send(500);
    }
});

router.get('/check', async (req, res) => {
    const { itemId } = req.body;

    try {
        const item = await Item.find({ steamId: itemId });
        res.send(200).json({ isBookmarked: !!item });
    } catch (error) {
        res.send(500);
    }
});

router.post('/', async (req, res) => {
    const { itemId: steamId, itemName } = req.body;

    try {
        const item = new Item({ steamId, itemName });
        await item.save();

        res.send(200).json({ isBookmarked: true });
    } catch (error) {
        res.send(500);
    }
});

router.delete('/', async (req, res) => {
    const { itemId } = req.body;

    try {
        const item = await Item.find({ steamId: itemId });

        if (item) {
            await item.delete();
            res.send(200).json({ isBookmarked: false });
        } else {
            res.send(404).json({ error: 'No item' });
        }
    } catch (error) {
        res.send(500);
    }
});


module.exports = router;
