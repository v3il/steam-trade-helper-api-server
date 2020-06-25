const knexInstance = require('../knexInstance');

const TABLE_NAME = 'cases';

module.exports = {
    async getAll() {
        return knexInstance(TABLE_NAME).select();
    },

    async create(caseSteamId, caseSteamName, caseSteamNameEn) {
        await knexInstance(TABLE_NAME).insert({
            case_steam_id: caseSteamId,
            case_steam_name: caseSteamName,
            case_steam_name_en: caseSteamNameEn,
            stat_data: JSON.stringify([]),
        });
    },

    async update(where, updatedData) {
        await knexInstance(TABLE_NAME).where(where).update(updatedData);
    }
}