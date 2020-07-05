const ItemView = Vue.component('item-view', {
    template: `
        <div class="item-view" :class="{ 'item-view--danger': item.myProfit !== null && item.myProfit < 0 }">
            <div class="item-view__header">
                <div>
                    <a :href="itemLink" target="_blank">{{item.itemName}}</a>
                    
                    &bullet;
                    
                    <span class="item-view__diff" :class="[
                        item.lastPeriodDiff > 0 ? 'item-view__diff--positive' : 'item-view__diff--negative',
                    ]">За час: {{item.lastPeriodDiff.toFixed(2)}}</span>
                    
                    &bullet;
                    
                    <span v-if="item.currentDayDiff !== null" class="item-view__diff" :class="[
                        item.currentDayDiff > 0 ? 'item-view__diff--positive' : 'item-view__diff--negative',
                    ]">За день: {{item.currentDayDiff.toFixed(2)}}</span>
                    
                    &bullet;
                    
                    <span v-if="item.myProfit !== null" class="item-view__diff" :class="[
                        item.myProfit > 0 ? 'item-view__diff--positive' : 'item-view__diff--negative',
                    ]">Прибыль (авто): {{item.myProfit.toFixed(2)}}</span>
                </div>
                
                <div>
                    <a href="javascript://" v-if="item.pinned" @click.prevent="$emit('unpin')" class="item-view__pin">Открепить</a>
                    <a href="javascript://" v-else @click.prevent="$emit('pin')" class="item-view__pin">Закрепить</a>
                    
                    &bullet;
                    
                    <a href="javascript://" @click.prevent="$emit('delete')" class="item-view__remove">Удалить</a>
                </div>
            </div>
            
            <div class="item-view__chart-wrapper" v-show="showGraphs">
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
        showGraphs: Boolean,
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

            const options = {
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
                    },
                    annotation: {
                        drawTime: 'afterDatasetsDraw',
                        annotations: [
                            {
                                type: 'line',
                                mode: 'horizontal',
                                scaleID: 'y-axis-0',
                                value: data[data.length - 1],
                                borderColor: 'lightgreen',
                                borderWidth: 1,
                                label: {
                                    position: 'right',
                                    enabled: true,
                                    yAdjust: 15,
                                    content: `${data[data.length - 1].toFixed(2)}`,
                                }
                            }
                        ]
                    },
                },
            };

            if (this.item.myAutoPrice) {
                options.options.annotation.annotations.push({
                    type: 'line',
                    mode: 'horizontal',
                    scaleID: 'y-axis-0',
                    value: this.item.myAutoPrice,
                    borderColor: 'red',
                    borderWidth: 1,
                    label: {
                        enabled: true,
                        content: this.item.myAutoPrice,
                        yAdjust: -15,
                    }
                });
            }

            if (this.item.dayBreakPointDate) {
                options.options.annotation.annotations.push({
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x-axis-0',
                    value: this.item.dayBreakPointDate,
                    borderColor: 'green',
                    borderWidth: 1,
                });
            }

            this.chartInstance = new Chart(ctx, options);
        });
    },

    watch: {
        item: {
            handler(newItem) {
                const data = newItem.periodsData.map(item => item.sellPriceAvg);
                const labels = this.item.periodsData.map(item => item.formattedDate);

                this.chartInstance.data.datasets[0].data = data;
                this.chartInstance.data.labels = labels;

                const currentValueLine = this.chartInstance.options.annotation.annotations[0];

                currentValueLine.value = data[data.length - 1];
                currentValueLine.label.content = `${data[data.length - 1].toFixed(2)}`;

                this.chartInstance.update();
            }
        }
    }
});

new Vue({
    el: '#app',

    data: {
        items: [],
        showGraphs: true,
        apiUrl: window.isProduction ? 'http://194.32.79.212:8001' : 'http://localhost:3000',
    },

    components: {
        ItemView,
    },

    computed: {
        sortedItems() {
            return this.items.sort((a, b) => {
                if (a.pinned && b.pinned) { return b.currentDayDiff - a.currentDayDiff; }
                if (a.pinned && !b.pinned) { return -1; }
                if (b.pinned && !a.pinned) { return 1; }

                if (a.currentDayDiff === null && b.currentDayDiff === null) { return 0; }
                if (a.currentDayDiff === null) { return -1; }
                if (b.currentDayDiff === null) { return 1; }

                return b.currentDayDiff - a.currentDayDiff;
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

        pin(item) {
            fetch(`/dynamic_items/pin`, {
                method: 'post',
                body: JSON.stringify({ id: item.id }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(() => {
                item.pinned = true;
            });
        },

        unpin(item) {
            fetch(`/dynamic_items/unpin`, {
                method: 'post',
                body: JSON.stringify({ id: item.id }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(() => {
                item.pinned = false;
            });
        }
    },

    async created() {
        this.showGraphs = (localStorage.getItem('showGraphs') || 'true') === 'true';

        Chart.defaults.global.defaultColor = '#454d55';
        Chart.defaults.global.defaultFontColor = "#fff";
        Chart.defaults.global.elements.point.borderColor = '#fff';
        Chart.defaults.global.elements.point.backgroundColor = '#fff';

        await this.loadItems();

        const socket = io.connect(this.apiUrl);

        socket.on('itemUpdated', (data) => {
            console.log('Updated', data);

            const { id } = data;
            const updatedItemIndex = this.items.findIndex(item => item.id === id);

            if (updatedItemIndex >= 0) {
                this.items.splice(updatedItemIndex, 1, data);
            }
        });
    },

    watch: {
        showGraphs(newValue) {
            console.log(newValue);
            localStorage.setItem('showGraphs', newValue);
        }
    }
});