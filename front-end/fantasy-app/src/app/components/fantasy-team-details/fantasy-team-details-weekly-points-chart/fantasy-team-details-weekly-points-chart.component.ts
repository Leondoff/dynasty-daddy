import {Component, Input, OnInit} from '@angular/core';
import {ChartDataSets, ChartOptions} from 'chart.js';
import {Label} from 'ng2-charts';
import {MatchupService} from '../../services/matchup.service';
import {LeagueTeam} from '../../../model/league/LeagueTeam';
import {LeagueService} from '../../../services/league.service';
import {NflService} from "../../../services/utilities/nfl.service";
import { ComparisonColorPalette as ComparisonColorPalette } from '../../services/color.service';

@Component({
  selector: 'app-fantasy-team-details-weekly-points-chart',
  templateUrl: './fantasy-team-details-weekly-points-chart.component.html',
  styleUrls: ['./fantasy-team-details-weekly-points-chart.component.css']
})
export class FantasyTeamDetailsWeeklyPointsChartComponent implements OnInit {

  /**
   * team selected
   */
  @Input()
  selectedTeam: LeagueTeam;

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
      // custom: tooltipModel => {
      //   multi
      // }
    },
    scales: {
      xAxes: [{
        display: true,
        gridLines: {
          display: false
        },
        scaleLabel: {
          display: true,
          labelString: 'MatchUp',
          fontColor: '#d3d3d3'
        }
      }],
      yAxes: [{
        display: true,
        gridLines: {
          display: false
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
        scheme: ComparisonColorPalette,
        override: true
      }
    }
  };
  public lineChartLegend = false;
  public lineChartType = 'line';
  public lineChartPlugins = [];

  constructor(private leagueService: LeagueService, private matchupService: MatchupService, private nflService: NflService) {
  }

  ngOnInit(): void {
    // TODO fix this
    if (this.matchupService.leagueMatchUpUI.length === 0) {
      console.warn('Warning: Match Data was not loaded correctly. Recalculating Data...');
      this.matchupService.initMatchUpCharts(this.leagueService.selectedLeague,
        this.nflService.getCompletedWeekForSeason(this.leagueService.selectedLeague.season));
    }
    this.createMatchupDataSets();
  }

  /**
   * create data set for table
   */
  createMatchupDataSets(): void {
    const weeklyPoints = [];
    const oppPoints = [];
    for (const weekMatchups of this.matchupService.leagueMatchUpUI) {
      const weekNumber = weekMatchups[0]?.week - this.leagueService.selectedLeague.startWeek;
      weeklyPoints[weekNumber] = 0;
      oppPoints[weekNumber] = 0;
      for (const matchUp of weekMatchups) {
        if (matchUp.team1RosterId === this.selectedTeam.roster.rosterId) {
          weeklyPoints[weekNumber] = matchUp.team1Points;
          oppPoints[weekNumber] = matchUp.team2Points;
          this.lineChartLabels[matchUp.week - this.leagueService.selectedLeague.startWeek] = ('Week ' + matchUp.week + ' vs. ' +
                        this.leagueService.getTeamByRosterId(matchUp.team2RosterId).owner?.teamName);
          break;
        } else if (matchUp.team2RosterId === this.selectedTeam.roster.rosterId) {
          weeklyPoints[weekNumber] = matchUp.team2Points;
          oppPoints[weekNumber] = matchUp.team1Points;
          this.lineChartLabels[matchUp.week - this.leagueService.selectedLeague.startWeek] = ('Week ' + matchUp.week + ' vs. ' +
            this.leagueService.getTeamByRosterId(matchUp.team1RosterId).owner?.teamName);
          break;
        }
      }
      // if no match up was scheduled this week add a BYE week label
      if (!this.lineChartLabels[weekNumber]) {
        this.lineChartLabels[weekNumber] = ('Week ' + weekMatchups[0]?.week + ' BYE');
      }
    }
    this.lineChartData.push({
      label: this.selectedTeam.owner?.teamName,
      data: weeklyPoints
    });
    this.lineChartData.push({label: 'Opponent', data: oppPoints, fill: false});
  }

}
