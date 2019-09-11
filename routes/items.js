var express = require('express');
var router = express.Router();

const Item = require('../models/Item');


console.log('Git hooks test3');


router.get('/', async (req, res) => {
    try {
        const items = await Item.find({});
        res.json(items);
    } catch (error) {
        res.sendStatus(500);
    }
});

router.get('/clear', async (req, res) => {
    await Item.remove({});
    res.sendStatus(200);
});

router.get('/check', async (req, res) => {
    const { itemId } = req.body;

    try {
        const item = await Item.find({ steamId: itemId });
        res.status(200).json({ isBookmarked: !!item });
    } catch (error) {
        res.sendStatus(500);
    }
});

router.post('/', async (req, res) => {
    const { itemId: steamId, itemName } = req.body;

    console.log(steamId, itemName);

    try {
        const item = new Item({ steamId, itemName });
        await item.save();

        res.status(200).json({ isBookmarked: true });
    } catch (error) {
        console.log(error);

        res.sendStatus(500);
    }
});

router.delete('/', async (req, res) => {
    const { itemId } = req.body;

    console.log(itemId)

    try {
        const item = await Item.findOneAndDelete({ steamId: itemId });

        // if (item) {
            // await item.remove();
            res.status(200).json({ isBookmarked: false });
        // } else {
        //     res.status(404).json({ error: 'No item' });
        // }
    } catch (error) {
        console.log(error);

        res.sendStatus(500);
    }
});


module.exports = router;
