import { Component, OnInit, OnChanges, Input, ViewChild } from '@angular/core';
import { ChartOptions, ChartDataSets } from 'chart.js';
import { BaseChartDirective, Label } from 'ng2-charts';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { ComparisonColorPalette } from 'src/app/services/utilities/color.service';
import { LeagueFormatService } from '../../services/league-format.service';
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

    datasets: FantasyPlayer[][] = [];

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
                title: function(context, data) {
                    let title = ''
                    context.forEach(con => {
                        if (title != '') {
                            title += '/'
                        }
                        title += data.datasets[con.datasetIndex].data[con.index]?.['player']?.full_name || 'Player WoRP'
                    })
                    return title;
                },
                afterLabel: function(context, data) {
                    return  'Pos Rank: ' + context?.label + '\nRank: ' + data.datasets[context.datasetIndex].data[context.index]?.['ovRank'];
                },
                label: function(tooltipItem) {
                    var label = 'WoRP: ';                    
                    label += Math.round(tooltipItem.yLabel as number * 100) / 100;
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
                    labelString: 'WoRP',
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


    constructor(private leagueFormatService: LeagueFormatService,
        private playerService: PlayerService) {

    }

    ngOnInit(): void {
        this.updateChart();
    }

    ngOnChanges(): void {

    }

    private updateChart(): void {
        this.datasets = [];
        const worpPlayers = this.playerService.playerValues.filter(p => p.position != 'PI'
            && !this.playerFormatDict[this.leagueFormatService.selectedSeason]?.[p.name_id].c)
            .sort((a, b) => this.playerFormatDict[b.name_id]?.w?.worp - this.playerFormatDict[a.name_id]?.w?.worp)
        this.lineChartData = [];
        this.leagueFormat.forEach(pos => {
            const data = [];
            const posPlayers = worpPlayers.filter(p => p.position === pos)
            this.datasets.push(posPlayers);
            for (let i = 0; i < 50; i++) {
                data.push({y: this.playerFormatDict[posPlayers[i]?.name_id]?.w?.worp || 0,
                    player: posPlayers[i],
                    ovRank: worpPlayers.findIndex(p => p?.name_id === posPlayers[i]?.name_id) + 1})
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