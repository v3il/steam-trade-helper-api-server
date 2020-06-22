const axios = require('axios');

const CasesService = require('../services/Cases');

const formatNumber = (number) => number < 10 ? `0${number}` : number;

const updateCaseData = async (caseData) => {
    const { stat_data: statData, case_name: caseName } = caseData;

    const parsedStat = JSON.parse(statData);

    const date = new Date();
    const statDate = `${formatNumber(date.getDate())}.${formatNumber(date.getMonth() + 1)}`;

    let statForCurrentDay = parsedStat.find(stat => stat.date === statDate);

    if (!statForCurrentDay) {
        statForCurrentDay = {
            date: statDate,
            averagePrice: 0,
            soldCases: 0,
        }
    }

    console.log(statForCurrentDay)

    return

    try {
        // const stat = JSON.parse(statData);

        const response = await axios.get('https://steamcommunity.com/market/priceoverview', {
            params: {
                appid: 730,
                country: 'UA',
                currency: 18,
                market_hash_name: caseName,
            }
        });

        console.log(response.data);

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
    const cases = await CasesService.getAll();

    console.log(cases);

    await updateCaseData({
        stat_data: '[]',
        case_name: 'Glove Case',
    });

    // setInterval(() => {
    //     updateCaseData();
    // }, 15 * 1000);
};

a();

// module.exports =