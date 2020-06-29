const express = require('express');
const DynamicItems = require('../services/DynamicItems');

const router = express.Router();

router.get('/', async (request, response) => {
    const cases = await DynamicItems.getAll();

    const parsedCasesData = cases.map((caseData) => {
        const periodsData = JSON.parse(caseData.stat_data);

        const parsedStatData = periodsData.map((periodData, index) => {
            const prevPeriodData = periodsData[index - 1];

            const currentPeriodSellAvg = periodData.priceAccumulator / periodData.updatesCount;
            periodData.sellPriceAvg = currentPeriodSellAvg;

            if (!prevPeriodData) {
                return periodData;
            }

            const prevPeriodSellAvg = prevPeriodData.priceAccumulator / prevPeriodData.updatesCount;
            periodData.prevPeriodSellPriceDiff = currentPeriodSellAvg - prevPeriodSellAvg;

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

router.delete('/', async (request, response) => {
    const { id } = request.query;
    await DynamicItems.delete({ id });

    response.sendStatus(200);
});

module.exports = router;