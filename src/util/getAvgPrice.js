const config = require("../config");

module.exports = (ordersData) => {
    const priceData = ordersData.slice(0, config.AVG_PRICE_SELECTION_LENGTH).reduce((total, current) => {
        const [price, volume] = current;

        total.totalPrice += price * volume;
        total.totalVolume += volume;

        return total;
    }, { totalPrice: 0, totalVolume: 0 });

    return priceData.totalPrice / priceData.totalVolume;
};