import {SleeperApiService} from '../../services/api/sleeper/sleeper-api.service';
import {LeagueService} from '../../services/league.service';
import {PowerRankingsService} from './power-rankings.service';
import {PlayerService} from '../../services/player.service';
import {DraftService} from './draft.service';
import {MatchupService} from './matchup.service';
import {PlayoffCalculatorService} from './playoff-calculator.service';
import {TransactionsService} from './transactions.service';
import {BehaviorSubject, forkJoin, Observable, Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {BaseComponent} from '../base-component.abstract';
import {NflService} from '../../services/utilities/nfl.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {TradeService} from './trade.service';
import {TradeFinderService} from './trade-finder.service';
import {LogRocketService} from './logrocket.service';
import {MflService} from '../../services/api/mfl/mfl.service';
import {LeaguePlatform} from '../../model/league/FantasyPlatformDTO';
import {LeagueDTO} from '../../model/league/LeagueDTO';

@Injectable({
  providedIn: 'root'
})
export class LeagueSwitchService extends BaseComponent {

  /** selected league data */
  selectedLeague: LeagueDTO;

  /** event whenever a league has finished changing */
  leagueChanged$ = new Subject<LeagueDTO>();

  extraParams$ = new BehaviorSubject<{}>({});

  /** timestamp of last time refresh was called */
  lastTimeRefreshed: Date;

  constructor(private sleeperApiService: SleeperApiService,
              private mflService: MflService,
              private leagueService: LeagueService,
              private powerRankingService: PowerRankingsService,
              private playersService: PlayerService,
              private tradeService: TradeService,
              private mockDraftService: DraftService,
              private matchupService: MatchupService,
              private nflService: NflService,
              private playoffCalculatorService: PlayoffCalculatorService,
              private tradeFinderService: TradeFinderService,
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
  loadLeague(value: LeagueDTO): void {
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
    this.addSubscriptions(this.leagueService.loadNewLeague$(this.selectedLeague).subscribe((x) => {
        this.leagueService.leagueTeamDetails.map((team) => {
          this.playersService.generateRoster(team, this.selectedLeague.leaguePlatform);
        });
        this.matchupService.initMatchUpCharts(
          this.selectedLeague,
          this.nflService.getCompletedWeekForSeason(this.selectedLeague.season)
        ).subscribe(() => {
          forkJoin([
            this.powerRankingService.mapPowerRankings(
              this.leagueService.leagueTeamDetails,
              this.playersService.playerValues,
              this.leagueService.selectedLeague.leaguePlatform
            ),
            this.playoffCalculatorService.generateDivisions(this.selectedLeague, this.leagueService.leagueTeamDetails)]).subscribe(() => {
            this.leagueService.selectedLeague = this.selectedLeague;
            this.leagueService.leagueStatus = 'DONE';
            this.tradeFinderService.selectedTeamUserId = this.leagueService.leagueUser?.userData?.user_id 
              || this.leagueService.leagueTeamDetails[0]?.owner?.userId;
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
   * @param year season year (needed for MFL)
   * @param leaguePlatform fantasy platform league id is for. Default: Sleeper
   */
  loadLeagueWithLeagueId(leagueId: string, year: string, leaguePlatform: LeaguePlatform = LeaguePlatform.SLEEPER): void {
    this.addSubscriptions(this.getLeagueObservable(leagueId, year, leaguePlatform).subscribe(leagueData => {
        this.loadLeague(leagueData);
      })
    );
  }

  /**
   * returns the load league observable based on platform
   * @param leagueId league id string
   * @param year season
   * @param leaguePlatform enum league platform, defaults: Sleeper
   * @private
   */
  getLeagueObservable(
    leagueId: string,
    year: string,
    leaguePlatform: LeaguePlatform = LeaguePlatform.SLEEPER
  ): Observable<LeagueDTO> {
    switch (Number(leaguePlatform)) {
      case LeaguePlatform.MFL.valueOf():
        return this.mflService.loadLeagueFromId$(year, leagueId);
      default:
        return this.sleeperApiService.getSleeperLeagueByLeagueId(leagueId);
    }
  }

  /**
   * load league from query params
   * @param params params to load league from
   */
  loadFromQueryParams(params: Params): void {
    const user = params.user;
    const year = params.year;
    const leaguePlatform = params.platform;
    const league = params.league;
    if (league && !this.selectedLeague) {
      this.addSubscriptions(
        this.playersService.currentPlayerValuesLoaded$.subscribe(() => {
          if (user) {
            this.loadUser(user, year);
          }
          this.loadLeagueWithLeagueId(league, year, leaguePlatform);
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
      queryParams.year = this.selectedLeague.season;
      queryParams.platform = this.leagueService.selectedLeague.leaguePlatform || LeaguePlatform.SLEEPER;
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
