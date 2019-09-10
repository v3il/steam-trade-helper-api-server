const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    steamId: {
        type: Number,
        required: true,
        index: true,
    },

    itemName: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('ItemSchema', ItemSchema);