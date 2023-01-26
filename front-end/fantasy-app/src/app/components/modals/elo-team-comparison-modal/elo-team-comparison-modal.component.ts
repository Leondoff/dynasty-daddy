import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {ChartDataSets, ChartOptions} from 'chart.js';
import {BaseChartDirective, Label} from 'ng2-charts';
import {LeagueService} from '../../../services/league.service';
import {PowerRankingsService} from '../../services/power-rankings.service';
import {PlayerService} from '../../../services/player.service';
import {MatDialog} from '@angular/material/dialog';
import Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';
import { ComparisonColorPalette } from '../../services/color.service';

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
        id: 'x-axis-0',
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
        id: 'y-axis-0',
        display: true,
        gridLines: {
          display: false
        },
        scaleLabel: {
          display: true,
          labelString: 'Elo Adjusted ADP',
          fontColor: '#d3d3d3'
        }
      }],
    },
    annotation: {
      annotations: [
        {
          drawTime: 'afterDatasetsDraw',
          id: 'hline',
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          borderColor: 'orange',
          borderWidth: 2,
          label: {
            position: 'bottom',
            content: 'Playoffs',
            fontColor: 'orange',
            enabled: true,
            font: {
              weight: 'bold'
            }
          }
        }
      ],
    },
    plugins: {
      colorschemes: {
        scheme: ComparisonColorPalette,
        override: true
      }
    }
  };
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [ChartAnnotation];

  constructor(private leagueService: LeagueService,
              private playerService: PlayerService,
              private cdr: ChangeDetectorRef,
              private dialog: MatDialog,
              private powerRankingsService: PowerRankingsService) {
  }

  ngOnInit(): void {
    Chart.pluginService.register(ChartAnnotation);
  }

  ngAfterViewInit(): void {
    this.generateDataSets();
    this.cdr.detectChanges();
    this.chart.update();
  }

  /**
   * generate dataset for chart
   */
  generateDataSets(): void {
    this.lineChartData = [];
    this.lineChartLabels = [];
    // set playoff start annotation
    this.lineChartOptions.annotation.annotations[0].value = 'Week ' + this.leagueService.selectedLeague.playoffStartWeek;
    for (let i = this.leagueService.selectedLeague.startWeek; i < (this.leagueService.selectedLeague.season > '2020' ? 19 : 18); i++) {
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
