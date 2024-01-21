import { Component, OnInit, OnChanges, Input, ViewChild } from "@angular/core";
import { BaseComponent } from "../../base-component.abstract";
import { FantasyPlayer } from "src/app/model/assets/FantasyPlayer";
import { Color } from "chartjs-plugin-datalabels/types/options";
import { ComparisonColorPalette } from "src/app/services/utilities/color.service";
import { ChartOptions } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { forkJoin, of } from "rxjs";
import { FantasyPlayerApiService } from "src/app/services/api/fantasy-player-api.service";
import { map } from "rxjs/operators";
import { LeagueSwitchService } from "../../services/league-switch.service";

@Component({
    selector: 'app-trade-center-player-demand',
    templateUrl: './trade-center-player-demand.component.html',
    styleUrls: ['./trade-center-player-demand.component.scss']
})
export class TradeCenterPlayerDemandComponent extends BaseComponent implements OnInit, OnChanges {

    @Input()
    selectedPlayers: FantasyPlayer[] = [];

    playerDemandCache: {} = {}

    /** chart set up */
    @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

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
                    labelString: 'Completed Trades',
                    fontColor: '#d3d3d3'
                }
            }]
        },
        legend: {
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
    public lineChartData = [];
    public lineChartLabels = [];
    public chartColors: Color;

    constructor(
        public leagueSwitchService: LeagueSwitchService,
        private fantasyPlayerApiService: FantasyPlayerApiService
    ) {
        super();
    }

    ngOnInit(): void {
        for (let ind = 1; ind <= 8; ind++) {
            this.lineChartLabels.push(ind === 1 ? 'Past 7 Days' : `${(ind - 1) * 7}-${ind * 7} Days Ago`);
        }
        this.lineChartLabels.reverse();
        this.lineChartData = [];
    }

    ngOnChanges(): void {
        this.loadChart();
    }

    private loadChart(): void {
        this.lineChartData = [];
        const observables = [];
        const playersToFetch = this.selectedPlayers.filter(p => p.position !== 'PI');
        playersToFetch
            .forEach(p => {
                if (p.name_id && !(p.name_id in this.playerDemandCache)) {
                    observables.push(this.fantasyPlayerApiService.getPlayerTradeDataById(p.name_id).pipe(map((data) => {
                        this.playerDemandCache[p.name_id] = data["mat_vw_trade_agg"];
                        return of(data)
                    })))
                } else {
                    observables.push(of(this.playerDemandCache[p.name_id]))
                }
            });
        forkJoin(observables).subscribe(() =>
            playersToFetch
                .forEach(player => {
                    const data = [];
                    this.playerDemandCache[player.name_id]
                        .sort((a, b) => a.week_interval - b.week_interval)
                        .forEach(point => {
                            data.push(point?.count || 0);
                        });
                    this.lineChartData.push({ data: data.reverse(), label: player.full_name, fill: false });
                    this.lineChartData = this.lineChartData.filter(d => d.label);
                })
        );
    }
}