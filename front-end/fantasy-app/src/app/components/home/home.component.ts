import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BaseComponent} from '../base-component.abstract';
import {SleeperApiService} from '../../services/api/sleeper/sleeper-api.service';
import {LeagueService} from '../../services/league.service';
import {PowerRankingsService} from '../services/power-rankings.service';
import {PlayerService} from '../../services/player.service';
import {ConfigKeyDictionary, ConfigService} from '../../services/init/config.service';
import {LeagueSwitchService} from '../services/league-switch.service';
import {ActivatedRoute} from '@angular/router';
import {LogRocketService} from '../services/logrocket.service';
import {EditLeagueSettingsModalComponent} from '../modals/edit-league-settings-modal/edit-league-settings-modal.component';
import {MatDialog} from '@angular/material/dialog';
import {MflService} from '../../services/api/mfl/mfl.service';
import {MflApiService} from '../../services/api/mfl/mfl-api.service';
import {LeaguePlatform} from '../../model/league/FantasyPlatformDTO';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends BaseComponent implements OnInit, AfterViewInit {

  usernameInput: string = '';

  sleeperLeagueIdInput: string = '';

  mflLeagueIdInput: string = '';

  selectedYear: string;

  supportedYears: string[] = [];

  selectedTab: string = '1';

  sleeperLoginMethod: string = 'sleeper_username';

  mflLoginMethod: string = 'mfl_league_id';

  constructor(private sleeperApiService: SleeperApiService,
              public leagueService: LeagueService,
              private playersService: PlayerService,
              public configService: ConfigService,
              private route: ActivatedRoute,
              private logRocketService: LogRocketService,
              private mflService: MflService,
              private mflApiService: MflApiService,
              private dialog: MatDialog,
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
        this.selectedYear = this.leagueService.selectedLeague.season;
        this.setUpForms();
      })
    )
    ;
  }

  /**
   * set up logic to initialize values for form from services
   * @private
   */
  private setUpForms(): void {
    this.leagueSwitchService.selectedLeague = this.leagueService.selectedLeague || null;
    if (this.leagueService.selectedLeague){
      this.usernameInput =
        this.leagueService.leagueUser?.userData?.username == null || this.leagueService.leagueUser?.userData?.username === 'undefined'
          ? '' : this.leagueService.leagueUser?.userData?.username;
      this.selectedTab = this.leagueService.selectedLeague.leaguePlatform.toString();
      switch (this.leagueService.selectedLeague.leaguePlatform) {
        case LeaguePlatform.MFL:
          this.mflLeagueIdInput = this.leagueService.selectedLeague.leagueId;
          break;
        default:
          this.sleeperLeagueIdInput = this.leagueService.selectedLeague.leagueId;
      }
    }
  }

  ngAfterViewInit(): void {
    // twitter widget
    (<any>window).twttr.widgets.load();
  }

  /**
   * loads sleeper data for user
   */
  fetchSleeperInfo(): void {
    this.leagueService.loadNewUser(this.usernameInput, this.selectedYear);
    this.leagueService.selectedYear = this.selectedYear;
    this.leagueService.resetLeague();
    this.logRocketService.identifySession(this.usernameInput);
  }

  /**
   * generate selectable years
   * TODO dynamic checking of available years for user??
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
    this.usernameInput = '';
    this.leagueService.leagueUser = null;
    this.sleeperApiService.getSleeperLeagueByLeagueId(demoId || this.sleeperLeagueIdInput).subscribe(leagueData => {
      if (this.sleeperLeagueIdInput) {
        this.logRocketService.identifySession(this.sleeperLeagueIdInput);
      }
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
    this.leagueService.leagueUser = null;
    this.mflApiService.getMFLLeague(year || this.selectedYear, leagueId || this.mflLeagueIdInput).subscribe(leagueData => {
      this.leagueSwitchService.loadLeague(this.mflService.fromMFLLeague(leagueData.league, year || this.selectedYear));
    });
  }
}
