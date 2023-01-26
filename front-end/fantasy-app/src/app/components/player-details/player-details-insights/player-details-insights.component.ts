import { AfterViewInit, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FantasyMarket, FantasyPlayer, FantasyPlayerDataPoint } from '../../../model/assets/FantasyPlayer';
import { PlayerService } from '../../../services/player.service';
import { LeagueService } from '../../../services/league.service';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { BaseChartDirective, Label } from 'ng2-charts';
import { Router } from '@angular/router';
import { PlayerComparisonService } from '../../services/player-comparison.service';
import { LeagueSwitchService } from '../../services/league-switch.service';

@Component({
  selector: 'app-player-details-insights',
  templateUrl: './player-details-insights.component.html',
  styleUrls: ['./player-details-insights.component.css']
})
export class PlayerDetailsInsightsComponent implements OnInit, OnChanges, AfterViewInit {

  /** chart set up */
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  /** selected player info */
  @Input()
  selectedPlayer: FantasyPlayer;

  /** past month selected data points */
  @Input()
  selectedPlayerValues: FantasyPlayerDataPoint[];

  @Input()
  selectedMarket: FantasyMarket = FantasyMarket.KeepTradeCut;

  /** list of adjacent players overall */
  overallAdjPlayers: { rank: number, player: FantasyPlayer }[];

  /** list of adjacent players based on position */
  positionAdjPlayers: { rank: number, player: FantasyPlayer }[];

  /** display columns */
  displayedColumns: string[] = ['rank', 'name', 'value'];

  /** line chart data */
  public lineChartData: ChartDataSets[] = [];

  /** line chart labels */
  public lineChartLabels: Label[] = [];

