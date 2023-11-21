import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ChartOptions, ChartDataSets } from 'chart.js';
import { BaseChartDirective, Label } from 'ng2-charts';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { ComparisonColorPalette } from 'src/app/services/utilities/color.service';
import { PlayerService } from 'src/app/services/player.service';
import { LeagueService } from 'src/app/services/league.service';
import { DisplayService } from 'src/app/services/utilities/display.service';
import { LeagueFormatService } from '../../services/league-format.service';
import { Status } from '../../model/status';
import { tap, delay } from 'rxjs/operators';

@Component({
    selector: 'app-league-format-chart',
    templateUrl: './league-format-chart.component.html',
    styleUrls: ['./league-format-chart.component.scss']
})
export class LeagueFormatChartComponent implements OnInit {

    @Input()
    playerFormatDict = {};

    @Input()
    leagueFormat = [];

    @Input()
    metricName: string;

    datasets: FantasyPlayer[][] = [];

    metricDisplay = {
        'pts': 'Points',
        'ppg': 'Points Per Game',
        'worp': 'WoRP',
        'worppg': 'WoRP Per Game',
        'percent': 'Win %',
        'ppo': 'Pts. Per Opp',
        'opp': 'Fantasy Opp',
        'oppg': 'Opp Per Game',
        'snpP': 'Snap %',
        'pps': 'Points Per Snap',
        'snppg': 'Snaps Per Game',
        'spikeHigh': 'High Spike Weeks',
        'spikeMid': 'Mid Spike Weeks',
        'spikeLow': 'Low Spike Weeks',
        'spikeHighP': 'High Spike %',
        'spikeMidP': 'Mid Spike %',
        'spikeLowP': 'Low Spike %',
        'tradeValue': 'Fantasy Market'
    }

    percentMetrics = ['percent', 'spikeMidP', 'spikeLowP', 'spikeHighP', 'snpP'];

    /** chart set up */
    @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

