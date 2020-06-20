const axios = require('axios');

const CasesService = require('../services/Cases');

const updateCaseData = async (caseData) => {
    console.log(caseData);

    const { stat_data: statData, case_name: caseName } = caseData;

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
        stat_data: [],
        case_name: 'Glove Case',
    });

    // setInterval(() => {
    //     updateCaseData();
    // }, 15 * 1000);
};

a();

// module.exports =