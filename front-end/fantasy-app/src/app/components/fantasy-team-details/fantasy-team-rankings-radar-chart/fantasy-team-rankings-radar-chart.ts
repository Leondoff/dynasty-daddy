import { Component, OnInit, Input } from '@angular/core';
import { ChartConfiguration, ChartDataSets, ChartType } from 'chart.js';
import { LeagueTeam } from 'src/app/model/league/LeagueTeam';
import { TeamPowerRanking } from '../../model/powerRankings';
import 'chartjs-plugin-colorschemes/src/plugins/plugin.colorschemes';
import {ClassicColorBlind10} from 'chartjs-plugin-colorschemes/src/colorschemes/colorschemes.tableau';
import { LeagueService } from 'src/app/services/league.service';
import { LeagueType } from 'src/app/model/league/LeagueDTO';

@Component({
  selector: 'app-fantasy-team-rankings-radar-chart',
  templateUrl: './fantasy-team-rankings-radar-chart.html',
  styleUrls: [ './fantasy-team-rankings-radar-chart.css' ]
})
export class FantasyTeamRankingsRadarChart implements OnInit {

  @Input()
  powerRankings: TeamPowerRanking[];

  @Input()
  selectedTeam: LeagueTeam;

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
        scheme: ClassicColorBlind10,
        override: true
      }
    }
  };
  public radarChartLabels: string[] = [ 'QB', 'RB', 'WR', 'TE'];

  public radarDataSet: ChartDataSets[] = [];
  public radarChartType: ChartType = 'radar';

  constructor(private leagueService: LeagueService) {}

  ngOnInit(): void {
    // generate datasets
    this.generateRadarData();
  }

  generateRadarData(): void {
    this.radarChartOptions
    const teamPowerRankings = this.powerRankings.find(team => team.team?.owner?.userId === this.selectedTeam?.owner?.userId)
    const rankData = teamPowerRankings.roster.map(it => this.powerRankings.length - it.rank + 1);
    this.radarChartOptions.scale.ticks.max = this.powerRankings.length;
    if (this.leagueService.selectedLeague.type === LeagueType.DYNASTY) {
      this.radarChartLabels.push('Picks');
      rankData.push(this.powerRankings.length - teamPowerRankings.picks.rank + 1);
    }
    this.radarDataSet.push({ data: rankData });
  }
}