    /** ng2-chart options */
    public lineChartOptions: (ChartOptions & { annotation?: any }) = {
        responsive: true,
        maintainAspectRatio: false,
        spanGaps: false,
        tooltips: {
            intersect: false,
            mode: 'nearest',
            position: 'nearest',
            axis: 'xy',
            callbacks: {
                title: function (context, data) {
                    let title = ''
                    context.forEach(con => {
                        if (title != '') {
                            title += '/'
                        }
                        title += data.datasets[con.datasetIndex].data[con.index]?.['player']?.full_name || 'Player'
                    })
                    return title;
                },
                afterLabel: function (context, data) {
                    return 'Pos Rank: ' + context?.label + '\nRank: ' + data.datasets[context.datasetIndex].data[context.index]?.['ovRank'];
                },
                label: (tooltipItem) => {
                    var label = `${this.metricDisplay[this.metricName]}: `;
                    if (this.percentMetrics.includes(this.metricName)) {
                        label += Math.round(tooltipItem.yLabel as number * 1000) / 10 + '%';
                    } else {
                        label += Math.round(tooltipItem.yLabel as number * 100) / 100;
                    }
                    return label;
                }
            }
        },
        scales: {
            xAxes: [{
                display: true,
                gridLines: {
                    display: false
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Position Rank',
                    fontColor: '#d3d3d3'
                }
            }],
            yAxes: [{
                display: true,
                gridLines: {
                    display: false
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Metric',
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

    public scatterChartOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        spanGaps: false,
        tooltips: {
            intersect: false,
            mode: 'nearest',
            position: 'nearest',
            axis: 'xy',
            callbacks: {
                title: function (context, data) {
                    let title = ''
                    context.forEach(con => {
                        if (title != '') {
                            title += '/'
                        }
                        title += data.datasets[con.datasetIndex].data[con.index]?.['player']?.full_name || 'Player';
                    })
                    return title;
                },
                afterLabel: function (context, data) {
                    const title = data.datasets[context.datasetIndex].data[context.index]?.['xDisplay'] || 'Metric';
                    const value: number = Number(context?.label);
                    let label = '';
                    if (title.includes('%')) {
                        label += Math.round(value * 1000) / 10 + '%';
                    } else {
                        label += Math.round(value * 100) / 100;
                    }
                    return `${title}: ${label}`;
                },
                label: (tooltipItem) => {
                    const metrics = this.metricName.split('/');
                    var label = `${this.metricDisplay[metrics[1]]}: `;
                    if (this.percentMetrics.includes(metrics[1])) {
                        label += Math.round(tooltipItem.yLabel as number * 1000) / 10 + '%';
                    } else {
                        label += Math.round(tooltipItem.yLabel as number * 100) / 100;
                    }
                    return label;
                }
            }
        },
        scales: {
            yAxes: [{
                gridLines: {
                    display: false
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Metric1',
                    fontColor: '#d3d3d3'
                }
            }],
            xAxes: [{
                gridLines: {
                    display: false
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Metric2',
                    fontColor: '#d3d3d3'
                }
            }],
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
    public chartType = 'line';
    public lineChartPlugins = [];
    public lineChartLabels: Label[] = [];
    public chartData: ChartDataSets[] = [];
    public chartOptions: ChartOptions;

    constructor(private playerService: PlayerService,
        private displayService: DisplayService,
        private leagueFormatService: LeagueFormatService,
        private leagueService: LeagueService) {

    }

    ngOnInit(): void {
        this.metricDisplay['tradeValue'] =
            this.displayService.getDisplayNameForFantasyMarket(this.playerService.selectedMarket);
        this.rehyrdateDisplay();
        this.leagueFormatService.leagueFormatPlayerUpdated$
            .subscribe(_ => {
                this.metricDisplay['tradeValue'] =
                    this.displayService.getDisplayNameForFantasyMarket(this.playerService.selectedMarket);
                this.rehyrdateDisplay();
                this.chart?.update()
            });
    }

    private rehyrdateDisplay(): void {
        if (this.metricName.includes('/')) {
            this.chartType = 'scatter';
            this.updateScatterChart();
            this.chartOptions = this.scatterChartOptions;
        } else {
            this.chartType = 'line';
            this.updateChart();
            this.chartOptions = this.lineChartOptions;
        }
    }

    private getMetric(nameId: string, metricName: string = this.metricName): number {
        const playerFormat = this.playerFormatDict[nameId];
        switch (metricName) {
            case 'worppg':
                return Math.round(playerFormat?.w?.worp / playerFormat?.c?.week * 10000) / 10000;
            case 'spikeHighP':
                return playerFormat?.c?.spikeHigh / playerFormat?.c?.week;
            case 'spikeMidP':
                return playerFormat?.c?.spikeMid / playerFormat?.c?.week;
            case 'spikeLowP':
                return playerFormat?.c?.spikeLow / playerFormat?.c?.week;
            case 'ppo':
                return playerFormat?.c?.opp != 0 ?
                    playerFormat?.c?.pts / playerFormat?.c?.opp : 0;
            case 'oppg':
                return playerFormat?.c?.week != 0 ?
                    playerFormat?.c?.opp / playerFormat?.c?.week : 0;
            case 'ppg':
                return playerFormat?.c?.week != 0 ?
                    playerFormat?.c?.pts / playerFormat?.c?.week : 0;
            case 'snpP':
                return playerFormat?.c?.snp /
                    playerFormat?.c?.tmSnp;
            case 'pps':
                return playerFormat?.c?.snp != 0 ? playerFormat?.c?.pts /
                    playerFormat?.c?.snp : 0;
            case 'snppg':
                return playerFormat?.c?.week != 0 ?
                    playerFormat?.c?.snp / playerFormat?.c?.week : 0;
            case 'worp':
            case 'percent':
                return playerFormat?.w?.[metricName] || 0;
            case 'tradeValue':
                const player = this.playerService.playerValues.find(p => p.name_id === nameId);
                return this.leagueService.selectedLeague.isSuperflex ? player.sf_trade_value : player.trade_value;
            default:
                return playerFormat?.c?.[metricName] || 0;
        }
    }

    private updateChart(): void {
        this.datasets = [];
        this.chartData = [];
        const playerList = this.playerService.playerValues?.filter(p => p.position != 'PI'
            && this.playerFormatDict[p.name_id]?.c)
            .sort((a, b) => (this.getMetric(b.name_id) || 0) - (this.getMetric(a.name_id) || 0)) || [];
        this.leagueFormat.forEach(pos => {
            const data = [];
            const posPlayers = playerList.filter(p => p.position === pos)
            this.datasets.push(posPlayers);
            for (let i = 0; i < (posPlayers.length > 50 ? 50 : posPlayers.length); i++) {
                data.push({
                    y: this.getMetric(posPlayers[i]?.name_id) || 0,
                    player: posPlayers[i],
                    ovRank: playerList.findIndex(p => p?.name_id === posPlayers[i]?.name_id) + 1
                })
            }
            this.chartData.push({ data, label: pos, fill: false });
        });
        this.lineChartLabels = [];
        for (let i = 0; i < 50; i++) {
            this.lineChartLabels.push(`${i + 1}`)
        }
        this.lineChartOptions.scales.yAxes[0].scaleLabel.labelString = this.metricDisplay[this.metricName];
        if (this.chart && this.chart.chart) {
            this.chart.chart.data.datasets = this.chartData;
            this.chart.chart.data.labels = this.lineChartLabels;
        }
    }

    private updateScatterChart(): void {
        const metrics = this.metricName.split('/');
        this.chartData = [];
        this.datasets = [];
        this.leagueFormat.forEach(pos => {
            const posPlayers = this.playerService.playerValues?.filter(p =>
                p.position === pos).filter(p =>
                    this.getMetric(p.name_id, metrics[0]) && this.getMetric(p.name_id, metrics[0])
                );
            // only include position group if the stat exists for them
            if (posPlayers.length > 0) {
                this.datasets.push(posPlayers);
                const playerData = posPlayers
                    .map(player => {
                        return {
                            x: this.getMetric(player.name_id, metrics[0]) || 0,
                            y: this.getMetric(player.name_id, metrics[1]) || 0,
                            xDisplay: this.metricDisplay[metrics[0]],
                            yDisplay: this.metricDisplay[metrics[1]],
                            player: player
                        };
                    }).sort((a, b) => b.x - a.x).slice(0, 50);
                this.chartData.push({
                    data: playerData,
                    label: pos,
                    pointRadius: 3
                });
            }
        });
        this.scatterChartOptions.scales.xAxes[0].scaleLabel.labelString = this.metricDisplay[metrics[0]];
        this.scatterChartOptions.scales.yAxes[0].scaleLabel.labelString = this.metricDisplay[metrics[1]];
        if (this.chart && this.chart.chart) {
            this.chart.chart.data.datasets = this.chartData;
            this.chart.chart.data.labels = this.lineChartLabels;
        }
    }

}