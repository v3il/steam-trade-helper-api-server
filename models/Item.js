const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        index: true,
    },
});

module.exports = mongoose.model('ItemSchema', ItemSchema);