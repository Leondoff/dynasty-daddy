import {Component, OnInit} from '@angular/core';
import {LeagueService} from '../../services/league.service';
import {PlayoffCalculatorService} from '../services/playoff-calculator.service';
import {LeagueTeam} from '../../model/LeagueTeam';
import {MatchupService} from '../services/matchup.service';
import {ConfigService} from '../../services/init/config.service';
import {MatchUpUI} from '../model/matchup';
import {TransactionsService} from '../services/transactions.service';
import {BaseComponent} from '../base-component.abstract';
import {LeagueSwitchService} from '../services/league-switch.service';
import {PowerRankingsService} from '../services/power-rankings.service';
import {ActivatedRoute} from '@angular/router';
import {NflService} from '../../services/utilities/nfl.service';

@Component({
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.css']
})
export class StandingsComponent extends BaseComponent implements OnInit {

  constructor(public leagueService: LeagueService,
              public playoffCalculatorService: PlayoffCalculatorService,
              public matchupService: MatchupService,
              public configService: ConfigService,
              private route: ActivatedRoute,
              public powerRankingsService: PowerRankingsService,
              private nflService: NflService,
              public leagueSwitchService: LeagueSwitchService,
              public transactionService: TransactionsService) {
    super();
  }

  divisionTableCols = ['teamName', 'record', 'pf', 'ppf', 'pot'];

  /** closest wins columns */
  closestWinsCols = ['week', 'team1Name', 'score', 'team2Name', 'diff'];

  /** closest wins columns */
  pointsForCols = ['week', 'points', 'team1PointsFor', 'score', 'team2Name'];

  ngOnInit(): void {
    this.setUpStandings();
    this.addSubscriptions(this.leagueSwitchService.leagueChanged$.subscribe(() => {
          this.setUpStandings();
        }
      ), this.route.queryParams.subscribe(params => {
        this.leagueSwitchService.loadFromQueryParams(params);
      })
    );
  }

  setUpStandings(): void {
    if (this.leagueService.selectedLeague) {
      if (this.matchupService.leagueMatchUpUI.length === 0 || this.playoffCalculatorService.matchUpsWithProb.length === 0) {
        console.warn('Warning: Match Data was not loaded correctly. Recalculating Data...');
        this.matchupService.initMatchUpCharts(this.leagueService.selectedLeague,
          this.nflService.getCompletedWeekForSeason(this.leagueService.selectedLeague.season)
        );
      }
      const endWeek = this.nflService.getCurrentWeekForSeason(this.leagueService.selectedLeague?.season);
      if (this.matchupService.leagueMedians.length === 0) {
        this.playoffCalculatorService.calculateLeagueMedians();
      }
      if (this.matchupService.leagueClosestWins.length === 0) {
        this.matchupService.getClosestWins(this.leagueService.selectedLeague.startWeek, endWeek);
      }
      if (this.matchupService.leagueMostPointsFor.length === 0) {
        this.matchupService.getMostPointsForInWeek(this.leagueService.selectedLeague.startWeek, endWeek);
      }
      if (!this.isTransactionAggComplete()) {
        this.transactionService.generateTransactionAggregate(endWeek);
      }
    }
  }

  roundNumber(num: number): number {
    return Math.round(num);
  }

  getPointPotentialPercent(team: LeagueTeam): number {
    return Math.round(team.roster.teamMetrics.fpts / team.roster.teamMetrics.ppts * 100);
  }

  /**
   * return rounded difference between two point totals
   * @param matchUp match up
   */
  getPointDifference(matchUp: MatchUpUI): number {
    return Math.round(Math.abs(matchUp.team1Points - matchUp.team2Points) * 100) / 100;
  }

  /**
   * returns true if transaction agg isn't empty
   */
  isTransactionAggComplete(): boolean {
    return JSON.stringify(this.transactionService.transactionAggregate) !== '{}';
  }

  isNaN(num: number): boolean {
    return isNaN(num);
  }
}
