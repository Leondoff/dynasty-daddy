import { Component, OnInit, AfterViewInit, Input, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges } from "@angular/core";
import { BaseComponent } from "../../base-component.abstract";
import { FantasyPlayerApiService } from "src/app/services/api/fantasy-player-api.service";
import { DraftService, MockDraftPlayerType } from "../../services/draft.service";
import { FantasyPlayer } from "src/app/model/assets/FantasyPlayer";
import { ColorService, ComparisonColorPalette } from "src/app/services/utilities/color.service";
import { ChartDataSets, ChartOptions } from "chart.js";
import { BaseChartDirective, Label } from "ng2-charts";
import { DisplayService } from "src/app/services/utilities/display.service";
import { MatDialog } from "@angular/material/dialog";
import { EditDraftADPModalComponent } from "../../modals/edit-draft-adp-modal/edit-draft-adp-modal.component";
import { ConfigService } from "src/app/services/init/config.service";
import { switchMap } from "rxjs/operators";
import { LeagueService } from "src/app/services/league.service";

@Component({
    selector: 'player-details-adp',
    templateUrl: './player-details-adp.component.html',
    styleUrls: ['./player-details-adp.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerDetailsADPComponent extends BaseComponent implements OnInit, OnChanges {

    @Input()
    selectedPlayer: FantasyPlayer;

    @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

    /** is page insights in superflex or standard */
    @Input()
    isSuperflex: boolean = true;

    playerDataPoints: any[] = [];

    public chartLegend = false;
    public chartType = 'scatter';
    public chartPlugins = [];
    public chartLabels: Label[] = [];
    public chartData: ChartDataSets[] = [];
    public chartOptions: ChartOptions = {
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
                        const isAuction = data.datasets[con.datasetIndex].data[con.index]?.['isAuction'] || false;
                        if (isAuction) {
                            const pick = data.datasets[con.datasetIndex].data[con.index]?.['y'] || '??'
                            const amount = data.datasets[con.datasetIndex].data[con.index]?.['data']?.['auction_amount'] || '-'
                            title = `${pick}% of budget ($${amount})`;
                        } else {
                            const pick = data.datasets[con.datasetIndex].data[con.index]?.['y'] || '??'
                            title = `Pick ${pick}`;
                        }
                    })
                    return title;
                },
                label: (tooltipItem) => {
                    return this.displayService.formatDateForDisplay(tooltipItem.label);
                },
                afterLabel: function (context, data) {
                    const league = data.datasets[context.datasetIndex].data[context.index]?.['data'];
                    const tms = league.teams;
                    const sts = league.starters;
                    const ppr = data.datasets[context.datasetIndex].data[context.index]?.['ppr']
                    const qb = data.datasets[context.datasetIndex].data[context.index]?.['isSuperflex'] ? 'SF' : '1 QB'
                    let tepStr = ''
                    if (league.tep > 0)
                        tepStr = `\n${league.tep} TEP`
                    return `${tms} Team ${qb}\nStart ${sts}\n${ppr} PPR${tepStr}`;
                },
            },
        },
        scales: {
            yAxes: [{
                ticks: {
                    reverse: true
                },
                gridLines: {
                    display: false
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Draft Pick',
                    fontColor: '#d3d3d3'
                }
            }],
            xAxes: [{
                type: 'time',
                gridLines: {
                    display: false
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Date',
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

    draftboard: {}[][] = [];

    probGradient: {} = {};

    constructor(
        private draftService: DraftService,
        private displayService: DisplayService,
        private dialog: MatDialog,
        private colorService: ColorService,
        private leagueService: LeagueService,
        public configService: ConfigService,
        private cdr: ChangeDetectorRef,
        private fantasyPlayerApiService: FantasyPlayerApiService) {
        super();
    }

    ngOnInit(): void {
        this.addSubscriptions(this.draftService.updatePlayerADPDetails$.pipe(
            switchMap(sleeperId => this.fantasyPlayerApiService.searchDraftADPDetails(
                sleeperId,
                this.draftService.mockDraftPlayerType,
                this.isSuperflex,
                this.draftService.adpStartersFormat.value,
                this.draftService.adpTeamFormat.value,
                this.draftService.adpLeagueTypeFormat,
                this.draftService.adpScoringFormat.value,
                this.draftService.adpTepFormat.value,
                false,
                this.draftService.isAuction,
                this.draftService.adpStartedAt
            ))
        ).subscribe(
            res => {
                this.playerDataPoints = res;
                this.updateScatterChart();
                this.setDraftboard();
                this.cdr.markForCheck();
            }
        )
        )
        this.draftService.updatePlayerADPDetails$.next(this.selectedPlayer.sleeper_id);
        this.probGradient = this.colorService.getProbGradient();
    }

    ngOnChanges(): void {
        this.draftService.isSuperflex = this.isSuperflex;
        this.draftService.updatePlayerADPDetails$.next(this.selectedPlayer.sleeper_id);
    }

    openFilterDialog(): void {
        this.dialog.open(EditDraftADPModalComponent
            , {
                minHeight: '200px',
                minWidth: this.configService.isMobile ? '300px' : '500px',
                data: {
                    sleeperId: this.selectedPlayer.sleeper_id
                }
            }
        );
    }

    private setDraftboard(): void {
        const draftboard = []
        let tms = 12;
        if (this.draftService.isAuction) {
            tms = 10;
            for (let i = 0; i < 100; i++) {
                let isPicked = 0;
                this.playerDataPoints.forEach(p => {
                    if (i + 1 > Math.round(p.budget_ratio * 100))
                        isPicked++;
                });
                const percent = 1 - (isPicked / this.playerDataPoints.length)
                draftboard.push({ pick: (i+1) + '%', percent, color: Math.round(percent * 100) })
            }
        } else {
            const rds = this.draftService.mockDraftPlayerType == MockDraftPlayerType.Rookies ? 5 : 24;
            const tms = this.leagueService.selectedLeague ? this.leagueService.selectedLeague?.totalRosters || 12 : 12;
            for (let i = 0; i < (rds * tms); i++) {
                let isPicked = 0;
                this.playerDataPoints.forEach(p => {
                    if (i + 1 > p.pick_no)
                        isPicked++;
                });
                const percent = 1 - (isPicked / this.playerDataPoints.length)
                draftboard.push({ pick: this.displayService.createPickString(Math.trunc(i / tms) + 1, i % tms + 1), percent, color: Math.round(percent * 100) })
            }
        }
        const groupedDraftboard = [];
        for (let i = 0; i < draftboard.length; i += tms) {
            groupedDraftboard.push(draftboard.slice(i, i + tms));
        }
        this.draftboard = groupedDraftboard;
    }

    private updateScatterChart(): void {
        this.chartData = [];
        const playerData = this.playerDataPoints
            .map(player => {
                return {
                    x: player.ended_at,
                    y: this.draftService.isAuction ? Math.round(player.budget_ratio * 10000) / 100 : player.pick_no,
                    xDisplay: 'Date',
                    yDisplay: 'Pick Number',
                    isAuction: this.draftService.isAuction,
                    ppr: this.displayService.getPPRFormatDisplay(player.ppr),
                    isSuperflex: this.draftService.isSuperflex,
                    data: player
                };
            });
        this.chartLabels = []
        let lastMonth = new Date(this.draftService.adpStartedAt);
        if (lastMonth === null) {
            lastMonth.setMonth(lastMonth.getMonth() - 1);
        }
        const startedAt = lastMonth;
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 1)
        for (let date = startedAt; date <= currentDate; date.setDate(date.getDate() + 1)) {
            this.chartLabels.push(this.displayService.formatDateForDisplay(date.toString()));
        }
        this.chartData.push({
            data: playerData,
            label: 'Pick Number',
            pointRadius: 4
        });
        if (this.chart && this.chart.chart) {
            this.chart.chart.data.datasets = this.chartData;
            this.chart.chart.data.labels = this.chartLabels;
        }
    }
}