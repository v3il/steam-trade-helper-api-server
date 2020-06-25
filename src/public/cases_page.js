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
        }
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
        }, 10000);
    }
});