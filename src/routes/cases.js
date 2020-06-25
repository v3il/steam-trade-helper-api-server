const express = require('express');
const DynamicItems = require('../services/DynamicItems');

const router = express.Router();

router.get('/', async (request, response) => {
    const cases = await DynamicItems.getAll();

    const parsedCasesData = cases.map((caseData) => {
        const periodsData = JSON.parse(caseData.stat_data);

        const parsedStatData = periodsData.map((periodData, index) => {
            const prevPeriodData = periodsData[index - 1];

            const currentPeriodSellAvg = periodData.totalSellPrice / periodData.totalSellPriceUpdates;
            const currentPeriodBuyAvg = periodData.totalBuyPrice / periodData.totalBuyPriceUpdates;

            periodData.sellPriceAvg = currentPeriodSellAvg;
            periodData.buyPriceAvg = currentPeriodBuyAvg;

            if (!prevPeriodData) {
                return periodData;
            }

            const prevPeriodSellAvg = prevPeriodData.totalSellPrice / prevPeriodData.totalSellPriceUpdates;
            const prevPeriodBuyAvg = prevPeriodData.totalBuyPrice / prevPeriodData.totalBuyPriceUpdates;

            periodData.prevPeriodSellPriceDiff = currentPeriodSellAvg - prevPeriodSellAvg;
            periodData.prevPeriodBuyPriceDiff = currentPeriodBuyAvg - prevPeriodBuyAvg;

            return periodData;
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

module.exports = router;