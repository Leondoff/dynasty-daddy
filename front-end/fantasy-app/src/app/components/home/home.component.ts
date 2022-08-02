import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../base-component.abstract';
import {SleeperApiService} from '../../services/api/sleeper/sleeper-api.service';
import {SleeperService} from '../../services/sleeper.service';
import {PowerRankingsService} from '../services/power-rankings.service';
import {PlayerService} from '../../services/player.service';
import {ConfigKeyDictionary, ConfigService} from '../../services/init/config.service';
import {LeagueSwitchService} from '../services/league-switch.service';
import LogRocket from 'logrocket';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends BaseComponent implements OnInit {

  usernameInput: string = '';

  leagueIdInput: string = '';

  selectedYear: string;

  supportedYears: string[] = [];

  loginMethod: string = 'sleeper_username';

  DEMO_ID: string = '553670046391185408';

  constructor(private sleeperApiService: SleeperApiService,
              public sleeperService: SleeperService,
              private powerRankingService: PowerRankingsService,
              private playersService: PlayerService,
              public configService: ConfigService,
              private route: ActivatedRoute,
              public leagueSwitchService: LeagueSwitchService) {
    super();
  }

  ngOnInit(): void {
    this.supportedYears = this.generateYears();
    if (!this.sleeperService.selectedYear) {
      this.selectedYear = this.supportedYears[1];
    } else {
      this.selectedYear = this.sleeperService.selectedYear;
    }
    this.usernameInput = this.sleeperService.sleeperUser?.userData?.username || '';
    this.leagueSwitchService.selectedLeague = this.sleeperService.selectedLeague || null;
    if (this.playersService.playerValues.length === 0) {
      this.playersService.loadPlayerValuesForToday();
    }
    this.addSubscriptions(
      this.route.queryParams.subscribe(params => {
        this.leagueSwitchService.loadFromQueryParams(params);
      }),
      this.leagueSwitchService.leagueChanged.subscribe(_ => {
        this.usernameInput = this.sleeperService.sleeperUser.userData.username;
        this.selectedYear = this.sleeperService.selectedYear;
        this.leagueSwitchService.selectedLeague = this.sleeperService.selectedLeague;
      })
    )
    ;
  }

  /**
   * loads sleeper data for user
   */
  fetchSleeperInfo(): void {
    this.sleeperService.loadNewUser(this.usernameInput, this.selectedYear);
    this.sleeperService.selectedYear = this.selectedYear;
    this.sleeperService.resetLeague();
    this.identifySession(this.usernameInput);
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
    this.sleeperService.sleeperUser = null;
    this.loginWithLeagueId(this.DEMO_ID);
  }

  /**
   * handles logging in with league id
   * @param demoId string of demo league id
   */
  loginWithLeagueId(demoId?: string): void {
    this.usernameInput = '';
    this.sleeperService.sleeperUser = null;
    this.sleeperApiService.getSleeperLeagueByLeagueId(demoId || this.leagueIdInput).subscribe(leagueData => {
      if (this.leagueIdInput) {
        this.identifySession(this.leagueIdInput);
      }
      this.leagueSwitchService.loadLeague(leagueData);
    });
  }

  /**
   * log in with a previous year league id
   */
  loginWithPrevSeason = () =>
    this.loginWithLeagueId(this.sleeperService.selectedLeague.prevLeagueId)

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

  /**
   * identify logrocket session when logging in
   * @param identifier string indentifier
   */
  identifySession(identifier: string): void {
    if (!window.location.origin.includes('localhost')) {
      console.log('identify log rocket session', identifier);
      LogRocket.identify(identifier, {
        username: identifier,
      });
    }
  }
}
