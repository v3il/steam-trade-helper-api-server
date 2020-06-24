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

const a = async () => {
    // await CasesService.create(176096390, 'Кейс «Расколотая сеть»');

    const cases = await CasesService.getAll();

    console.log(cases);

    await updateCaseData(cases[0]);

    process.exit(0);

    // setInterval(() => {
    //     updateCaseData();
    // }, 15 * 1000);
};

a();

// module.exports =