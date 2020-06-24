const axios = require('axios');

const CasesService = require('../services/Cases');
const config = require("../config");

const { getAvgPrice, formatNumber } = require('../util');

const updateCaseData = async (caseData) => {
    const { stat_data: statData, case_steam_id: caseSteamId, id } = caseData;

    const parsedStat = JSON.parse(statData);

    const date = new Date();
    const statDate = `${formatNumber(date.getDate())}.${formatNumber(date.getMonth() + 1)}`;

    let statForCurrentDay = parsedStat.find(stat => stat.date === statDate);

    if (!statForCurrentDay) {
        statForCurrentDay = {
            date: statDate,
            sellPrice: 0,
            buyPrice: 0,
        };

        parsedStat.push(statForCurrentDay);

        if (parsedStat.length > config.MAX_STAT_PERIOD) {
            parsedStat.shift();
        }
    }

    try {
        const response = await axios.get('https://steamcommunity.com/market/itemordershistogram', {
            params: {
                item_nameid: caseSteamId,
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

        statForCurrentDay.sellPrice = getAvgPrice(sellData);
        statForCurrentDay.buyPrice = getAvgPrice(buyData);

        await CasesService.update({ id }, {
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

const start = async () => {
    let currentCaseIndex = 0;

    const intervalId = setInterval(async () => {
        const cases = await CasesService.getAll();

        if (!cases.length) {
            return clearInterval(intervalId);
        }

        currentCaseIndex++;

        if (currentCaseIndex >= cases.length) {
            currentCaseIndex = 0;
        }

        await updateCaseData(cases[currentCaseIndex]);
    }, config.UPDATE_INFO_DELAY);
};

start();

module.exports = start();