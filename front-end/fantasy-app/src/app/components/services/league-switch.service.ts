import {SleeperApiService} from '../../services/api/sleeper/sleeper-api.service';
import {LeagueService} from '../../services/league.service';
import {PowerRankingsService} from './power-rankings.service';
import {PlayerService} from '../../services/player.service';
import {MockDraftService} from './mock-draft.service';
import {MatchupService} from './matchup.service';
import {PlayoffCalculatorService} from './playoff-calculator.service';
import {ConfigService} from '../../services/init/config.service';
import {TransactionsService} from './transactions.service';
import {LeagueData} from '../../model/LeagueUser';
import {BehaviorSubject, forkJoin, Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {BaseComponent} from '../base-component.abstract';
import {NflService} from '../../services/utilities/nfl.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {TradeService} from './trade.service';
import {TradeFinderService} from './trade-finder.service';
import {LogRocketService} from './logrocket.service';

@Injectable({
  providedIn: 'root'
})
export class LeagueSwitchService extends BaseComponent {

  /** selected league data */
  selectedLeague: LeagueData;

  /** event whenever a league has finished changing */
  leagueChanged$ = new Subject<LeagueData>();

  extraParams$ = new BehaviorSubject<{}>({});

  /** timestamp of last time refresh was called */
  lastTimeRefreshed: Date;

  constructor(private sleeperApiService: SleeperApiService,
              private leagueService: LeagueService,
              private powerRankingService: PowerRankingsService,
              private playersService: PlayerService,
              private tradeService: TradeService,
              private mockDraftService: MockDraftService,
              private matchupService: MatchupService,
              private nflService: NflService,
              private playoffCalculatorService: PlayoffCalculatorService,
              private tradeFinderService: TradeFinderService,
              private configService: ConfigService,
              private router: Router,
              private route: ActivatedRoute,
              private logRocketService: LogRocketService,
              private transactionService: TransactionsService) {
    super();
  }

  /**
   * load league data
   * @param value league data
   */
  loadLeague(value: LeagueData): void {
    this.leagueService.leagueStatus = 'LOADING';
    this.selectedLeague = value;
    this.leagueService.resetLeague();
    this.powerRankingService.reset();
    this.mockDraftService.resetLeague();
    this.playoffCalculatorService.reset();
    this.matchupService.reset();
    this.playersService.resetOwners();
    this.transactionService.reset();
    this.tradeService.reset();
    console.time('Fetch Sleeper League Data');
    this.addSubscriptions(this.leagueService.$loadNewLeague(this.selectedLeague).subscribe((x) => {
        this.leagueService.leagueTeamDetails.map((team) => {
          this.playersService.generateRoster(team);
        });
        this.matchupService.initMatchUpCharts(
          this.selectedLeague,
          this.nflService.getCompletedWeekForSeason(this.selectedLeague.season)
        ).subscribe(() => {
          forkJoin([this.powerRankingService.mapPowerRankings(this.leagueService.leagueTeamDetails, this.playersService.playerValues),
            this.playoffCalculatorService.generateDivisions(this.selectedLeague, this.leagueService.leagueTeamDetails)]).subscribe(() => {
            this.leagueService.selectedLeague = this.selectedLeague;
            this.leagueService.leagueStatus = 'DONE';
            this.tradeFinderService.selectedTeamUserId = this.leagueService.leagueUser?.userData?.user_id;
            console.timeEnd('Fetch Sleeper League Data');
            this.leagueChanged$.next(this.selectedLeague);
            this.lastTimeRefreshed = new Date();
            this.updateQueryParams();
          });

        });
      }
    ));
  }

  /**
   * returns the number of minutes since last loading a league
   */
  getMinutesSinceLastRefresh(): number {
    return Math.round(Math.abs(new Date().getTime() - this.lastTimeRefreshed.getTime()) / 60000);
  }

  /**
   * loads league user and year based on string
   * @param user username
   * @param year year defaults to current year if null
   */
  loadUser(user: string, year: string = new Date().getFullYear().toString()): void {
    this.leagueService.loadNewUser(user, year);
    this.leagueService.selectedYear = year;
    this.logRocketService.identifySession(user);
    this.leagueService.resetLeague();
  }

  /**
   * load league with league id
   * @param leagueId string
   */
  loadLeagueWithLeagueId(leagueId: string): void {
    this.addSubscriptions(this.sleeperApiService.getSleeperLeagueByLeagueId(leagueId).subscribe(leagueData => {
        this.loadLeague(leagueData);
      })
    );
  }

  /**
   * load league from query params
   * @param params params to load league from
   */
  loadFromQueryParams(params: Params): void {
    const user = params.user;
    const year = params.year;
    const league = params.league;
    if (league && !this.selectedLeague) {
      this.playersService.loadPlayerValuesForToday();
      this.addSubscriptions(
        this.playersService.$currentPlayerValuesLoaded.subscribe(() => {
          this.loadUser(user, year);
          this.loadLeagueWithLeagueId(league);
        })
      );
    }
    if (!league && !this.selectedLeague) {
      this.leagueService.leagueStatus = 'NONE';
    }
  }

  /**
   * Builds valid query params for making requests
   * TODO create separate request interceptor that handles logic
   */
  buildQueryParams(): {} {
    const queryParams: any = this.extraParams$.value;
    if (this.leagueService.selectedLeague) {
      queryParams.league = this.leagueService.selectedLeague.leagueId;
    }
    if (this.leagueService.leagueUser?.userData?.username !== 'undefined') {
      queryParams.user = this.leagueService.leagueUser?.userData?.username;
    }
    return queryParams;
  }

  /**
   * update the url params in requests when a new league is selected
   */
  updateQueryParams(): void {
    const queryParams = this.buildQueryParams();
    this.router.navigate([], {
        relativeTo: this.route,
        queryParams
      }
    );
  }
}
