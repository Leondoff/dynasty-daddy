import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FantasyPlayer } from '../../../model/assets/FantasyPlayer';
import { PlayerService } from '../../../services/player.service';
import { LeagueService } from '../../../services/league.service';
import { ChartConfiguration, ChartDataSets, ChartType } from 'chart.js';
import { ComparisonColorPalette } from '../../../services/utilities/color.service';

@Component({
  selector: 'app-player-details-profile',
  templateUrl: './player-details-profile.component.html',
  styleUrls: ['./player-details-profile.component.css']
})
export class PlayerDetailsProfileComponent implements OnInit {

  /** selected player info */
  @Input()
  selectedPlayer: FantasyPlayer;

  @Input()
  playerProfile: any;

  // Radar
  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scale: {
      ticks: {
        min: 0,
        max: 100,
        display: false
      }
    },
    tooltips: {
      enabled: true,
      callbacks: {
        label: function(tooltipItem, data) {
            return data.labels[tooltipItem.index] + ' : ' + data.datasets[0].data[tooltipItem.index] + '%';
        }
      }
    },
    plugins: {
      colorschemes: {
        scheme: ComparisonColorPalette,
        override: true
      }
    }
  };
  public radarChartLabels: string[] = [ 'QB', 'RB', 'WR', 'TE'];

  public radarDataSet: ChartDataSets[] = [];
  public radarChartType: ChartType = 'radar';

  constructor(
    public playerService: PlayerService,
    public leagueService: LeagueService,
    ) {
  }

  ngOnInit(): void {
    this.generateRadarData();
  }

  ngOnChanges(): void {
    this.generateRadarData();
  }

  generateRadarData(): void {
    this.radarDataSet = [];
    const radarMetrics = [...this.playerProfile?.profile_json?.profile?.college_metrics || [], ...this.playerProfile?.profile_json?.profile?.workout_metrics || []].filter(it => it.value && it.value != '' && it.value != '-');
    this.radarChartLabels = radarMetrics.map(it => it.display);
    const percentileData = radarMetrics.map(it => {
      const percentileStr : string = it.percentile;
      return Number(percentileStr.substring(0, percentileStr.length - 2))
    });
    this.radarDataSet.push({ data: percentileData });
  }

}
