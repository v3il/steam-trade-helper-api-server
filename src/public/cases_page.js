const formatNumber = (number) => number < 10 ? `0${number}` : number;

new Vue({
    el: '#app',
    data: { items: [] },

    computed: {
        periodDates() {
            if (!this.items.length) {
                return [];
            }

            const firstItem = this.items[0];
            return firstItem.periodsData.map(periodData => periodData.date);
        },

        activeColumnIndex() {
            const date = new Date();
            const statDate = `${formatNumber(date.getDate())}.${formatNumber(date.getMonth() + 1)}`;

            return this.periodDates.findIndex(periodsDate => periodsDate === statDate);
        },
    },

    methods: {
        loadItems() {
            fetch('/cases')
                .then(r => r.json())
                .then(r => this.items = r.cases);
        }
    },

    created() {
        this.loadItems();

        setInterval(() => {
            console.error('Update items');
            this.loadItems();
        }, 5000);
    }
});