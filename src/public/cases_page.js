const formatNumber = (number) => number < 10 ? `0${number}` : number;

new Vue({
    el: '#app',
    data: { items: [], currentDateStr: '' },

    computed: {
        periodDates() {
            return Array.from({ length: 11 }).map((_, index) => index - 5).map((day) => {
                const now = Date.now();
                const delta = 86400000 * day;
                const changedDate = new Date(now + delta);
                return `${formatNumber(changedDate.getDate())}.${formatNumber(changedDate.getMonth() + 1)}`;
            });
        },

        sortedItems() {
            return this.items.sort((a, b) => {
                const aStatForToday = a.periodsData.find(data => data.date === this.currentDateStr);
                const bStatForToday = b.periodsData.find(data => data.date === this.currentDateStr);

                if (!(aStatForToday && bStatForToday)) {
                    return 0;
                }

                if (!aStatForToday && bStatForToday) {
                    return -1;
                }

                if (aStatForToday && !bStatForToday) {
                    return 1;
                }

                if (aStatForToday.prevPeriodSellPriceDiff === undefined) {
                    return 1;
                }

                if (bStatForToday.prevPeriodSellPriceDiff === undefined) {
                    return -1;
                }

                return bStatForToday.prevPeriodSellPriceDiff - aStatForToday.prevPeriodSellPriceDiff;
            });
        }
    },

    methods: {
        getPriceForDate(item, date) {
            const statData = item.periodsData.find(data => data.date === date);
            return statData ? statData.sellPriceAvg.toFixed(2) : '&nbsp;';
        },

        getDiffForDate(item, date) {
            const statData = item.periodsData.find(data => data.date === date);
            return statData && statData.prevPeriodSellPriceDiff ? statData.prevPeriodSellPriceDiff : null;
        },

        loadItems() {
            fetch('/cases')
                .then(r => r.json())
                .then(r => this.items = r.cases);
        },

        deleteItem(item) {
            fetch(`/cases?id=${item.id}`, {
                method: 'delete',
            }).then(() => {
                this.items = this.items.filter(i => item !== i);
            });
        }
    },

    created() {
        const date = new Date();
        this.currentDateStr = `${formatNumber(date.getDate())}.${formatNumber(date.getMonth() + 1)}`;

        this.loadItems();

        setInterval(() => {
            console.error('Update items');
            this.loadItems();
        }, 5000);
    }
});