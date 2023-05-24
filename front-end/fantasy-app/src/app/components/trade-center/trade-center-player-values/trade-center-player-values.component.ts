import { Component, OnInit, ViewChild, Input, OnChanges } from '@angular/core';
import { map } from 'rxjs/operators';
import { BaseChartDirective, Color } from 'ng2-charts';
import { BaseComponent } from "../../base-component.abstract";
import { FantasyMarket, FantasyPlayer } from "src/app/model/assets/FantasyPlayer";
import { FantasyPlayerApiService } from "src/app/services/api/fantasy-player-api.service";
import { ChartOptions } from 'chart.js';
import { ComparisonColorPalette } from '../../../services/utilities/color.service';
import { DisplayService } from 'src/app/services/utilities/display.service';
import { PlayerService } from 'src/app/services/player.service';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-trade-center-player-values',
  templateUrl: './trade-center-player-values.component.html',
  styleUrls: ['./trade-center-player-values.component.css']
})
export class TradeCenterPlayerValuesComponent extends BaseComponent implements OnInit, OnChanges {

  @Input()
  selectedMarket: FantasyMarket;

  @Input()
  selectedPlayers: FantasyPlayer[] = [];

  @Input()
  isSuperflex: boolean = true;

  playerValuesCache: {} = {}

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
        type: 'time',
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
          labelString: 'Trade Value',
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
    private fantasyPlayerApiService: FantasyPlayerApiService,
    private displayService: DisplayService,
    private playerService: PlayerService
  ) {
    super();
  }

  ngOnInit(): void {
    for (let i = 0; i < 41; i++) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - (41 - i));
      this.lineChartLabels.push(this.displayService.formatDateForDisplay(yesterday.toString()));
    }
    this.lineChartData = [];
    this.loadChart();
  }

  ngOnChanges(): void {
    this.loadChart();
  }

  private loadChart(): void {
    this.lineChartData = [];
    const observables = [];
    this.selectedPlayers.forEach(p => {
      if (p.name_id && !(p.name_id in this.playerValuesCache)) {
        observables.push(this.fantasyPlayerApiService.getHistoricalPlayerValueById(p.name_id).pipe(map((data) => {
          this.playerValuesCache[p.name_id] = data;
          return of(data)
        })))
      } else {
        observables.push(of(this.playerValuesCache[p.name_id]))
      }
    });
    forkJoin(observables).subscribe(() =>
      this.selectedPlayers.forEach(player => {
        const data = [];
        for (const dataPoint of this.playerValuesCache[player.name_id]) {
          if (this.lineChartLabels.includes(this.displayService.formatDateForDisplay(dataPoint.date))) {
            const index = this.lineChartLabels.indexOf(this.displayService.formatDateForDisplay(dataPoint.date));
            data[index] = this.playerService.getValueFromDataPoint(dataPoint, this.isSuperflex, this.selectedMarket);
          }
        }
        // dont update selected player data cause it's the source of truth
        this.lineChartData.push({ data, label: player.full_name, fill: false });
      })
      );
  }
}
