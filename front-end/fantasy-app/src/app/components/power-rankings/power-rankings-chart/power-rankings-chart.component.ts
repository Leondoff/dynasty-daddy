import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { BaseChartDirective, Label } from 'ng2-charts';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { LeagueService } from '../../../services/league.service';
import { ConfigService } from '../../../services/init/config.service';
import { TeamPowerRanking } from '../../model/powerRankings';
import { LeagueType } from "../../../model/league/LeagueDTO";
import { FantasyMarket } from 'src/app/model/assets/FantasyPlayer';
import { BarChartColorPalette } from '../../../services/utilities/color.service';

@Component({
  selector: 'app-power-rankings-chart',
  templateUrl: './power-rankings-chart.component.html',
  styleUrls: ['./power-rankings-chart.component.css']
})
export class PowerRankingsChartComponent implements OnInit, OnChanges {

  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  @Input()
  powerRankings: TeamPowerRanking[];

  @Input()
  selectedOrder: PowerRankingOrder = PowerRankingOrder.OVERALL;

  @Input()
  selectedMarket: FantasyMarket = FantasyMarket.KeepTradeCut;

  /**
   * ng2-chart options
   */
  public lineChartOptions: (ChartOptions & { annotation?: any }) = {
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
      intersect: false,
      mode: 'index'
    },
    title: {
      text: 'Overall Team Value'
    },
    scales: {
      xAxes: [{
        display: true,
        stacked: true,
        gridLines: {
          display: false
        },
        scaleLabel: {
          display: !this.configService.isMobile,
          labelString: 'Team',
          fontColor: '#d3d3d3'
        }
      }],
      yAxes: [{
        display: true,
        stacked: true,
        gridLines: {
          display: false
        },
        scaleLabel: {
          display: true,
          labelString: 'Overall Trade Value',
          fontColor: '#d3d3d3'
        }
      }]
    },
    legend: {
      position: this.configService.isMobile ? 'bottom' : 'left',
      labels: {
        fontColor: '#d3d3d3'
      },
      reverse: true,
    },
    plugins: {
      colorschemes: {
        scheme: BarChartColorPalette,
        override: true
      }
    }
  };
  public lineChartLegend = true;
  public lineChartType = 'bar';
  public lineChartPlugins = [];
  data: ChartDataSets[] = [];
  dataLabels: Label[] = [];

  constructor(private leagueService: LeagueService,
    public configService: ConfigService) {
  }

  ngOnInit(): void {
    this.refreshChart();
  }

  ngOnChanges(): void {
    this.refreshChart();
  }

  /**
   * refreshes chart labels, order and data
   */
  refreshChart(): void {
    this.dataLabels = [];
    this.powerRankings.sort((a, b) => {
      switch (this.selectedOrder) {
        case PowerRankingOrder.ELO_STARTER:
          return b.eloAdpValueStarter - a.eloAdpValueStarter;
        case PowerRankingOrder.QB_RANK:
          return a.roster[0].rank - b.roster[0].rank;
        case PowerRankingOrder.RB_RANK:
          return a.roster[1].rank - b.roster[1].rank;
        case PowerRankingOrder.WR_RANK:
          return a.roster[2].rank - b.roster[2].rank;
        case PowerRankingOrder.TE_RANK:
          return a.roster[3].rank - b.roster[3].rank;
        case PowerRankingOrder.PICK_RANK:
          return a.picks.rank - b.picks.rank;
        case PowerRankingOrder.STARTER:
          return b.adpValueStarter - a.adpValueStarter;
        default:
          return !this.leagueService.selectedLeague?.isSuperflex ?
            b.tradeValueOverall - a.tradeValueOverall :
            b.sfTradeValueOverall - a.sfTradeValueOverall;
      }
    });
    for (const team of this.powerRankings) {
      this.dataLabels.push(team.team.owner?.ownerName);
    }
    this.refreshChartData();
  }

  /**
   * refreshes table with team rankings
   * @private
   */
  private refreshChartData(): void {
    const positionGroups = ['QB', 'RB', 'WR', 'TE'];
    positionGroups.map((pos, index) => {
      const temp = [];
      for (const team of this.powerRankings) {
        const rosterInd = this.dataLabels.indexOf(team.team.owner?.ownerName);
        !this.leagueService.selectedLeague.isSuperflex ?
          temp[rosterInd] = team.roster[index].tradeValue :
          temp[rosterInd] = team.roster[index].sfTradeValue;
        this.data[index] = { data: temp, label: pos, hoverBackgroundColor: [] };
      }
    });
    if (this.leagueService.selectedLeague.type === LeagueType.DYNASTY) {
      const tempPicks = [];
      for (const team of this.powerRankings) {
        const index = this.dataLabels.indexOf(team.team.owner?.ownerName);
        !this.leagueService.selectedLeague?.isSuperflex ?
          tempPicks[index] = team.picks.tradeValue :
          tempPicks[index] = team.picks.sfTradeValue;
        this.data[4] = { data: tempPicks, label: 'Draft Capital', hoverBackgroundColor: [] };
      }
    }
  }
}

export enum PowerRankingOrder {
  OVERALL,
  STARTER,
  ELO_STARTER,
  QB_RANK,
  RB_RANK,
  WR_RANK,
  TE_RANK,
  PICK_RANK
}