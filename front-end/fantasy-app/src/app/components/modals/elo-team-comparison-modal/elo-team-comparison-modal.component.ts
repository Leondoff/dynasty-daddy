import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions} from 'chart.js';
import {BaseChartDirective, Label} from 'ng2-charts';
import 'chartjs-plugin-colorschemes/src/plugins/plugin.colorschemes';
import {ClassicColorBlind10} from 'chartjs-plugin-colorschemes/src/colorschemes/colorschemes.tableau';
import {LeagueService} from "../../../services/league.service";
import {PowerRankingsService} from "../../services/power-rankings.service";
import {PlayerService} from "../../../services/player.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-elo-team-comparison-modal',
  templateUrl: './elo-team-comparison-modal.component.html',
  styleUrls: ['./elo-team-comparison-modal.component.css']
})
export class EloTeamComparisonModalComponent implements OnInit, AfterViewInit {

  /** chart set up */
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  /** line chart data */
  public lineChartData: ChartDataSets[] = [];

  /** line chart labels */
  public lineChartLabels: Label[] = [];

  /** line chart options */
  public lineChartOptions: (ChartOptions & { annotation?: any }) = {
    responsive: true,
    maintainAspectRatio: true,
    legend: {
      position: 'bottom'
    },
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
        display: true,
        gridLines: {
          display: true
        },
        scaleLabel: {
          display: true,
          labelString: 'Elo Adjusted ADP',
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
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [];

  constructor(private leagueService: LeagueService,
              private playerService: PlayerService,
              private cdr: ChangeDetectorRef,
              private dialog: MatDialog,
              private powerRankingsService: PowerRankingsService) {
  }

  ngOnInit(): void {
    // do nothing
  }

  ngAfterViewInit(): void {
    this.generateDataSets();
    this.cdr.detectChanges();
  }

  /**
   * generate dataset for chart
   */
  generateDataSets(): void {
    this.lineChartData = [];
    this.lineChartLabels = [];
    for (let i = this.leagueService.selectedLeague.startWeek; i < this.leagueService.selectedLeague.playoffStartWeek; i++) {
      this.lineChartLabels.push('Week ' + i);
    }
    this.powerRankingsService.powerRankings.sort((a, b) => b.eloAdpValueStarter - a.eloAdpValueStarter).forEach(team => {
      this.lineChartData.push({label: team.team.owner.teamName, data: team.eloADPValueStarterHistory, fill: false});
    });
    if (this.chart && this.chart.chart) {
      this.chart.chart.data.datasets = this.lineChartData;
      this.chart.chart.data.labels = this.lineChartLabels;
    }
  }

  /**
   * close dialog
   */
  closeDialog(): void {
    this.dialog.closeAll();
  }
}
