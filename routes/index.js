var express = require('express');
var router = express.Router();
var path = require('path');

const Item = require('../models/Item');

router.get('/', async (req, res, next) => {
  const items = await Item.find({});
  res.json(items);
});

router.get('/save', async (req, res, next) => {
  await new Item({ id: Math.floor(Math.random() * 2000) }).save();
  res.redirect('/')
});

router.get('/test', async (req, res, next) => {
  res.sendFile(path.join(__dirname, '../public/test.html'));
});


module.exports = router;
