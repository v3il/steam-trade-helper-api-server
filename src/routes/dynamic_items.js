const express = require('express');
const DynamicItems = require('../services/DynamicItems');

const { formatNumber } = require('../util');

const router = express.Router();

const timestampToFormattedDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${formatNumber(date.getDay())}.${formatNumber(date.getMonth() + 1)} ${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}`;
}

router.get('/', async (request, response) => {
    const cases = await DynamicItems.getAll();

    const parsedCasesData = cases.map((caseData) => {
        const periodsData = JSON.parse(caseData.stat_data);

        const parsedStatData = periodsData.map((periodData, index) => {
            const prevPeriodData = periodsData[index - 1];

            const currentPeriodSellAvg = periodData.priceAccumulator / periodData.updatesCount;
            periodData.sellPriceAvg = currentPeriodSellAvg;
            periodData.formattedDate = timestampToFormattedDate(periodData.end);

            const data = {
                sellPriceAvg: currentPeriodSellAvg,
                formattedDate: timestampToFormattedDate(periodData.end),
            };

            if (!prevPeriodData) {
                return data;
            }

            const prevPeriodSellAvg = prevPeriodData.priceAccumulator / prevPeriodData.updatesCount;
            data.prevPeriodSellPriceDiff = currentPeriodSellAvg - prevPeriodSellAvg;

            return data;
        });

        return {
            id: caseData.id,
            itemName: caseData.item_steam_name,
            itemNameEn: caseData.item_steam_name_en,
            itemId: caseData.item_steam_id,
            periodsData: parsedStatData,
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

router.delete('/', async (request, response) => {
    const { id } = request.query;
    await DynamicItems.delete({ id });

    response.sendStatus(200);
});

module.exports = router;