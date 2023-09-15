import { Component, OnInit, AfterViewInit, Input, ViewChild } from "@angular/core";
import { ChartDataSets, ChartOptions } from "chart.js";
import { BaseChartDirective, Label } from "ng2-charts";

@Component({
    selector: 'player-trade-market',
    templateUrl: './player-trade-market.component.html',
    styleUrls: ['./player-trade-market.component.scss']
})
export class PlayerTradeMarketComponent implements OnInit, AfterViewInit {

    /** chart set up */
    @ViewChild(BaseChartDirective) chart: BaseChartDirective;

    /** selected player info */
    @Input()
    tradeData: {};

    /** trade Volume Cache */
    tradeVolumeCache = {};

    /** display columns */
    displayedColumns: string[] = ['rank', 'name', 'value'];

    /** line chart data */
    public lineChartData: ChartDataSets[] = [];

    /** line chart labels */
    public lineChartLabels: Label[] = [];

    /** line chart options */
    public lineChartOptions: (ChartOptions & { annotation?: any }) = {
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
            intersect: false,
            mode: 'index',
            position: 'nearest',
        },
        scales: {
            xAxes: [{
                display: true,
                gridLines: {
                    display: false
                },
                scaleLabel: {
                    display: false,
                    labelString: 'Week Interval',
                    fontColor: '#d3d3d3'
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true
                },
                display: true,
                gridLines: {
                    display: false
                },
                scaleLabel: {
                    display: false,
                    labelString: 'Trade Volume',
                    fontColor: '#d3d3d3'
                }
            }],
        }
    };
    public lineChartLegend = false;
    public lineChartType = 'line';
    public lineChartPlugins = [];
    public chartColors: any[] = [];

    ngAfterViewInit(): void {
        this.generateChartData();
        this.generateCache();
    }

    ngOnInit(): void {
        this.generateCache();
    }

    ngOnChanges(): void {
        this.generateCache();
        this.generateChartData();
    }

    /**
     * generate cache for trade metrics
     */
    generateCache(): void {
        const newCache = {}
        const lastWeek = this.tradeData?.['mat_vw_trade_agg']?.find(t => t.week_interval == 1);
        const twoWeek = this.tradeData?.['mat_vw_trade_agg']?.find(t => t.week_interval == 2);
        newCache['lastWeekVol'] = lastWeek?.count || 0;
        newCache['lastWeekPer'] = Math.round((((lastWeek?.count || 0) - (twoWeek?.count || 0))
            / (twoWeek?.count || 1)) * 100);
        newCache['posRank'] = lastWeek?.position_rank || 0;
        newCache['ovRank'] = lastWeek?.rank || 0;
        if (twoWeek && lastWeek) {
            newCache['posRankChange'] = (twoWeek?.position_rank || 0) - (lastWeek?.position_rank || 0);
            newCache['ovRankChange'] = (twoWeek?.rank || 0) - (lastWeek?.rank || 0);
        } else if (lastWeek) {
            newCache['posRankChange'] = lastWeek?.position_rank || 0;
            newCache['ovRankChange'] = lastWeek?.rank || 0;
        } else {
            newCache['posRankChange'] = '-';
            newCache['ovRankChange'] = '-';
        }
        let monthOne = 0;
        let monthTwo = 0;
        this.tradeData?.['mat_vw_trade_agg']?.forEach(t => {
            if (t.week_interval < 5) {
                monthOne += t?.count || 0;
            } else {
                monthTwo += t?.count || 0;
            }
        });
        newCache['monthVol'] = monthOne;
        newCache['monthPer'] = Math.round(((monthOne - monthTwo)
            / (monthTwo || 1)) * 100);
        this.tradeVolumeCache = newCache;
    }

    /**
     * format chart data for table
     */
    generateChartData(): void {
        this.lineChartData = [];
        this.lineChartLabels = [];
        const dataList = [];
        if (this.tradeData?.['mat_vw_trade_agg']) {
            for (let ind = 1; ind <= 8; ind++) {
                const dataPoint = this.tradeData?.['mat_vw_trade_agg']?.find(t => t.week_interval == ind)
                console.log(this.tradeData, dataPoint);
                dataList.push(dataPoint?.count || 0);
                this.lineChartLabels.push(ind === 1 ? 'Past 7 Days' : `${(ind - 1) * 7}-${ind * 7} Days Ago`);
            }
            // reverse data
            this.lineChartData.push({ label: 'Trade Volume', data: dataList });
            this.lineChartLabels.reverse();
            if (dataList[dataList.length - 1] === null ?
                dataList[dataList.length - 2] < dataList[0]
                : dataList[dataList.length - 1] < dataList[0]) {
                this.chartColors = [
                    {
                        backgroundColor: 'rgba(87, 235, 161, 0.25)',
                        borderColor: '#57eba1',
                        pointBackgroundColor: '#96F2C4',
                        pointBorderColor: '#96F2C4'
                    }
                ];
            } else {
                this.chartColors = [
                    {
                        backgroundColor: 'rgba(254, 129, 128, 0.25)',
                        borderColor: '#fe8180',
                        pointBackgroundColor: '#ffadad',
                        pointBorderColor: '#ffadad'
                    }
                ];
            }
            this.lineChartLabels.reverse();
            this.chart.chart.data.datasets = this.lineChartData;
            this.chart.chart.data.labels = this.lineChartLabels;
        }
    }
}