import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base-component.abstract';
import { SleeperApiService } from '../../services/api/sleeper/sleeper-api.service';
import { LeagueService } from '../../services/league.service';
import { PlayerService } from '../../services/player.service';
import { ConfigKeyDictionary, ConfigService, LocalStorageDictionary } from '../../services/init/config.service';
import { LeagueSwitchService } from '../services/league-switch.service';
import { ActivatedRoute } from '@angular/router';
import { EditLeagueSettingsModalComponent } from '../modals/edit-league-settings-modal/edit-league-settings-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MflService } from '../../services/api/mfl/mfl.service';
import { LeaguePlatform } from '../../model/league/FantasyPlatformDTO';
import { FleaflickerService } from 'src/app/services/api/fleaflicker/fleaflicker.service';
import { ESPNService } from 'src/app/services/api/espn/espn.service';
import { FFPCService } from 'src/app/services/api/ffpc/ffpc.service';
import { DisplayService } from 'src/app/services/utilities/display.service';
import { PageService } from 'src/app/services/utilities/page.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { LeagueDTO } from 'src/app/model/league/LeagueDTO';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent extends BaseComponent implements OnInit, AfterViewInit {

  pageDescription = 'Dynasty Daddy is a free dynasty fantasy football tool that leverages fantasy market player values and fantasy League data to help users make quicker, more well informed fantasy football decisions.'

  /** What dynasty daddy social media is toggled to show */
  dynastyDaddySocials: string = 'discord';

  /** sleeper username input */
  usernameInput: string = '';

  /** sleeper league id input */
  sleeperLeagueIdInput: string = '';

  /** mfl league id input */
  mflLeagueIdInput: string = '';

  /** mfl username input */
  mflUsernameInput: string = '';

  /** mfl password input */
  mflPasswordInput: string = '';

  /** fleaflicekr league id input */
  fleaflickerLeagueIdInput: string = '';

  /** selected year from list */
  selectedYear: string;

  /** supported years to select */
  supportedYears: string[] = [];

  /** mat tab group index */
  selectedTab: string = '0';

  /** sleeper login method */
  sleeperLoginMethod: string = 'sleeper_username';

  /** fleaflicker login method */
  fleaflickerLoginMethod: string = 'fleaflicker_email';

  /** fleaflicker email string */
  fleaflickerEmail: string = '';

  /** mfl login method */
  mflLoginMethod: string = 'mfl_username';

  /** ESPN login method */
  espnLoginMethod: string = 'espn_public_league';

  /** ESPN league id string */
  espnLeagueId: string = '';

  /** ESPN_s2 Cookie for private leagues */
  espns2Cookie: string = '';

  /** SWID Cookie for private espn leagues */
  espnSwidCookie: string = '';

  /** FFPC login method */
  ffpcLoginMethod: string = 'ffpc_email';

  /** FFPC league id string */
  ffpcLeagueId: string = '';

  /** FFPC email string */
  ffpcEmail: string = '';

  errorMsg: string = '';

  /** club added already is toggled when clicked */
  clubAddedAlready: boolean = false;

  constructor(private sleeperApiService: SleeperApiService,
    public leagueService: LeagueService,
    private playersService: PlayerService,
    public displayService: DisplayService,
    public configService: ConfigService,
    public userService: UserService,
    private route: ActivatedRoute,
    private mflService: MflService,
    private espnService: ESPNService,
    private ffpcService: FFPCService,
    private dialog: MatDialog,
    private pageService: PageService,
    private fleaflickerService: FleaflickerService,
    public leagueSwitchService: LeagueSwitchService) {
    super();
    this.pageService.setUpPageSEO('Home',
      ['dynasty', 'fantasy', 'football', 'ranker', 'trade', 'sleeper', 'espn fantasy',
        'myfantasyleague', 'mfl', 'yahoo fantasy', 'ffpc', 'keeptradecut', 'fantasycalc',
        'dynastysuperflex', 'dynastyprocess', 'sleeper fantasy football', 'fleaflicker fantasy'],
      this.pageDescription);
  }

  ngOnInit(): void {
    this.supportedYears = this.generateYears();
    if (!this.leagueService.selectedYear) {
      this.selectedYear = this.supportedYears[1];
    } else {
      this.selectedYear = this.leagueService.selectedYear;
    }
    this.setUpForms();
    if (this.playersService.playerValues.length === 0) {
      this.playersService.loadPlayerValuesForToday();
    }
    this.addSubscriptions(
      this.route.queryParams.subscribe(params => {
        const code = params['code'];
        if (code) {
          this.selectedTab = '-1';
          localStorage.setItem(LocalStorageDictionary.SELECTED_LOGIN_METHOD, '-1')
          this.userService.handleOAuthCallback();
        }
        this.leagueSwitchService.loadFromQueryParams(params);
      }),
      this.leagueSwitchService.leagueChanged$.subscribe(_ => {
        this.selectedYear = this.leagueService?.selectedYear ||
          this.leagueService?.selectedLeague?.season || this.supportedYears[1];
        if (!this.userService.user) {
          localStorage.setItem(LocalStorageDictionary.SELECTED_LOGIN_METHOD,
            this.leagueService.selectedLeague?.leaguePlatform?.toString())
        } else {
          localStorage.setItem(LocalStorageDictionary.SELECTED_LOGIN_METHOD, '-1')
        }
        this.setUpForms();
      })
    );
  }

  /**
   * set up logic to initialize values for form from services
   * @private
   */
  private setUpForms(): void {
    this.leagueSwitchService.selectedLeague = this.leagueService.selectedLeague || null;
    // patreon is -1, rest is just the platform enum
    this.selectedTab = this.userService.user ? '-1' :
      localStorage.getItem(LocalStorageDictionary.SELECTED_LOGIN_METHOD) || '-1';
    if (this.leagueService.selectedLeague) {
      this.selectedTab = this.userService.user ? '-1' :
        this.leagueService.selectedLeague.leaguePlatform.toString();
      switch (this.leagueService.selectedLeague.leaguePlatform) {
        case LeaguePlatform.MFL:
          this.mflLeagueIdInput = this.leagueService.selectedLeague.leagueId;
          break;
        case LeaguePlatform.ESPN:
          this.espnLeagueId = this.leagueService.selectedLeague.leagueId;
          break;
        case LeaguePlatform.FLEAFLICKER:
          this.fleaflickerLeagueIdInput = this.leagueService.selectedLeague.leagueId;
          break;
        case LeaguePlatform.FFPC:
          this.ffpcLeagueId = this.leagueService.selectedLeague.leagueId;
          break;
        default:
          this.sleeperLeagueIdInput = this.leagueService.selectedLeague.leagueId;
      }
    }
    this.usernameInput = localStorage.getItem(LocalStorageDictionary.SLEEPER_USERNAME_ITEM) || '';
    this.fleaflickerEmail = localStorage.getItem(LocalStorageDictionary.FF_USERNAME_ITEM) || '';
    this.mflUsernameInput = localStorage.getItem(LocalStorageDictionary.MFL_USERNAME_ITEM) || '';
    this.ffpcEmail = localStorage.getItem(LocalStorageDictionary.FFPC_USERNAME_ITEM) || '';
    this.espns2Cookie = localStorage.getItem(LocalStorageDictionary.ESPN_S2) || '';
    this.espnSwidCookie = localStorage.getItem(LocalStorageDictionary.ESPN_SWID) || '';
  }

  ngAfterViewInit(): void {
    // this.loadTwitterTimeline();
  }

  /**
   * get desktop tab id
   */
  getDesktopPlatformTab = () =>
    (Number(this.selectedTab) + 1).toString();

  /**
   * Wraps refresh call to twitter for pulling timeline
   */
  loadTwitterTimeline(): void {
    this.dynastyDaddySocials = 'twitter';
    (<any>window)?.twttr?.widgets?.load();
  }


  /**
   * Loads user information for the specified platform.
   *
   * @param platform - The platform for which user information should be loaded.
   */
  fetchUserInfo(platform: LeaguePlatform): void {
    let username: string;
    let password: string;
    this.clubAddedAlready = false;

    switch (platform) {
      case LeaguePlatform.SLEEPER:
        username = this.usernameInput;
        localStorage.setItem(LocalStorageDictionary.SLEEPER_USERNAME_ITEM, username);
        break;
      case LeaguePlatform.MFL:
        username = this.mflUsernameInput;
        password = this.mflPasswordInput;
        localStorage.setItem(LocalStorageDictionary.MFL_USERNAME_ITEM, username);
        break;
      case LeaguePlatform.FLEAFLICKER:
        username = this.fleaflickerEmail;
        localStorage.setItem(LocalStorageDictionary.FF_USERNAME_ITEM, username);
        break;
      case LeaguePlatform.FFPC:
        username = this.ffpcEmail;
        localStorage.setItem(LocalStorageDictionary.FFPC_USERNAME_ITEM, username);
        break;
      default:
        console.error(`${platform} is not a supported platform for user login.`);
        return;
    }

    this.leagueService.loadNewUser$(username, this.selectedYear, platform, password)
      .subscribe(
        _ => {
          this.leagueService.selectedYear = this.selectedYear;
          this.leagueService.resetLeague();
        },
        error => {
          console.error('Error:', error);
        }
      );
  }

  /**
   * Logs in with ESPN League ID, loads league data, and triggers the league switch.
   *
   * @param year - The year of the ESPN League (optional, uses the selected year if not provided).
   * @param leagueId - The ESPN League ID (optional, uses the stored ESPN League ID if not provided).
   * @param espns2Cookie - The ESPN S2 cookie for authentication (optional).
   * @param espnSwidCookie - The ESPN SWID cookie for authentication.
   */
  loginWithESPNLeagueId(year?: string, leagueId?: string, espns2Cookie?: string, espnSwidCookie?: string): void {
    this.clubAddedAlready = false;
    this.errorMsg = '';
    localStorage.setItem(LocalStorageDictionary.ESPN_S2, this.espns2Cookie);
    localStorage.setItem(LocalStorageDictionary.ESPN_SWID, this.espnSwidCookie);
    this.espnService.loadLeagueFromId$(
      year || this.selectedYear,
      leagueId || this.espnLeagueId,
      espns2Cookie || this.espns2Cookie,
      espnSwidCookie || this.espnSwidCookie
    )
      .pipe(
        catchError((error) => {
          if (error.status === 401) {
            this.errorMsg = 'ERROR: ESPN League is private. Update league settings in ESPN.';
          }
          return throwError(error);
        })
      )
      .subscribe(
        leagueData => {
          this.leagueSwitchService.loadLeague(leagueData);
        }
      );
  }

  /**
   * loads ffpc data for user
   * @param year season
   * @param leagueId ffpc league id
   */
  loginWithFFPCLeagueId(year?: string, leagueId?: string): void {
    this.clubAddedAlready = false;
    this.ffpcService.loadLeagueFromId$(year || this.selectedYear, leagueId || this.ffpcLeagueId).subscribe(leagueData => {
      this.leagueSwitchService.loadLeague(leagueData);
    });
  }

  /**
   * generate selectable years
   */
  generateYears(): string[] {
    const years = [];
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() - 1);
    const currentYear = currentDate.getFullYear() + 1;
    for (let i = 0; i < 16; i++) {
      years.push((currentYear - i).toString());
    }
    return years;
  }

  /**
   * handles logging in for demo
   */
  loginWithDemo(): void {
    this.leagueService.leagueUser = null;
    this.loginWithSleeperLeagueId(this.configService.getConfigOptionByKey(ConfigKeyDictionary.DEMO_LEAGUE_ID)?.configValue);
  }

  /**
   * handles logging in with league id
   * @param demoId string of demo league id
   */
  loginWithSleeperLeagueId(demoId?: string): void {
    this.clubAddedAlready = false;
    this.sleeperApiService.getSleeperLeagueByLeagueId(demoId || this.sleeperLeagueIdInput).subscribe(leagueData => {
      this.leagueSwitchService.loadLeague(leagueData);
    });
  }

  /**
   * log in with a previous year league id
   */
  loginWithPrevSeason(): void {
    switch (this.leagueService.selectedLeague.leaguePlatform) {
      case LeaguePlatform.MFL:
        this.loginWithMFLLeagueId((Number(this.selectedYear) - 1).toString(), this.leagueService.selectedLeague.prevLeagueId);
        break;
      case LeaguePlatform.FLEAFLICKER:
        this.loginWithFleaflickerLeagueId((Number(this.selectedYear) - 1).toString(), this.leagueService.selectedLeague.prevLeagueId);
        break;
      case LeaguePlatform.FFPC:
        this.loginWithFFPCLeagueId((Number(this.selectedYear) - 1).toString(), this.leagueService.selectedLeague.prevLeagueId);
        break;
      default:
        this.loginWithSleeperLeagueId(this.leagueService.selectedLeague.prevLeagueId)
    }
  }

  /**
   * returns true if we should display home modal
   */
  displayHomeModal = () =>
    this.configService.getConfigOptionByKey(ConfigKeyDictionary.SHOW_HOME_DIALOG)?.configValue === 'true'

  /**
   * returns the home modal header information
   */
  getHomeModalHeader = () =>
    this.configService.getConfigOptionByKey(ConfigKeyDictionary.HOME_DIALOG_HEADER)?.configValue

  /**
   * returns home modal body information
   */
  getHomeModalBody = () =>
    this.configService.getConfigOptionByKey(ConfigKeyDictionary.HOME_DIALOG_BODY)?.configValue

  /**
   * returns home modal background color from config option
   */
  getHomeModalBGColor = () =>
    this.configService.getConfigOptionByKey(ConfigKeyDictionary.HOME_DIALOG_BG_COLOR)?.configValue

  openSettingsDialog(): void {
    this.dialog.open(EditLeagueSettingsModalComponent
      , {
        minHeight: '350px',
        minWidth: this.configService.isMobile ? '300px' : '500px',
      }
    );
  }

  /**
   * handles logging in with mfl league id
   */
  loginWithMFLLeagueId(year: string = this.selectedYear, leagueId: string = this.mflLeagueIdInput): void {
    this.clubAddedAlready = false;
    const formattedLeagueId = leagueId?.split('#')[0] || leagueId;
    this.mflService.loadLeagueFromId$(year, formattedLeagueId).subscribe(leagueData => {
      this.leagueSwitchService.loadLeague(leagueData);
    });
  }

  /**
 * handles logging in with league id
 * @param demoId string of demo league id
 */
  loginWithFleaflickerLeagueId(year?: string, leagueId?: string): void {
    this.clubAddedAlready = false;
    this.fleaflickerService.loadLeagueFromId$(year || this.selectedYear, leagueId || this.fleaflickerLeagueIdInput).subscribe(leagueData => {
      this.leagueSwitchService.loadLeague(leagueData);
    });
  }

  /** mat menu for mobile doesn't update without wrapper function */
  getSelectedImage(): string {
    if (this.selectedTab == '-1') {
      return 'assets/patreon-tile.svg';
    }
    return this.displayService.getImageForPlatform(Number(this.selectedTab));
  }

  /** mat menu for mobile doesn't update without wrapper function */
  getSelectedPlatformName(): string {
    if (this.selectedTab == '-1') {
      return 'Patreon';
    }
    return this.displayService.getDisplayNameForPlatform(Number(this.selectedTab));
  }

  /**
   * Opens url for slide
   * @param slide slide object with url to open
   */
  openSlideUrl(slide: any): void {
    window.open(slide.url, '_blank');
  }

  /**
   * open patreon for user
   */
  openPatreon = () =>
    window.open('https://www.patreon.com/DynastyDaddy', '_blank');

  /**
   * Add Leagues to a Club user
   */
  addLeaguesToClub(leagues: LeagueDTO[] = this.leagueService.leagueUser.leagues): void {
    this.clubAddedAlready = true;
    this.userService.addLeaguesToPatreonUser(leagues);
  }
}
