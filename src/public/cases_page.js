const ItemView = Vue.component('item-view', {
    template: `
        <div class="item-view">
            <div class="item-view__header">
                <div>
                    <a :href="itemLink" target="_blank">{{item.itemName}}</a>
                    <span class="item-view__diff" :class="[
                        item.lastPeriodDiff > 0 ? 'item-view__diff--positive' : 'item-view__diff--negative',
                    ]">({{item.lastPeriodDiff.toFixed(2)}})</span>
                </div>
                
                <a href="javascript://" @click.prevent="$emit('delete')" class="item-view__remove">Удалить</a>
            </div>
            
            <div class="item-view__chart-wrapper">
                <canvas class="js-chart"></canvas>
            </div>
        </div>
   `,

    data() {
        return {
            chartInstance: null,
        }
    },

    props: {
        item: Object,
    },

    computed: {
        itemLink() {
            return `https://steamcommunity.com/market/listings/730/${this.item.itemNameEn}`;
        },
    },

    mounted() {
        const data = this.item.periodsData.map(item => item.sellPriceAvg);
        const labels = this.item.periodsData.map(item => item.formattedDate);

        this.$nextTick(() => {
            const ctx = this.$el.querySelector('.js-chart').getContext('2d');

            this.chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: '',
                        data,
                        backgroundColor: ['rgba(255, 255, 255, 0.2)'],
                        borderColor: ['#fff'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    elements: { point: { radius: 1 } },
                    maintainAspectRatio: false,
                    legend: { display: false },
                    scales: {
                        xAxes: [{ gridLines: { color: '#454d55' }}],
                        yAxes: [{ gridLines: { color: '#454d55' }, ticks: { callback: label => label.toFixed(2) }}],
                    }
                }
            });
        });
    },

    watch: {
        item: {
            handler(newItem) {
                const data = newItem.periodsData.map(item => item.sellPriceAvg);
                const labels = this.item.periodsData.map(item => item.formattedDate);

                this.chartInstance.data.datasets[0].data = data;
                this.chartInstance.data.labels = labels;

                this.chartInstance.update();
            }
        }
    }
});

new Vue({
    el: '#app',
    data: { items: [] },

    components: {
        ItemView,
    },

    computed: {
        sortedItems() {
            return this.items.sort((a, b) => {
                return b.lastPeriodDiff - a.lastPeriodDiff;
            });
        }
    },

    methods: {
        loadItems() {
            fetch('/dynamic_items')
                .then(response => response.json())
                .then(response => { this.items = response.cases });
        },

        deleteItem(itemData) {
            if (confirm('Удалить?')) {
                fetch(`/dynamic_items?id=${itemData.id}`, { method: 'delete' }).then(() => {
                    this.items = this.items.filter(item => itemData !== item);
                });
            }
        },
    },

    created() {
        Chart.defaults.global.defaultColor = '#454d55';
        Chart.defaults.global.defaultFontColor = "#fff";
        Chart.defaults.global.elements.point.borderColor = '#fff';
        Chart.defaults.global.elements.point.backgroundColor = '#fff';

        this.loadItems();

        setInterval(() => {
            console.error('Update items');
            this.loadItems();
        }, 30 * 1000);
    },
});