const knexInstance = require('../knexInstance');

const TABLE_NAME = 'cases';

module.exports = {
    async getAll() {
        return knexInstance(TABLE_NAME).select();
    },

    async create(caseName) {
        await knexInstance(TABLE_NAME).insert({
            case_name: caseName,
            stat_data: [],
        });
    }
}