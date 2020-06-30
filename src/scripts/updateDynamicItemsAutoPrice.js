const axios = require('axios');
const { promisify } = require('util');

const DynamicItems = require('../services/DynamicItems');
const config = require("../config");

const promisifiedSetTimeout = promisify(setTimeout);

const getOrdersHTML = async () => {
    try {
        const response = await axios.get('https://steamcommunity.com/market/', {

        });
        console.log(response.data);
    } catch (error) {
        return null;
    }
};

const parseOrders = (ordersHTML) => {
    return [];
};

const updateDynamicItemsMyPrice = async (itemsData) => {

};

const updateItemsData = async () => {
    const ordersHTML = getOrdersHTML();

    if (ordersHTML) {
        const myOrdersData = parseOrders(ordersHTML);
        await updateDynamicItemsMyPrice(myOrdersData);
    }

    await promisifiedSetTimeout(10 * 60 * 1000); // 10 min
    await updateItemsData();

}

updateItemsData();

// module.exports = async () => {
//     await updateItemsData();
// };