  /** what display to filter values on */
  public isSuperflex: boolean = true;

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
        type: 'time',
        gridLines: {
          display: false
        },
        scaleLabel: {
          display: false,
          labelString: 'Days',
          fontColor: '#d3d3d3'
        }
      }],
      yAxes: [{
        display: true,
        gridLines: {
          display: false
        },
        scaleLabel: {
          display: false,
          labelString: 'Trade Value',
          fontColor: '#d3d3d3'
        }
      }],
    }
  };
  public lineChartLegend = false;
  public lineChartType = 'line';
  public lineChartPlugins = [];
  public chartColors: any[] = [];

  public playerCache = {};
  public adjOverallValues = {};
  public adjPosValues = {};

  constructor(
    public playerService: PlayerService,
    public leagueService: LeagueService,
    private playerComparisonService: PlayerComparisonService,
    private leagueSwitchService: LeagueSwitchService,
    private router: Router) {
  }

  ngAfterViewInit(): void {
    this.generateChartData();
  }

  ngOnInit(): void {
    this.isSuperflex = this.leagueService.selectedLeague ? this.leagueService.selectedLeague.isSuperflex : true;
    this.overallAdjPlayers = this.playerService.getAdjacentPlayersByNameId(
      this.selectedPlayer?.name_id, '', this.leagueService.selectedLeague?.isSuperflex, this.selectedMarket);
    this.positionAdjPlayers = this.playerService.getAdjacentPlayersByNameId(
      this.selectedPlayer?.name_id, this.selectedPlayer?.position, this.leagueService.selectedLeague?.isSuperflex, this.selectedMarket);
    this.cachePlayerData();
  }

  ngOnChanges(): void {
    this.generateChartData();
    this.overallAdjPlayers = this.playerService.getAdjacentPlayersByNameId(
      this.selectedPlayer?.name_id, '', this.leagueService.selectedLeague?.isSuperflex, this.selectedMarket);
    this.positionAdjPlayers = this.playerService.getAdjacentPlayersByNameId(
      this.selectedPlayer?.name_id, this.selectedPlayer?.position, this.leagueService.selectedLeague?.isSuperflex, this.selectedMarket);
    this.cachePlayerData();
  }

  /**
   * set up player cache data
   */
  cachePlayerData(): void {
    this.playerCache = {}
    this.playerCache = {
      value: this.playerService.getTradeValue(this.selectedPlayer, this.leagueService?.selectedLeague?.isSuperflex || true, this.selectedMarket),
      stdValue: this.playerService.getTradeValue(this.selectedPlayer, false, this.selectedMarket),
      change: this.playerService.getTradeValue(this.selectedPlayer, this.leagueService?.selectedLeague?.isSuperflex || true, this.selectedMarket, 'change'),
      allTimeHigh: this.playerService.getTradeValue(this.selectedPlayer, this.leagueService?.selectedLeague?.isSuperflex || true, this.selectedMarket, 'all_time_high'),
      allTimeLow: this.playerService.getTradeValue(this.selectedPlayer, this.leagueService?.selectedLeague?.isSuperflex || true, this.selectedMarket, 'all_time_low'),
      threeMonthHigh: this.playerService.getTradeValue(this.selectedPlayer, this.leagueService?.selectedLeague?.isSuperflex || true, this.selectedMarket, 'three_month_high'),
      threeMonthLow:this.playerService.getTradeValue(this.selectedPlayer, this.leagueService?.selectedLeague?.isSuperflex || true, this.selectedMarket, 'three_month_low')
    }
    this.adjOverallValues = {}
    this.overallAdjPlayers.forEach(player => {
      this.adjOverallValues[player.player.name_id] = {
        value: this.playerService.getTradeValue(player.player, this.leagueService?.selectedLeague?.isSuperflex || true, this.selectedMarket)
      }
    });
    this.adjPosValues = {}
    this.positionAdjPlayers.forEach(player => {
      this.adjPosValues[player.player.name_id] = {
        value: this.playerService.getTradeValue(player.player, this.leagueService?.selectedLeague?.isSuperflex || true, this.selectedMarket),
        rank: this.playerService.getTradeValue(player.player, this.leagueService?.selectedLeague?.isSuperflex || true, this.selectedMarket, 'rank'),
      }
    });
  }

  /**
   * generate chart data
   */
  generateChartData(): void {
    try {
      this.lineChartData = [];
      this.lineChartLabels = [];
      const dataList = [];
      if (this.selectedPlayerValues) {
        let dataPointInd = 1;
        for (let ind = 1; ind <= 40; ind++) {
          // date iterator value
          const dateLabel = new Date().getTime() - 1000 * 60 * 60 * 24 * (40 - ind);
          // check all found points and compare dates
          this.selectedPlayerValues.map(dataPoint => {
            if (new Date(new Date(dateLabel).setHours(0, 0, 0, 0)).getTime()
              === new Date(new Date(dataPoint.date).setHours(0, 0, 0, 0)).getTime()) {
              dataList.push(this.playerService.getTradeValue(dataPoint, this.leagueService.selectedLeague?.isSuperflex, this.selectedMarket) || 0);
              this.lineChartLabels.push(this.playerComparisonService.formatDateForDisplay(dataPoint.date));
              dataPointInd++;
            }
          });
          // if no point matches
          if (dataList.length < ind) {
            dataList.push(ind === 40 ? null : 0);
            this.lineChartLabels.push(this.playerComparisonService.formatDateForDisplay(
              new Date(new Date(dateLabel).setHours(0, 0, 0, 0)).toString()));
          }
        }
        // reverse data
        this.lineChartData.push({ label: this.selectedPlayer.full_name, data: dataList });
        this.lineChartLabels.reverse();
        if (dataList[dataList.length - 1] === null ?
          dataList[dataList.length - 2] > dataList[0]
          : dataList[dataList.length - 1] > dataList[0]) {
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
      }
      this.lineChartLabels.reverse();
      this.chart.chart.data.datasets = this.lineChartData;
      this.chart.chart.data.labels = this.lineChartLabels;
    } catch (e: any) {
      console.warn('No data points found for player: ' + e);
    }
  }

  /**
   * open up player comparison with selected player
   * @param selectedPlayer player data
   */
  openPlayerComparison(selectedPlayer: FantasyPlayer): void {
    this.playerComparisonService.addPlayerToCharts(selectedPlayer, false, this.selectedMarket);
    this.router.navigate(['players/comparison'],
      {
        queryParams: this.leagueSwitchService.buildQueryParams()
      }
    );
  }
}
