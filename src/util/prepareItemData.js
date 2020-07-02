const formatNumber = (number) => number < 10 ? `0${number}` : number;

const timestampToFormattedDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${formatNumber(date.getDate())}.${formatNumber(date.getMonth() + 1)} ${formatNumber(date.getHours())}:${formatNumber(date.getMinutes())}`;
}

module.exports = (item) => {
    const periodsData = JSON.parse(item.stat_data);

    const parsedStatData = periodsData.map((periodData, index) => {
        const currentPeriodSellAvg = periodData.priceAccumulator / periodData.updatesCount;
        const formattedDate = timestampToFormattedDate(periodData.end);

        return {
            formattedDate,
            sellPriceAvg: currentPeriodSellAvg,
        };
    });

    const lastData = parsedStatData[parsedStatData.length - 1];
    const prevLastData = parsedStatData[parsedStatData.length - 2];

    const dayBreakPoints = parsedStatData.filter(item => /23:59/.test(item.formattedDate));
    const lastDayBreakPoint = dayBreakPoints.pop();
    const currentDayDiff = lastDayBreakPoint && lastData ? lastData.sellPriceAvg - lastDayBreakPoint.sellPriceAvg : 0;

    const myProfit = item.my_auto_price ? lastData.sellPriceAvg - item.my_auto_price / 0.87 : null;

    return {
        myProfit,
        currentDayDiff,
        dayBreakPointDate: lastDayBreakPoint ? lastDayBreakPoint.formattedDate : null,
        id: item.id,
        itemName: item.item_steam_name,
        itemNameEn: item.item_steam_name_en,
        itemId: item.item_steam_id,
        periodsData: parsedStatData,
        lastPeriodDiff: lastData && prevLastData ? lastData.sellPriceAvg - prevLastData.sellPriceAvg : 0,
        myAutoPrice: item.my_auto_price,
    };
};