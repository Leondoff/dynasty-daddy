import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ChartConfiguration, ChartDataSets, ChartType } from 'chart.js';
import { LeagueTeam } from 'src/app/model/league/LeagueTeam';
import { TeamPowerRanking } from '../../model/powerRankings';
import { LeagueService } from 'src/app/services/league.service';
import { LeagueType } from 'src/app/model/league/LeagueDTO';
import { FantasyMarket } from 'src/app/model/assets/FantasyPlayer';
import { ComparisonColorPalette } from '../../../services/utilities/color.service';

@Component({
  selector: 'app-fantasy-team-rankings-radar-chart',
  templateUrl: './fantasy-team-rankings-radar-chart.html',
  styleUrls: [ './fantasy-team-rankings-radar-chart.css' ]
})
export class FantasyTeamRankingsRadarChart implements OnInit, OnChanges {

  @Input()
  powerRankings: TeamPowerRanking[];

  @Input()
  selectedTeam: LeagueTeam;

  @Input()
  selectedMarket: FantasyMarket;

  // Radar
  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scale: {
      ticks: {
        min: 1,
        max: 12,
        display: false
      }
    },
    tooltips: {
      enabled: false
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

  constructor(private leagueService: LeagueService) {}

  ngOnInit(): void {
    this.generateRadarData();
  }

  ngOnChanges(): void {
    this.generateRadarData();
  }

  generateRadarData(): void {
    this.radarDataSet = [];
    this.radarChartLabels = [ 'QB', 'RB', 'WR', 'TE'];
    const teamPowerRankings = this.powerRankings.find(team => team.team?.owner?.userId === this.selectedTeam?.owner?.userId)
    const rankData = teamPowerRankings.roster.map(it => this.powerRankings.length - it.rank + 2);
    this.radarChartOptions.scale.ticks.max = this.powerRankings.length + 1;
    if (this.leagueService.selectedLeague.type === LeagueType.DYNASTY) {
      this.radarChartLabels.push('Picks');
      rankData.push(this.powerRankings.length - teamPowerRankings.picks.rank + 1);
    }
    this.radarDataSet.push({ data: rankData });
  }
}