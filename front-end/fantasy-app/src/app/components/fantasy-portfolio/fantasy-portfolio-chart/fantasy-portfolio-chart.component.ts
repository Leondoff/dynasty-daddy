import { Component, OnInit, ViewChild, Input, OnChanges } from '@angular/core';
import { BaseChartDirective, Label } from 'ng2-charts';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { ComparisonColorPalette } from '../../../services/utilities/color.service';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { PortfolioService } from '../../services/portfolio.service';
import { PlayerService } from 'src/app/services/player.service';
import { ConfigService } from 'src/app/services/init/config.service';


@Component({
    selector: 'app-fantasy-portfolio-chart',
    templateUrl: './fantasy-portfolio-chart.component.html',
    styleUrls: ['./fantasy-portfolio-chart.component.css']
})
export class FantasyPortfolioChartComponent implements OnInit, OnChanges {

    @Input()
    playerPortfolioWithValue: FantasyPlayer[] = [];

    /** chart set up */
    @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

    /** selected filter range */
    selectedDateFilter = '6month';

    /** ng2-chart options */
    public lineChartOptions: (ChartOptions & { annotation?: any }) = {
        responsive: true,
        maintainAspectRatio: false,
        spanGaps: false,
        tooltips: {
            intersect: false,
            mode: 'index',
            position: 'nearest',
        },
        scales: {
            xAxes: [{
                type: 'time',
                display: true,
                gridLines: {
                    display: true
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Date',
                    fontColor: '#d3d3d3'
                }
            }],
            yAxes: [{
                display: true,
                gridLines: {
                    display: true
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Value',
                    fontColor: '#d3d3d3'
                }
            }]
        },
        legend: {
            display: false,
            position: 'top',
            labels: {
                fontColor: '#d3d3d3'
            }
        },
        plugins: {
            decimation: {
                enabled: true,
                algorithm: 'lttb',
                samples: 50,
                threshold: 100
            },
            colorschemes: {
                scheme: ComparisonColorPalette,
                override: true
            }
        }
    };
    public lineChartLegend = true;
    public lineChartType = 'line';
    public lineChartPlugins = [];
    public lineChartLabels: Label[] = [];
    public lineChartData: ChartDataSets[] = [];

    constructor(private portfolioService: PortfolioService,
        public configService: ConfigService,
        public playerService: PlayerService) {
    }

    ngOnInit(): void {
        this.updateChart();
    }

    ngOnChanges(): void {
        this.updateChart();
    }

      /**
   * select market handle
   * @param market new market
   */
  onMarketChange(market): void {
    this.playerService.selectedMarket = market;
    this.portfolioService.updatePortfolio()
    this.updateChart();
  }
    
    /**
       * rerender chart with data
       */
    updateChart(): void {
        this.lineChartLabels = [];
        this.lineChartData = [];
        let displayDays;
        switch (this.selectedDateFilter) {
            case '6month':
                displayDays = 180;
                break;
            case '3month':
                displayDays = 90;
                break;
            default:
                displayDays = 30;
                break;
        }
        const dataset = [];
        for (let i = 0; i < displayDays + 1; i++) {
            let totalValue = 0;
            const today = new Date();
            today.setDate(today.getDate() - (displayDays - i));
            const formattedDate = today.getFullYear() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2);
            this.portfolioService.playersWithValue.forEach(player => {
                const playerData = this.portfolioService.fantasyPortfolioDict[player.name_id];
                const dayDataPoint = playerData?.find(it => it.date === formattedDate);
                const sfTradeValue = this.playerService.getValueFromDataPoint(dayDataPoint, true);
                const stdTradeValue = this.playerService.getValueFromDataPoint(dayDataPoint, true);
                if (dayDataPoint) {
                    totalValue += (this.portfolioService.playerHoldingMap[player.name_id]?.superflex || 0) * sfTradeValue
                        + (this.portfolioService.playerHoldingMap[player.name_id]?.standard || 0) * stdTradeValue;
                }
            });
            this.lineChartLabels.push(today.toString().slice(4, 15));
            dataset.push(totalValue);
        }
        this.lineChartData.push({ data: dataset.reverse(), label: 'Portfolio Value' });
        this.lineChartLabels.reverse();
        if (this.chart && this.chart.chart) {
            this.chart.chart.data.datasets = this.lineChartData;
            this.chart.chart.data.labels = this.lineChartLabels;
        }
    }
}
