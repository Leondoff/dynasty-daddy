import {NgxSpinnerService} from 'ngx-spinner';
import {SleeperApiService} from '../../services/api/sleeper/sleeper-api.service';
import {SleeperService} from '../../services/sleeper.service';
import {PowerRankingsService} from './power-rankings.service';
import {PlayerService} from '../../services/player.service';
import {MockDraftService} from './mock-draft.service';
import {MatchupService} from './matchup.service';
import {PlayoffCalculatorService} from './playoff-calculator.service';
import {ConfigService} from '../../services/init/config.service';
import {TransactionsService} from './transactions.service';
import {SleeperLeagueData} from '../../model/SleeperUser';
import {forkJoin, Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {BaseComponent} from '../base-component.abstract';
import {NflService} from '../../services/utilities/nfl.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {TradeService} from './trade.service.ts.service';
import {TradeFinderService} from './trade-finder.service';

@Injectable({
  providedIn: 'root'
})
export class LeagueSwitchService extends BaseComponent {

  /** selected league data */
  selectedLeague: SleeperLeagueData;

  /** event whenever a league has finished changing */
  leagueChanged = new Subject<SleeperLeagueData>();

  /** timestamp of last time refresh was called */
  lastTimeRefreshed: Date;

  constructor(private spinner: NgxSpinnerService,
              private sleeperApiService: SleeperApiService,
              private sleeperService: SleeperService,
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
              private transactionService: TransactionsService) {
    super();
  }

  /**
   * load league data
   * @param value league data
   */
  loadLeague(value: SleeperLeagueData): void {
    this.selectedLeague = value;
    this.spinner.show();
    this.sleeperService.resetLeague();
    this.powerRankingService.reset();
    this.mockDraftService.resetLeague();
    this.playoffCalculatorService.reset();
    this.matchupService.reset();
    this.playersService.resetOwners();
    this.transactionService.reset();
    this.tradeService.reset();
    console.time('Fetch Sleeper League Data');
    this.addSubscriptions(this.sleeperService.$loadNewLeague(this.selectedLeague).subscribe((x) => {
        this.sleeperService.sleeperTeamDetails.map((team) => {
          this.playersService.generateRoster(team);
        });
        forkJoin([this.powerRankingService.mapPowerRankings(this.sleeperService.sleeperTeamDetails, this.playersService.playerValues),
          this.playoffCalculatorService.generateDivisions(this.selectedLeague, this.sleeperService.sleeperTeamDetails),
          this.matchupService.initMatchUpCharts(this.selectedLeague)]).subscribe(() => {
          this.sleeperService.selectedLeague = this.selectedLeague;
          this.sleeperService.leagueLoaded = true;
          this.tradeFinderService.selectedTeamUserId = this.sleeperService.sleeperUser?.userData?.user_id;
          console.timeEnd('Fetch Sleeper League Data');
          this.leagueChanged.next(this.selectedLeague);
          this.lastTimeRefreshed = new Date();
          this.updateQueryParams();
          this.spinner.hide();
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
    this.sleeperService.loadNewUser(user, year);
    this.sleeperService.selectedYear = year;
    this.sleeperService.resetLeague();

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
    const user = params['user'];
    const year = params['year'];
    const league = params['league'];
    if (league && !this.selectedLeague) {
      this.playersService.loadPlayerValuesForToday();
      this.addSubscriptions(
        this.playersService.$currentPlayerValuesLoaded.subscribe(() => {
          this.loadUser(user, year);
          this.loadLeagueWithLeagueId(league);
        })
      );
    }
  }

  /**
   * update the url params in requests when a new league is selected
   */
  updateQueryParams(): void {
    this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          league: this.sleeperService.selectedLeague?.leagueId,
          user: this.sleeperService.sleeperUser?.userData?.username,
          year: this.sleeperService.selectedYear
        }
      }
    );
  }
}
