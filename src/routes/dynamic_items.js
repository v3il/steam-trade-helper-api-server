const express = require('express');
const DynamicItems = require('../services/DynamicItems');

const { formatNumber } = require('../util');

const router = express.Router();

const timestampToFormattedDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${formatNumber(date.getDate())}.${formatNumber(date.getMonth() + 1)} ${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}`;
}

router.get('/', async (request, response) => {
    const dynamicItems = await DynamicItems.getAll();

    const parsedCasesData = dynamicItems.map((caseData) => {
        const periodsData = JSON.parse(caseData.stat_data);

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

        const myProfit = caseData.my_auto_price ? lastData.sellPriceAvg - caseData.my_auto_price / 0.87 : null;

        return {
            myProfit,
            currentDayDiff,
            dayBreakPointDate: lastDayBreakPoint ? lastDayBreakPoint.formattedDate : null,
            id: caseData.id,
            itemName: caseData.item_steam_name,
            itemNameEn: caseData.item_steam_name_en,
            itemId: caseData.item_steam_id,
            periodsData: parsedStatData,
            lastPeriodDiff: lastData && prevLastData ? lastData.sellPriceAvg - prevLastData.sellPriceAvg : 0,
            myAutoPrice: caseData.my_auto_price,
        };
    });

    response.json({
        cases: parsedCasesData,
    });
});

router.post('/', async (request, response) => {
    const { steamName, steamId, steamNameEn } = request.body;
    await DynamicItems.create(steamId, steamName, steamNameEn);

    response.sendStatus(200);
});

router.post('/update_price', async (request, response) => {
    const { price, name } = request.body;

    const selectedItems = await DynamicItems.get({ item_steam_name: name });

    if (!selectedItems.length) {
        return response.sendStatus(404);
    }

    await DynamicItems.update({ item_steam_name: name }, {
        my_auto_price: price || null,
    });

    response.sendStatus(200);
});

router.delete('/', async (request, response) => {
    const { id } = request.query;
    await DynamicItems.delete({ id });

    response.sendStatus(200);
});

module.exports = router;