import {Component, OnInit, ViewChild} from '@angular/core';
import {PowerRankingsService} from '../../services/power-rankings.service';
import {BaseChartDirective, Label} from 'ng2-charts';
import {ChartDataSets, ChartOptions} from 'chart.js';
import {LeagueService} from '../../../services/league.service';
import {Color} from 'chartjs-plugin-datalabels/types/options';
import {ColorService} from '../../../services/utilities/color.service';


@Component({
  selector: 'app-strength-of-schedule-chart',
  templateUrl: './strength-of-schedule-chart.component.html',
  styleUrls: ['./strength-of-schedule-chart.component.css']
})
export class StrengthOfScheduleChartComponent implements OnInit {

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
      text: 'Overall Team Value'
    },
    scales: {
      xAxes: [{
        display: true,
        gridLines: {
          display: false
        },
        scaleLabel: {
          display: true,
          labelString: 'Team',
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
          labelString: 'Average Opp. Starter Value',
          fontColor: '#d3d3d3'
        }
      }]
    },
    plugins: {}
  };
  public chartLegend = false;
  public chartType = 'bar';
  public chartPlugins = [];
  public data: ChartDataSets[] = [];
  public dataLabels: Label[] = [];
  public chartColors: Color;

  constructor(
    public powerRankingsService: PowerRankingsService,
    private leagueService: LeagueService,
    private colorService: ColorService
  ) {
  }

  ngOnInit(): void {
    const sortedData = this.generateStrengthOfSchedule();
    for (const team of sortedData) {
      this.data.push({
        data: team.value,
        label: 'Avg. Opp. Starters',
        backgroundColor: this.colorService.getColorGradientArray(sortedData.length,  '#e31d1d', '#008f51'),
        hoverBackgroundColor: [],
      });
      this.dataLabels.push(team.team);
    }
  }

  /**
   * returns an array of data sorted by most difficult schedule to least difficult
   * TODO cleanup redundant code with matchup service
   * @private
   */
  private generateStrengthOfSchedule(): { value: any, team: string }[] {
    const teamData = [];
    for (const team of this.leagueService.leagueTeamDetails) {
      let competitionStarterValue = 0;
      for (let week = this.leagueService.selectedLeague.startWeek; week < this.leagueService.selectedLeague.playoffStartWeek; week++) {
        const matchupData = this.leagueService.selectedLeague.leagueMatchUps[week];
        for (const matchup of matchupData) {
          if (matchup.rosterId === team.roster.rosterId) {
            const matchupId = matchup.matchupId;
            for (const oppMatchup of matchupData) {
              if (oppMatchup.matchupId === matchupId && oppMatchup.rosterId !== team.roster.rosterId) {
                this.powerRankingsService.powerRankings.map(teamValue => {
                  if (teamValue.team.roster.rosterId === oppMatchup.rosterId) {
                    competitionStarterValue += teamValue.adpValueStarter;
                    return teamValue;
                  }
                });
              }
            }
          }
        }
      }
      teamData.push(
        {
          value: Math.round(competitionStarterValue /
            (this.leagueService.selectedLeague.playoffStartWeek - this.leagueService.selectedLeague.startWeek)),
          team: team.owner?.teamName
        });
    }
    return teamData.sort((a, b) => {
        return b.value - a.value;
      }
    );
  }
}
