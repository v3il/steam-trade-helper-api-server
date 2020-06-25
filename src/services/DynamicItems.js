const knexInstance = require('../knexInstance');

const TABLE_NAME = 'dynamic_items';

module.exports = {
    async getAll() {
        return knexInstance(TABLE_NAME).select();
    },

    async create(caseSteamId, caseSteamName, caseSteamNameEn) {
        await knexInstance(TABLE_NAME).insert({
            item_steam_id: caseSteamId,
            item_steam_name: caseSteamName,
            item_steam_name_en: caseSteamNameEn,
            stat_data: JSON.stringify([]),
        });
    },

    async update(where, updatedData) {
        await knexInstance(TABLE_NAME).where(where).update(updatedData);
    }
}