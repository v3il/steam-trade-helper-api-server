const axios = require('axios');
const { promisify } = require('util');

const DynamicItems = require('../services/DynamicItems');
const config = require('../config');
const { getSocketInstance } = require('../socketInstance');
const { formatNumber } = require('../util');

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
    now.setMinutes(59);
    now.setSeconds(59);
    now.setMilliseconds(0);
    return getTimestamp(now);
};

const timestampToFormattedDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${formatNumber(date.getDate())}.${formatNumber(date.getMonth() + 1)} ${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}`;
}

const dispatchUpdatedItemData = async (itemId) => {
    const selectedItems = await DynamicItems.get({ id: itemId });

    if (!selectedItems.length) {
        return;
    }

    const [item] = selectedItems;
    const periodsData = JSON.parse(item.stat_data);

    const parsedStatData = periodsData.map((periodData, index) => {
        const currentPeriodSellAvg = periodData.priceAccumulator / periodData.updatesCount;
        const formattedDate = timestampToFormattedDate(periodData.end);

        return {
            formattedDate,
            sellPriceAvg: currentPeriodSellAvg,
        };
    });

    const lastData = parsedStatData[parsedStatData.length - 1];
    const prevLastData = parsedStatData[parsedStatData.length - 2];

    const dayBreakPoints = parsedStatData.filter(item => /23:59/.test(item.formattedDate));
    const lastDayBreakPoint = dayBreakPoints.pop();
    const currentDayDiff = lastDayBreakPoint && lastData ? lastData.sellPriceAvg - lastDayBreakPoint.sellPriceAvg : 0;

    const myProfit = item.my_auto_price ? lastData.sellPriceAvg - item.my_auto_price / 0.87 : null;

    const data = {
        myProfit,
        currentDayDiff,
        dayBreakPointDate: lastDayBreakPoint ? lastDayBreakPoint.formattedDate : null,
        id: item.id,
        itemName: item.item_steam_name,
        itemNameEn: item.item_steam_name_en,
        itemId: item.item_steam_id,
        periodsData: parsedStatData,
        lastPeriodDiff: lastData && prevLastData ? lastData.sellPriceAvg - prevLastData.sellPriceAvg : 0,
        myAutoPrice: item.my_auto_price,
    };

    getSocketInstance().sockets.emit('itemUpdated', data);
};

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

            if (parsedStat.length >= config.MAX_STAT_PERIOD) {
                parsedStat.shift();
            }
        }

        statForCurrentHour.priceAccumulator += sellData[0][0];
        statForCurrentHour.updatesCount++;

        await DynamicItems.update({ id }, {
            stat_data: JSON.stringify(parsedStat),
        });

        await dispatchUpdatedItemData(id);
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