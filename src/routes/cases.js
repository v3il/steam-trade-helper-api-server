const express = require('express');
const CasesService = require('../services/Cases');

const router = express.Router();

router.get('/', async (request, response) => {
    const cases = await CasesService.getAll();

    const parsedCasesData = cases.map((caseData) => {
        const periodsData = JSON.parse(caseData.stat_data);

        const parsedStatData = periodsData.map((periodData, index) => {
            const prevPeriodData = periodsData[index - 1];

            if (!prevPeriodData) {
                return periodData;
            }

            periodData.prevPeriodSellPriceDiff = periodData.sellPrice - prevPeriodData.sellPrice;
            periodData.prevPeriodBuyPriceDiff = periodData.buyPrice - prevPeriodData.buyPrice;

            return periodData;
        });

        return {
            id: caseData.id,
            caseName: caseData.case_steam_name,
            caseNameEn: caseData.case_steam_name_en,
            caseId: caseData.case_steam_id,
            periodsData: parsedStatData,
        };
    });

    response.json({
        cases: parsedCasesData,
    });
});

router.post('/', async (request, response) => {
    const { caseSteamName, caseSteamId, caseSteamNameEn } = request.body;
    await CasesService.create(caseSteamId, caseSteamName, caseSteamNameEn);

    response.sendStatus(200);
});

module.exports = router;