import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { ChartOptions, ChartDataSets } from 'chart.js';
import { BaseChartDirective, Label } from 'ng2-charts';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { ComparisonColorPalette } from 'src/app/services/utilities/color.service';
import { PlayerService } from 'src/app/services/player.service';

@Component({
    selector: 'app-league-format-chart',
    templateUrl: './league-format-chart.component.html',
    styleUrls: ['./league-format-chart.component.scss']
})
export class LeagueFormatChartComponent implements OnInit, OnChanges {

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
    public lineChartLegend = true;
    public lineChartType = 'line';
    public lineChartPlugins = [];
    public lineChartLabels: Label[] = [];
    public lineChartData: ChartDataSets[] = [];

    worpPlayers: FantasyPlayer[] = [];


    constructor(private playerService: PlayerService) {

    }

    ngOnInit(): void {
        this.lineChartOptions.scales.yAxes[0].scaleLabel.labelString = this.metricDisplay[this.metricName];
        this.updateChart();
    }

    ngOnChanges(): void {

    }

    private getMetric(nameId: string): number {
        const playerFormat = this.playerFormatDict[nameId];
        switch (this.metricName) {
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
                return playerFormat?.w?.[this.metricName] || 0;
            default:
                return playerFormat?.c?.[this.metricName] || 0;
        }
    }

    private updateChart(): void {
        this.datasets = [];
        const playerList = this.playerService.playerValues.filter(p => p.position != 'PI'
            && this.playerFormatDict[p.name_id]?.c)
            .sort((a, b) => (this.getMetric(b.name_id) || 0) - (this.getMetric(a.name_id) || 0));
        this.lineChartData = [];
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
            this.lineChartData.push({ data, label: pos, fill: false });
        });
        this.lineChartLabels = [];
        for (let i = 0; i < 50; i++) {
            this.lineChartLabels.push(`${i + 1}`)
        }
        if (this.chart && this.chart.chart) {
            this.chart.chart.data.datasets = this.lineChartData;
            this.chart.chart.data.labels = this.lineChartLabels;
        }
    }

}