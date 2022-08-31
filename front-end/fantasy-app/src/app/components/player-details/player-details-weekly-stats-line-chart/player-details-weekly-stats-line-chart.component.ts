import {AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {KTCPlayer} from '../../../model/KTCPlayer';
import {ChartDataSets, ChartOptions} from 'chart.js';
import 'chartjs-plugin-colorschemes/src/plugins/plugin.colorschemes';
import {ClassicColorBlind10} from 'chartjs-plugin-colorschemes/src/colorschemes/colorschemes.tableau';
import {BaseChartDirective, Label} from 'ng2-charts';
import {PlayerService} from '../../../services/player.service';
import {BaseComponent} from '../../base-component.abstract';
import {PlayerInsights} from '../../model/playerInsights';
import {SleeperService} from '../../../services/sleeper.service';
import {variance} from 'simple-statistics';

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
  selectedPlayer: KTCPlayer;

  /** selected player insights */
  @Input()
  selectedPlayerInsights: PlayerInsights;

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
          display: true
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
          display: true
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
        scheme: ClassicColorBlind10,
        override: true
      }
    }
  };
  public lineChartLegend = false;
  public lineChartType = 'line';
  public lineChartPlugins = [];
  public adjacentADP = [];

  constructor(public playerService: PlayerService,
              public sleeperService: SleeperService,
              private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    // do nothing
  }

  ngAfterViewInit(): void {
    this.generateDataSets();
    this.addSubscriptions(this.playerService.$currentPlayerValuesLoaded.subscribe(() => {
      this.generateDataSets();
      this.cdr.detectChanges();
    }));
    if (!this.selectedPlayerInsights) {
      this.selectedPlayerInsights = this.playerService.getPlayerInsights(
        this.selectedPlayer,
        this.sleeperService.selectedLeague?.isSuperflex || true
      );
    }
    this.cdr.detectChanges();
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
    for (let i = 1; i < 19; i++) {
      const weekStats = this.playerService.pastSeasonWeeklyStats[i];
      const weekProj = this.playerService.pastSeasonWeeklyProjections[i];
      if (weekStats && weekProj) {
        const stat = weekStats[this.selectedPlayer.sleeper_id]?.pts_half_ppr || 0;
        const proj = weekProj[this.selectedPlayer.sleeper_id]?.pts_half_ppr || 0;
        this.totalPoints += stat;
        stats.push(stat);
        this.totalProj += proj;
        projections.push(proj);
        this.lineChartLabels.push(this.playerService.getWeekByIndex(i));
      }
    }
    this.lineChartData.push({label: 'Actual', data: stats.reverse()});
    this.lineChartData.push({label: 'Projected', data: projections.reverse()});
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
  getADPPlusMinus(player: KTCPlayer): number {
    const varianceValues = [];

    if (player.bb10_adp) { varianceValues.push(player.bb10_adp); }
    if (player.drafters_adp) { varianceValues.push(player.drafters_adp); }
    if (player.rtsports_adp) { varianceValues.push(player.rtsports_adp); }
    if (player.underdog_adp) { varianceValues.push(player.underdog_adp); }
    if (player.fantasypro_adp) { varianceValues.push(player.fantasypro_adp); }

    return Math.round(variance(varianceValues)) / 2;
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
