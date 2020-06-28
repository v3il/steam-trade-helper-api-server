const axios = require('axios');
const { promisify } = require('util');

const DynamicItems = require('../services/DynamicItems');
const config = require("../config");
const { formatNumber } = require('../util');

const promisifiedSetTimeout = promisify(setTimeout);

const getTimestamp = () => Math.floor(Date.now() / 1000);

const maxData = 12 * 24 * 7; // every 5 min

const updateItemData = async (itemData) => {
    const { id, stat_data: statData, item_steam_id: itemSteamId, item_steam_name: itemSteamName } = itemData;
    const parsedStat = [] || JSON.parse(statData);

    console.log(`Обновляем данные предмета "${itemSteamName}"`);

    try {
        const response = await axios.get('https://steamcommunity.com/market/itemordershistogram', {
            params: {
                item_nameid: itemSteamId,
                country: 'UA',
                language: 'russian',
                currency: 18,
                two_factor: 0,
            }
        });

        if (!response.data.success) {
            return;
        }

        const { sell_order_graph: sellData } = response.data;

        if (!(sellData && sellData[0])) {
            return;
        }

        parsedStat.push({
            timestamp: getTimestamp(),
            minPrice: sellData[0][0], // [price, volume, text]
        });

        while (parsedStat.length > maxData) {
            parsedStat.shift();
        }

        await DynamicItems.update({ id }, {
            stat_data: JSON.stringify(parsedStat),
        });
    } catch (error) {
        if (error.response) {
            if (error.response.status === 429) {
                console.error('429');
                process.exit(1);
            } else {
                console.error(error.message);
            }
        } else {
            console.error(error.message);
        }
    }
};

const updateItemsData = async () => {
    const items = await DynamicItems.getAll();

    for (const itemData of items) {
        await updateItemData(itemData);
        await promisifiedSetTimeout(config.UPDATE_INFO_DELAY);
    }

    await promisifiedSetTimeout(config.UPDATE_INFO_DELAY);
    await updateItemsData();
}

module.exports = async () => {
    await updateItemsData();

    setTimeout(async () => {
        await updateItemsData();
    }, 5 * 60 * 1000);
};