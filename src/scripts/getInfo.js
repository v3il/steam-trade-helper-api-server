const axios = require('axios');
const { promisify } = require('util');
const crypto = require('crypto');

const CasesService = require('../services/Cases');
const config = require("../config");
const { getAvgPrice, formatNumber } = require('../util');

const promisifiedSetTimeout = promisify(setTimeout);

const updateCaseData = async (caseData) => {
    const { id, stat_data: statData, case_steam_id: caseSteamId, case_steam_name: caseSteamName } = caseData;

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

const updateItemsData = async () => {
    const cases = await CasesService.getAll();

    for (const caseData of cases) {
        await updateCaseData(caseData);
        await promisifiedSetTimeout(config.UPDATE_INFO_DELAY);
    }

    await promisifiedSetTimeout(config.UPDATE_INFO_DELAY);
    await updateItemsData();
}

const start = async () => {
    console.log(crypto.createHash('sha256').update('stha-user-1').digest('hex'));

    await updateItemsData();
};

start();

module.exports = start;