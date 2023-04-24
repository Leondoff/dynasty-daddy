import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FantasyMarket, FantasyPlayer } from '../../../model/assets/FantasyPlayer';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { BaseChartDirective, Label } from 'ng2-charts';
import { PlayerService } from '../../../services/player.service';
import { BaseComponent } from '../../base-component.abstract';
import { PlayerInsights } from '../../model/playerInsights';
import { LeagueService } from '../../../services/league.service';
import { variance } from 'simple-statistics';
import { ComparisonColorPalette } from '../../../services/utilities/color.service';

@Component({
  selector: 'app-player-details-weekly-stats-line-chart',
  templateUrl: './player-details-weekly-stats-line-chart.component.html',
  styleUrls: ['./player-details-weekly-stats-line-chart.component.css']
})
export class PlayerDetailsWeeklyStatsLineChartComponent extends BaseComponent implements OnInit, AfterViewInit {

  /** chart set up */
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  /** selected player data */
  @Input()
  selectedPlayer: FantasyPlayer;

  /** selected player insights */
  @Input()
  selectedPlayerInsights: PlayerInsights;

  @Input()
  selectedMarket: FantasyMarket = FantasyMarket.KeepTradeCut;

  @Input()
  playerProfile: any;

  /** total points aggregate */
  totalPoints = 0;

  /** total projected points */
  totalProj = 0;

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
          display: true,
          labelString: 'Week',
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
          display: true,
          labelString: 'Fantasy Points',
          fontColor: '#d3d3d3'
        }
      }],
    },
    plugins: {
      colorschemes: {
        scheme: ComparisonColorPalette,
        override: true
      }
    }
  };
  public lineChartLegend = false;
  public lineChartType = 'line';
  public lineChartPlugins = [];
  public adjacentADP = [];

  public adpPlayerValues = {}

  constructor(public playerService: PlayerService,
    public leagueService: LeagueService,
    private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    // do nothing
  }

  ngOnChanges(): void {
    this.generateDataSets();
    this.cachePlayerData();
  }

  ngAfterViewInit(): void {
    this.generateDataSets();
    this.addSubscriptions(this.playerService.currentPlayerValuesLoaded$.subscribe(() => {
      this.generateDataSets();
      this.cdr.detectChanges();
    }));
    if (!this.selectedPlayerInsights) {
      this.selectedPlayerInsights = this.playerService.getPlayerInsights(
        this.selectedPlayer,
        this.leagueService.selectedLeague?.isSuperflex || true
      );
    }
    this.cachePlayerData();
    this.cdr.detectChanges();
  }

  cachePlayerData(): void {
    this.adpPlayerValues = {};
    this.adjacentADP.forEach(player => {
      this.adpPlayerValues[player.name_id] = {
        value: (this.leagueService?.selectedLeague?.isSuperflex || true) ? player.sf_trade_value : player.trade_value,
        adpPlusMinus: this.getADPPlusMinus(player)
      }
    });
  }

  /**
   * generate dataset for chart
   */
  generateDataSets(): void {
    this.lineChartData = [];
    this.lineChartLabels = [];
    this.totalPoints = 0;
    this.totalProj = 0;
    const stats = [];
    const projections = [];
    const scoringFormat = this.leagueService.getLeagueScoringFormat();
    for (let i = 1; i < 19; i++) {
      const weekStats = this.playerService.pastSeasonWeeklyStats[i];
      const weekProj = this.playerService.pastSeasonWeeklyProjections[i];
      if (weekStats && weekProj) {
        const stat = weekStats[this.selectedPlayer.sleeper_id]?.[scoringFormat] || 0;
        const proj = weekProj[this.selectedPlayer.sleeper_id]?.[scoringFormat] || 0;
        this.totalPoints += stat;
        stats.push(stat);
        this.totalProj += proj;
        projections.push(proj);
        this.lineChartLabels.push(this.playerService.getWeekByIndex(i));
      }
    }
    this.lineChartData.push({ label: 'Actual', data: stats.reverse(), fill: true });
    this.lineChartData.push({ label: 'Projected', data: projections.reverse(), fill: false });
    this.lineChartLabels.reverse();
    if (this.chart && this.chart.chart) {
      this.chart.chart.data.datasets = this.lineChartData;
      this.chart.chart.data.labels = this.lineChartLabels;
    }
    this.adjacentADP = this.playerService.getAdjacentADPPlayersByNameId(this.selectedPlayer.name_id, this.selectedPlayer.position);
  }

  /**
   * Returns adp plus minus for a player
   * @param player player to get variance for
   */
  getADPPlusMinus(player: FantasyPlayer): number {
    const varianceValues = [];

    if (player.bb10_adp !== 0) {
      varianceValues.push(player.bb10_adp);
    }
    if (player.drafters_adp !== 0) {
      varianceValues.push(player.drafters_adp);
    }
    if (player.rtsports_adp !== 0) {
      varianceValues.push(player.rtsports_adp);
    }
    if (player.underdog_adp !== 0) {
      varianceValues.push(player.underdog_adp);
    }
    if (player.fantasypro_adp !== 0) {
      varianceValues.push(player.fantasypro_adp);
    }
    return Math.round(variance(varianceValues) / 2) || 0;
  }

  /**
   * calculate how player performed based on projected
   */
  generatePerformancePercent(): number {
    const percent = (this.totalPoints / this.totalProj) > 1
      ? (this.totalPoints / this.totalProj) - 1
      : 1 - (this.totalPoints / this.totalProj);
    return Math.round(percent * 10000) / 100;
  }

}
