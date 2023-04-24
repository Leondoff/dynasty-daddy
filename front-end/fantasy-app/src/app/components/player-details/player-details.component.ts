import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { BaseComponent } from '../base-component.abstract';
import { FantasyMarket, FantasyPlayer, FantasyPlayerDataPoint } from '../../model/assets/FantasyPlayer';
import { FantasyPlayerApiService } from '../../services/api/fantasy-player-api.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { LeagueService } from '../../services/league.service';
import { PlayerComparisonService } from '../services/player-comparison.service';
import { ConfigService } from '../../services/init/config.service';
import { PlayerInsights } from '../model/playerInsights';
import { LeagueSwitchService } from '../services/league-switch.service';
import { Status } from '../model/status';

@Component({
  selector: 'app-player-details',
  templateUrl: './player-details.component.html',
  styleUrls: ['./player-details.component.css']
})
export class PlayerDetailsComponent extends BaseComponent implements OnInit {

  /** did players load */ 
  playersLoaded: boolean;

  /** selected player */
  selectedPlayer: FantasyPlayer;

  /** selected player insights */
  selectedPlayerInsights: PlayerInsights;

  /** historical player value data */
  historicalTradeValue: FantasyPlayerDataPoint[];

  /** player profile json blob */
  playerProfile: any

  /** Player Profile updated date */
  profileUpdatedDate: string = '';

  /** name id url param for player to load */
  NAME_ID_URL_PARAM: string = 'playerNameId';

  constructor(public playerService: PlayerService,
    private fantasyPlayerApiService: FantasyPlayerApiService,
    private route: ActivatedRoute,
    public leagueService: LeagueService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private playerComparisonService: PlayerComparisonService,
    public leagueSwitchService: LeagueSwitchService,
    public configService: ConfigService) {
    super();
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      this.historicalTradeValue = null;
      this.playerProfile = null;
      this.profileUpdatedDate = null;
      const nameId = params.get(this.NAME_ID_URL_PARAM);
      this.playersLoaded = (this.playerService.playerValues.length > 0);
      if (this.playersLoaded) {
        this.selectedPlayer = this.playerService.getPlayerByNameId(nameId);
        this.selectedPlayerInsights = this.playerService.getPlayerInsights(this.selectedPlayer,
          this.leagueService?.selectedLeague?.isSuperflex);
      }
      if (this.playerService.playerValues.length === 0) {
        this.playerService.loadPlayerValuesForToday();
      }
      this.addSubscriptions(this.playerService.currentPlayerValuesLoaded$.subscribe(() => {
        this.playersLoaded = true;
        this.selectedPlayer = this.playerService.getPlayerByNameId(nameId);
      }),
        this.fantasyPlayerApiService.getPlayerDetailsByNameId(nameId).subscribe((data) => {
          this.historicalTradeValue = data.historicalData;
          this.playerProfile = data.profile[0]
          this.profileUpdatedDate = data.profile[0]?.last_updated?.substring(0,10);
        }
        ),
        this.route.queryParams.subscribe(params => {
          this.leagueSwitchService.loadFromQueryParams(params);
        })
      );
  });
  }

  /**
   * get last 5 week average for player fantasy points
   */
  getLast5WeekAverage(): number | string {
    let last5Weeks = 0;
    const scoringFormat = this.leagueService.getLeagueScoringFormat();
    for (let i = 1; i < 6; i++) {
      const weekStats = this.playerService.pastSeasonWeeklyStats[i];
      if (weekStats) {
        last5Weeks += weekStats[this.selectedPlayer.sleeper_id]?.[scoringFormat] || 0;
      }
    }
    return Math.round(last5Weeks / 5 * 100) / 100 || '-';
  }

  /**
   * check if all player stats are generated from sleeper
   * TODO update with rxjs
   */
  isPlayerStatsGenerated(): boolean {
    return this.playerService.pastSeasonWeeklyStats[2] &&
      this.playerService.pastSeasonWeeklyStats[1] &&
      this.playerService.pastSeasonWeeklyStats[3] &&
      this.playerService.pastSeasonWeeklyStats[4] &&
      this.playerService.pastSeasonWeeklyStats[5] &&
      this.playerService.pastSeasonWeeklyStats[6] &&
      this.playerService.pastSeasonWeeklyStats[7] &&
      this.playerService.pastSeasonWeeklyStats[8] &&
      this.playerService.pastSeasonWeeklyStats[9] &&
      this.playerService.pastSeasonWeeklyStats[10] &&
      this.playerService.pastSeasonWeeklyStats[11] &&
      this.playerService.pastSeasonWeeklyStats[12] &&
      this.playerService.pastSeasonWeeklyStats[13] &&
      this.playerService.pastSeasonWeeklyStats[14] &&
      this.playerService.pastSeasonWeeklyStats[15] &&
      this.playerService.pastSeasonWeeklyStats[16] &&
      this.playerService.pastSeasonWeeklyStats[17] &&
      this.playerService.pastSeasonWeeklyStats[18] &&
      this.playerService.pastSeasonWeeklyProjections[1] &&
      this.playerService.pastSeasonWeeklyProjections[2] &&
      this.playerService.pastSeasonWeeklyProjections[3] &&
      this.playerService.pastSeasonWeeklyProjections[4] &&
      this.playerService.pastSeasonWeeklyProjections[5] &&
      this.playerService.pastSeasonWeeklyProjections[6] &&
      this.playerService.pastSeasonWeeklyProjections[7] &&
      this.playerService.pastSeasonWeeklyProjections[8] &&
      this.playerService.pastSeasonWeeklyProjections[9] &&
      this.playerService.pastSeasonWeeklyProjections[10] &&
      this.playerService.pastSeasonWeeklyProjections[11] &&
      this.playerService.pastSeasonWeeklyProjections[12] &&
      this.playerService.pastSeasonWeeklyProjections[13] &&
      this.playerService.pastSeasonWeeklyProjections[14] &&
      this.playerService.pastSeasonWeeklyProjections[15] &&
      this.playerService.pastSeasonWeeklyProjections[16] &&
      this.playerService.pastSeasonWeeklyProjections[17] &&
      this.playerService.pastSeasonWeeklyProjections[18];
  }

  /**
   * is player athletic profile loaded
   */
  isPlayerProfileLoaded(): boolean {
    return this.playerProfile && JSON.stringify(this.playerProfile.profile_json?.profile) !== '{}'
  }

  /**
   * open up player comparison with selected player
   * @param selectedPlayer player data
   */
  openPlayerComparison(selectedPlayer: FantasyPlayer): void {
    this.playerComparisonService.addPlayerToCharts(selectedPlayer, false, this.playerService.selectedMarket);
    this.router.navigate(['players/comparison'],
      {
        queryParams: this.leagueSwitchService.buildQueryParams()
      }
    );
  }

  /**
   * handles changing of fantasy market
   * @param $event 
   */
  onMarketChange($event): void {
    this.playerService.selectedMarket = $event;
  }

}
