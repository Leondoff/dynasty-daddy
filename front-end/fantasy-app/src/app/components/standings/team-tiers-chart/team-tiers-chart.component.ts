import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {BaseChartDirective, Label} from 'ng2-charts';
import {ChartDataSets, ChartOptions} from 'chart.js';
import {Color} from 'chartjs-plugin-datalabels/types/options';
import {TeamPowerRanking, TeamRankingTier} from '../../model/powerRankings';
import { ComparisonColorPalette } from '../../services/color.service';

@Component({
  selector: 'app-team-tiers-chart',
  templateUrl: './team-tiers-chart.component.html',
  styleUrls: ['./team-tiers-chart.component.css']
})
export class TeamTiersChartComponent implements OnInit {

  /** transaction aggregate */
  @Input()
  teamPowerRankings: TeamPowerRanking[];

  /** chart object */
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  /**
   * ng2-chart options
   */
  public chartOptions: (ChartOptions & { annotation?: any }) = {
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
      intersect: false,
      mode: 'index'
    },
    title: {
      display: false
    },
    scales: {
      ticks: {
        min: 0,
      },
      xAxes: [{
        display: true,
        gridLines: {
          display: false
        },
        scaleLabel: {
          display: true,
          labelString: 'Tiers',
          fontColor: '#d3d3d3'
        }
      }],
      yAxes: [{
        ticks: {
          min: 0,
        },
        display: true,
        gridLines: {
          display: false
        },
        scaleLabel: {
          display: true,
          labelString: 'Number of Teams',
          fontColor: '#d3d3d3'
        }
      }]
    },
    plugins: {
      colorschemes: {
        scheme: ComparisonColorPalette,
        override: true
      }
    }
  };
  public chartLegend = false;
  public chartType = 'bar';
  public chartPlugins = [];
  public data: ChartDataSets[] = [];
  public dataLabels: Label[] = [];
  public chartColors: Color;

  constructor() {
  }

  ngOnInit(): void {
    this.generateDataSet();
  }

  /** generate chart dataset and format it */
  private generateDataSet(): void {
    this.data = [];
    this.dataLabels = [];
    const tiers = [];
    this.teamPowerRankings.map(team => {
      if (!tiers[team.tier.valueOf()]) {tiers[team.tier.valueOf()] = 0;}
      tiers[team.tier.valueOf()] += 1;
    });
    this.data.push({label: 'Teams', data: Object.entries(tiers).map(k => k[1]), hoverBackgroundColor: []});
    this.dataLabels = Object.entries(tiers).map(k => TeamRankingTier[k[0]].valueOf().replace(/_/g, ' '));
    if (this.chart && this.chart.chart) {
      this.chart.chart.data.datasets = this.data;
      this.chart.chart.data.labels = this.dataLabels;
      this.chart.chart.update();
    }
  }

}
