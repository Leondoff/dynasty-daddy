import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base-component.abstract';
import { SleeperApiService } from '../../services/api/sleeper/sleeper-api.service';
import { LeagueService } from '../../services/league.service';
import { PlayerService } from '../../services/player.service';
import { ConfigKeyDictionary, ConfigService } from '../../services/init/config.service';
import { LeagueSwitchService } from '../services/league-switch.service';
import { ActivatedRoute } from '@angular/router';
import { EditLeagueSettingsModalComponent } from '../modals/edit-league-settings-modal/edit-league-settings-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MflService } from '../../services/api/mfl/mfl.service';
import { LeaguePlatform } from '../../model/league/FantasyPlatformDTO';
import { FleaflickerService } from 'src/app/services/api/fleaflicker/fleaflicker.service';
import { ESPNService } from 'src/app/services/api/espn/espn.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends BaseComponent implements OnInit, AfterViewInit {

  /** What dynasty daddy social media is toggled to show */
  dynastyDaddySocials: string = 'twitter';

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
  espnLoginMethod: string = 'espn_league_id';

  /** ESPN league id string */
  espnLeagueId: string = '';

  constructor(private sleeperApiService: SleeperApiService,
    public leagueService: LeagueService,
    private playersService: PlayerService,
    public configService: ConfigService,
    private route: ActivatedRoute,
    private mflService: MflService,
    private espnService: ESPNService,
    private dialog: MatDialog,
    private fleaflickerService: FleaflickerService,
    public leagueSwitchService: LeagueSwitchService) {
    super();
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
        this.leagueSwitchService.loadFromQueryParams(params);
      }),
      this.leagueSwitchService.leagueChanged$.subscribe(_ => {
        this.selectedYear = this.leagueService?.selectedYear ||
          this.leagueService?.selectedLeague?.season || this.supportedYears[1];
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
    if (this.leagueService.selectedLeague) {
      this.selectedTab = this.leagueService.selectedLeague.leaguePlatform.toString();
      switch (this.leagueService.selectedLeague.leaguePlatform) {
        case LeaguePlatform.MFL:
          this.mflLeagueIdInput = this.leagueService.selectedLeague.leagueId;
          this.mflUsernameInput = this.leagueService.leagueUser?.userData?.username || '';
          break;
        case LeaguePlatform.ESPN:
          this.espnLeagueId = this.leagueService.selectedLeague.leagueId;
          break;
        case LeaguePlatform.FLEAFLICKER:
          this.fleaflickerLeagueIdInput = this.leagueService.selectedLeague.leagueId;
          this.fleaflickerEmail = this.leagueService.leagueUser?.userData?.username || '';
          break;
        default:
          this.usernameInput =
            this.leagueService.leagueUser?.userData?.username == null || this.leagueService.leagueUser?.userData?.username === 'undefined'
              ? '' : this.leagueService.leagueUser?.userData?.username;
          this.sleeperLeagueIdInput = this.leagueService.selectedLeague.leagueId;
      }
    }
  }

  ngAfterViewInit(): void {
    this.loadTwitterTimeline();
  }

  /**
   * Wraps refresh call to twitter for pulling timeline
   */
  loadTwitterTimeline(): void {
    this.dynastyDaddySocials = 'twitter';
    (<any>window)?.twttr?.widgets?.load();
  }

  /**
   * loads sleeper data for user
   */
  fetchSleeperInfo(): void {
    this.leagueService.loadNewUser$(this.usernameInput, this.selectedYear);
    this.leagueService.selectedYear = this.selectedYear;
    this.leagueService.resetLeague();
  }

  /**
   * loads fleaflicker data for user
   */
  fetchFleaflickerInfo(): void {
    this.fleaflickerLeagueIdInput = '';
    this.leagueService.loadNewUser$(this.fleaflickerEmail, this.selectedYear, LeaguePlatform.FLEAFLICKER);
    this.leagueService.selectedYear = this.selectedYear;
    this.leagueService.resetLeague();
  }


  /**
   * loads fleaflicker data for user
   */
  loginWithESPNLeagueId(year?: string, leagueId?: string): void {
    this.espnService.loadLeagueFromId$(year || this.selectedYear, leagueId || this.espnLeagueId).subscribe(leagueData => {
      this.leagueSwitchService.loadLeague(leagueData);
    });
  }

  /**
   * loads MFL data for user
   */
  fetchMFLInfo(): void {
    this.mflLeagueIdInput = '';
    this.leagueService.loadNewUser$(this.mflUsernameInput, this.selectedYear, LeaguePlatform.MFL, this.mflPasswordInput);
    this.leagueService.selectedYear = this.selectedYear;
    this.leagueService.resetLeague();
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
  loginWithMFLLeagueId(year?: string, leagueId?: string): void {
    this.mflService.loadLeagueFromId$(year || this.selectedYear, leagueId || this.mflLeagueIdInput).subscribe(leagueData => {
      this.leagueSwitchService.loadLeague(leagueData);
    });
  }

  /**
 * handles logging in with league id
 * @param demoId string of demo league id
 */
  loginWithFleaflickerLeagueId(year?: string, leagueId?: string): void {
    this.fleaflickerService.loadLeagueFromId$(year || this.selectedYear, leagueId || this.fleaflickerLeagueIdInput).subscribe(leagueData => {
      this.leagueSwitchService.loadLeague(leagueData);
    });
  }

  /**
 * get platform display name
 */
  getPlatformDisplayName(): string {
    switch (this.leagueService?.selectedLeague?.leaguePlatform) {
      case LeaguePlatform.MFL:
        return 'MyFantasyLeague';
      case LeaguePlatform.FLEAFLICKER:
        return 'Fleaflicker';
      case LeaguePlatform.SLEEPER:
        return 'Sleeper';
      default:
        return 'League';
    }
  }

  /**
   * Opens url for slide
   * @param slide slide object with url to open
   */
  openSlideUrl(slide: any): void {
    window.open(slide.url, '_blank');
  }
}
