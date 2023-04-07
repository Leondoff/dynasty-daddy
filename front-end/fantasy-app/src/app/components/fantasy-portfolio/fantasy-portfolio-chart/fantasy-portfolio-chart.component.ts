import { Component, OnInit, ViewChild, Input, OnChanges } from '@angular/core';
import { BaseChartDirective, Label } from 'ng2-charts';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { ComparisonColorPalette } from '../../../services/utilities/color.service';
import { FantasyPlayer, FantasyPlayerDataPoint } from 'src/app/model/assets/FantasyPlayer';
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

    /** selected grouping option */
    selectedGrouping = 'Total Value';

    /** Possible group by options */
    groupByOptions: string[] = ['Total Value', 'League', 'Position', 'QB Setting', 'Team Count', 'Starters', 'Scoring Format', 'Platform', 'League Type'];

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
            display: true,
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
        const dataset = {};
        for (let i = 0; i < displayDays + 1; i++) {
            const today = new Date();
            today.setDate(today.getDate() - (displayDays - i));
            const formattedDate = today.getFullYear() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2);
            const dailyDataset = this.updateChartGrouping(formattedDate);
            this.lineChartLabels.push(today.toString().slice(4, 15));
            for (const [key, value] of Object.entries(dailyDataset)) {
                if (dataset[key] == null) {
                    dataset[key] = [];
                }
                dataset[key].push(value);
            }
        }
        for (const [key, value] of Object.entries(dataset)) {
            this.lineChartData.push({ data: (value as number[]).reverse(), label: key });
        }
        this.lineChartLabels.reverse();
        if (this.chart && this.chart.chart) {
            this.chart.chart.data.datasets = this.lineChartData;
            this.chart.chart.data.labels = this.lineChartLabels;
        }
    }

    /**
     * Handles the chart grouping logic
     * @param formattedDate string of date
     * @returns 
     */
    updateChartGrouping(formattedDate: string): {} {
        const groupValues = {};
        this.portfolioService.playersWithValue.forEach(player => {
            const playerData = this.portfolioService.fantasyPortfolioDict[player.name_id];
            const dayDataPoint = playerData?.find(it => it.date === formattedDate);
            if (dayDataPoint) {
                dayDataPoint.name_id = player.name_id;
                const sfTradeValue = this.playerService.getValueFromDataPoint(dayDataPoint, true);
                const stdTradeValue = this.playerService.getValueFromDataPoint(dayDataPoint, false);
                switch (this.selectedGrouping) {
                    case 'League Type':
                        for (let leagueId of this.portfolioService.playerHoldingMap[dayDataPoint.name_id].leagues) {
                            const league = this.portfolioService.leagueIdMap[leagueId];
                            if (groupValues[league.leagueType] == null) {
                                groupValues[league.leagueType] = 0;
                            }
                            groupValues[league.leagueType] += league.isSuperflex ? sfTradeValue : stdTradeValue;
                        }
                        return groupValues;
                    case 'League':
                        for (let leagueId of this.portfolioService.playerHoldingMap[dayDataPoint.name_id].leagues) {
                            const league = this.portfolioService.leagueIdMap[leagueId];
                            if (groupValues[league.name] == null) {
                                groupValues[league.name] = 0;
                            }
                            groupValues[league.name] += league.isSuperflex ? sfTradeValue : stdTradeValue;
                        }
                        return groupValues;
                    case 'Starters':
                        for (let leagueId of this.portfolioService.playerHoldingMap[dayDataPoint.name_id].leagues) {
                            const league = this.portfolioService.leagueIdMap[leagueId];
                            if (groupValues[league.startCount] == null) {
                                groupValues[league.startCount] = 0;
                            }
                            groupValues[league.startCount] += league.isSuperflex ? sfTradeValue : stdTradeValue;
                        }
                        return groupValues;
                    case 'Scoring Format':
                        for (let leagueId of this.portfolioService.playerHoldingMap[dayDataPoint.name_id].leagues) {
                            const league = this.portfolioService.leagueIdMap[leagueId];
                            if (groupValues[league.scoring] == null) {
                                groupValues[league.scoring] = 0;
                            }
                            groupValues[league.scoring] += league.isSuperflex ? sfTradeValue : stdTradeValue;
                        }
                        return groupValues;
                    case 'Team Count':
                        for (let leagueId of this.portfolioService.playerHoldingMap[dayDataPoint.name_id].leagues) {
                            const league = this.portfolioService.leagueIdMap[leagueId];
                            if (groupValues[league.rosters] == null) {
                                groupValues[league.rosters] = 0;
                            }
                            groupValues[league.rosters] += league.isSuperflex ? sfTradeValue : stdTradeValue;
                        }
                        return groupValues;
                    case 'QB Setting':
                        for (let leagueId of this.portfolioService.playerHoldingMap[dayDataPoint.name_id].leagues) {
                            const league = this.portfolioService.leagueIdMap[leagueId];
                            if (groupValues[league.isSuperflex] == null) {
                                groupValues[league.isSuperflex] = 0;
                            }
                            groupValues[league.isSuperflex] += league.isSuperflex === 'Superflex' ? sfTradeValue : stdTradeValue;
                        }
                        return groupValues;
                    case 'Platform':
                        for (let leagueId of this.portfolioService.playerHoldingMap[dayDataPoint.name_id].leagues) {
                            const league = this.portfolioService.leagueIdMap[leagueId];
                            if (groupValues[league.platformDisplay] == null) {
                                groupValues[league.platformDisplay] = 0;
                            }
                            groupValues[league.platformDisplay] += league.isSuperflex ? sfTradeValue : stdTradeValue;
                        }
                        return groupValues;
                    case 'Position':
                        if (groupValues[player.position] == null) {
                            groupValues[player.position] = 0;
                        }
                        groupValues[player.position] += this.calculateValueForPlayer(dayDataPoint);
                        return groupValues;
                    default:
                        if (groupValues['Total Value'] == null) {
                            groupValues['Total Value'] = 0;
                        }
                        groupValues['Total Value'] += this.calculateValueForPlayer(dayDataPoint);
                        return groupValues;
                }
            }
        });
        return groupValues;
    }

    /**
     * Wraps fantasy value logic for player
     * @param dayDataPoint data point
     * @returns 
     */
    private calculateValueForPlayer(dayDataPoint: FantasyPlayerDataPoint): number {
        const sfTradeValue = this.playerService.getValueFromDataPoint(dayDataPoint, true);
        const stdTradeValue = this.playerService.getValueFromDataPoint(dayDataPoint, false);
        return (this.portfolioService.playerHoldingMap[dayDataPoint.name_id]?.superflex || 0) * sfTradeValue
            + (this.portfolioService.playerHoldingMap[dayDataPoint.name_id]?.standard || 0) * stdTradeValue;
    }
}
