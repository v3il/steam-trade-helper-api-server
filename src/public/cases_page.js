const formatNumber = (number) => number < 10 ? `0${number}` : number;

const ItemView = Vue.component('item-view', {
    template: `
        <tr>
            <td class="name-column">
                <div>
                    <a :href="itemLink" target="_blank">
                        {{item.itemName}}
                    </a>
                    <a href="#">Удалить</a>
                </div>
                
                <div style="height: 150px; position: relative;">
                    <canvas class="js-chart"></canvas>
                </div>
            </td>
        </tr>
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
        }
    },

    mounted() {
        const data = this.item.periodsData.map(item => item.minPrice);
        const labels = this.item.periodsData.map(item => {
            const date = new Date(item.timestamp * 1000);
            return `${formatNumber(date.getHours())}.${formatNumber(date.getMinutes())}`;
        });

        console.log(data.length)


        Chart.defaults.global.defaultColor = '#454d55';
        Chart.defaults.global.defaultFontColor = "#fff";
        Chart.defaults.global.elements.point.borderColor = '#fff';
        Chart.defaults.global.elements.point.backgroundColor = '#fff';

        this.$nextTick(() => {
            var ctx = this.$el.querySelector('.js-chart').getContext('2d');
            this.chartInstance = new Chart(ctx, {
                type: 'line',

                data: {
                    labels,
                    datasets: [{
                        label: '',
                        data,
                        backgroundColor: [
                            'rgba(255, 255, 255, 0.2)',
                        ],
                        borderColor: [
                            '#fff',
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    elements: {
                        point: {
                            radius: 1
                        }
                    },
                    maintainAspectRatio: false,
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                            // type: 'linear',
                            // position: 'bottom',
                            // ticks: {
                            //     min: -1,
                            //     max: 8,
                            //     stepSize: 1,
                            //     fixedStepSize: 1,
                            // },
                            gridLines: {
                                color: '#454d55',
                                // lineWidth: 1
                            }
                        }],
                        yAxes: [{
                            // afterUpdate: function (scaleInstance) {
                            //     console.dir(scaleInstance);
                            // },
                            // ticks: {
                            //     min: -2,
                            //     max: 4,
                            //     stepSize: 1,
                            //     fixedStepSize: 1,
                            // },
                            gridLines: {
                                color: '#454d55',
                                // lineWidth: 0.5
                            }
                        }]
                    }
                }
            });
        });
    },

    watch: {
        item: {
            handler(newItem) {
                const data = newItem.periodsData.map(item => item.minPrice);
                const labels = newItem.periodsData.map(item => {
                    const date = new Date(item.timestamp * 1000);
                    return `${formatNumber(date.getHours())}.${formatNumber(date.getMinutes())}`;
                });

                this.chartInstance.data.datasets[0].data = data;
                this.chartInstance.data.labels = labels;

                this.chartInstance.update();
            }
        }
    }
});

new Vue({
    el: '#app',
    data: {items: [], currentDateStr: ''},

    components: {
        ItemView,
    },

    computed: {
        periodDates() {
            return Array.from({length: 11}).map((_, index) => index - 5).map((day) => {
                const now = Date.now();
                const delta = 86400000 * day;
                const changedDate = new Date(now + delta);
                return `${formatNumber(changedDate.getDate())}.${formatNumber(changedDate.getMonth() + 1)}`;
            });
        },

        sortedItems() {
            return this.items.sort((a, b) => {
                return a.id - b.id;
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
            var a = !this.items.length;

            fetch('/dynamic_items')
                .then(r => r.json())
                .then(r => {
                    this.items = r.cases;
                    // a && this.initCharts();

                    // this.myChart.data.datasets[0].data[2] = Math.random() * 50;
                    // this.myChart.update();
                });
        },

        deleteItem(item) {
            fetch(`/dynamic_items?id=${item.id}`, {
                method: 'delete',
            }).then(() => {
                this.items = this.items.filter(i => item !== i);
            });
        },

        // initCharts() {
        //     this.$nextTick(() => {
        //         console.log(document.getElementById('myChart'))
        //
        //         var ctx = document.getElementById('myChart').getContext('2d');
        //         ctx.height = 200;
        //
        //         this.myChart = new Chart(ctx, {
        //             type: 'line',
        //             data: {
        //                 labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        //                 datasets: [{
        //                     label: '# of Votes',
        //                     data: [12, 19, 3, 5, 2, 3],
        //                     backgroundColor: [
        //                         'rgba(54, 162, 235, 0.2)',
        //                     ],
        //                     borderColor: [
        //                         'rgba(54, 162, 235, 1)',
        //                     ],
        //                     borderWidth: 1
        //                 }]
        //             },
        //             options: {
        //                 maintainAspectRatio: false,
        //                 scales: {
        //                     yAxes: [{
        //                         ticks: {
        //                             beginAtZero: true
        //                         }
        //                     }]
        //                 }
        //             }
        //         });
        //     });
        // }
    },

    created() {
        const date = new Date();
        this.currentDateStr = `${formatNumber(date.getDate())}.${formatNumber(date.getMonth() + 1)}`;

        this.loadItems();

        setInterval(() => {
            console.error('Update items');
            this.loadItems();
        }, 5000);
    },

    mounted() {

    }
});