const axios = require('axios');
const { promisify } = require('util');

const DynamicItems = require('../services/DynamicItems');
const config = require("../config");
const { formatNumber } = require('../util');

const promisifiedSetTimeout = promisify(setTimeout);

const updateItemData = async (itemData) => {
    const { id, stat_data: statData, item_steam_id: itemSteamId, item_steam_name: itemSteamName } = itemData;

    console.log(`Обновляем данные предмета "${itemSteamName}"`);

    const parsedStat = JSON.parse(statData);

    const date = new Date();
    const statDate = `${formatNumber(date.getDate())}.${formatNumber(date.getMonth() + 1)}`;

    let statForCurrentDay = parsedStat.find(stat => stat.date === statDate);

    if (!statForCurrentDay) {
        statForCurrentDay = {
            date: statDate,
            totalSellPrice: 0,
            totalSellPriceUpdates: 0,
            totalBuyPrice: 0,
            totalBuyPriceUpdates: 0,
        };

        parsedStat.push(statForCurrentDay);

        if (parsedStat.length > config.MAX_STAT_PERIOD) {
            parsedStat.shift();
        }
    }

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

        const { sell_order_graph: sellData, buy_order_graph: buyData } = response.data;

        if (!(sellData && buyData)) {
            return;
        }

        const firstSellData = sellData[0]; // [price, volume, text]

        if (firstSellData) {
            statForCurrentDay.totalSellPrice += firstSellData[0];
            statForCurrentDay.totalSellPriceUpdates++;
        }

        const firstBuyData = buyData[0]; // [price, volume, text]

        if (firstBuyData) {
            statForCurrentDay.totalBuyPrice += firstBuyData[0];
            statForCurrentDay.totalBuyPriceUpdates++;
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

module.exports = () => {
    setTimeout(async () => {
        await updateItemsData();
    }, config.UPDATE_INFO_DELAY);
};