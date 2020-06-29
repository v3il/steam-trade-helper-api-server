const axios = require('axios');
const { promisify } = require('util');

const DynamicItems = require('../services/DynamicItems');
const config = require("../config");

const promisifiedSetTimeout = promisify(setTimeout);

const getTimestamp = (date) => {
    const ms = date ? date.getTime() : Date.now();
    return Math.floor(ms / 1000)
};

const getCurrentPeriodBeginning = () => {
    const now = new Date();
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return getTimestamp(now);
};

const getCurrentPeriodEnding = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() >= 30 ? 59 : 29);
    now.setSeconds(59);
    now.setMilliseconds(0);
    return getTimestamp(now);
};

const maxData = 2 * 24 * 7; // every 30 min

const updateItemData = async (itemData) => {
    const { id, stat_data: statData, item_steam_id: itemSteamId, item_steam_name: itemSteamName } = itemData;
    const parsedStat = JSON.parse(statData);

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

        const currentTimestamp = getTimestamp();
        const currentHourBeginning = getCurrentPeriodBeginning();
        const currentHourEnding = getCurrentPeriodEnding();

        let statForCurrentHour = parsedStat.find(item => {
            return currentTimestamp >= item.start && currentTimestamp <= item.end;
        });

        if (!statForCurrentHour) {
            statForCurrentHour = {
                start: currentHourBeginning,
                end: currentHourEnding,
                priceAccumulator: 0,
                updatesCount: 0,
            };

            parsedStat.push(statForCurrentHour);

            if (parsedStat.length >= maxData) {
                parsedStat.shift();
            }
        }

        statForCurrentHour.priceAccumulator += sellData[0][0];
        statForCurrentHour.updatesCount++;

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
};