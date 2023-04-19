import { Injectable } from '@angular/core';
import { FantasyPlayerApiConfigService } from './api/fantasy-player-api-config.service';
import { SleeperApiConfigService } from './api/sleeper/sleeper-api-config.service';
import { ConfigApiConfigService } from './api/config/config-api-config.service';
import { MflApiConfigService } from './api/mfl/mfl-api-config.service';
import { FleaflickerApiConfigService } from './api/fleaflicker/fleaflicker-api-config.service';
import { ESPNApiConfigService } from './api/espn/espn-api-config.service';

@Injectable({
  providedIn: 'root'
})
export class EndpointsService {

  // TODO add cloud base url for api
  private baseUrl = 'https://dynasty-daddy.com/api';
  // uncomment for dev environment
  // private baseUrl = 'http://localhost:3000/api';

  constructor(private fantasyPlayerApiConfigService: FantasyPlayerApiConfigService,
    private sleeperApiConfigService: SleeperApiConfigService,
    private mflAPIConfigService: MflApiConfigService,
    private fleaflickerApiConfigService: FleaflickerApiConfigService,
    private espnApiConfigService: ESPNApiConfigService,
    private configApiConfigService: ConfigApiConfigService) {
  }

  public assignEndpoints(): void {

    // config option endpoint
    this.configApiConfigService.getConfigOptionsEndpoint = this.baseUrl + '/v1/config/all';

    // Dynasty Daddy Endpoints
    this.fantasyPlayerApiConfigService.getPlayerValuesForTodayEndpoint = this.baseUrl + '/v1/player/all/today';
    this.fantasyPlayerApiConfigService.getPlayerValuesForMarketEndpoint = this.baseUrl + '/v1/player/all/market/';
    this.fantasyPlayerApiConfigService.getPrevPlayerValuesEndpoint = this.baseUrl + '/v1/player/all/prev/';
    this.fantasyPlayerApiConfigService.getHistoricalPlayerValuesEndpoint = this.baseUrl + '/v1/player/';
    this.fantasyPlayerApiConfigService.getPlayerDetailsEndpoint = this.baseUrl + '/v1/player/details/';
    this.fantasyPlayerApiConfigService.getFantasyPortfolioEndpoint = this.baseUrl + '/v1/portfolio';

    // Sleeper Endpoints
    this.sleeperApiConfigService.getSleeperUsernameEndpoint = 'https://api.sleeper.app/v1/user/';
    this.sleeperApiConfigService.getSleeperLeagueEndpoint = 'https://api.sleeper.app/v1/league/';
    this.sleeperApiConfigService.getSleeperDraftEndpoint = 'https://api.sleeper.app/v1/draft/';
    this.sleeperApiConfigService.getSleeperStatsEndpoint = 'https://api.sleeper.app/v1/stats/nfl/regular/';
    this.sleeperApiConfigService.getSleeperProjectionsEndpoint = 'https://api.sleeper.app/v1/projections/nfl/regular/';
    this.sleeperApiConfigService.getSleeperNFLStateEndpoint = 'https://api.sleeper.app/v1/state/nfl';
    this.sleeperApiConfigService.getSleeperPlayersEndpoint = 'https://api.sleeper.app/v1/players/nfl';

    // mfl endpoints
    this.mflAPIConfigService.getMFLLeagueEndpoint = this.baseUrl + '/v1/mfl/league';
    this.mflAPIConfigService.getMFLPlayersEndpoint = this.baseUrl + '/v1/mfl/players';
    this.mflAPIConfigService.getMFLScheduleEndpoint = this.baseUrl + '/v1/mfl/schedule';
    this.mflAPIConfigService.getMFLTransactionsEndpoint = this.baseUrl + '/v1/mfl/transactions';
    this.mflAPIConfigService.getMFLDraftResultsEndpoint = this.baseUrl + '/v1/mfl/draftResults';
    this.mflAPIConfigService.getMFLLeaguesForUser = this.baseUrl + '/v1/mfl/leagues';
    this.mflAPIConfigService.getMFLLeagueStandingEndpoint = this.baseUrl + '/v1/mfl/leagueStandings';
    this.mflAPIConfigService.getMFLRostersEndpoint = this.baseUrl + '/v1/mfl/rosters';
    this.mflAPIConfigService.getMFLFutureDraftPicksEndpoint = this.baseUrl + '/v1/mfl/futureDraftPicks';

    // Fleaflicker Endpoints
    this.fleaflickerApiConfigService.getFFLeagueEndpoint = this.baseUrl + '/v1/ff/league';
    this.fleaflickerApiConfigService.getFFLeagueStandingEndpoint = this.baseUrl + '/v1/ff/leagueStandings';
    this.fleaflickerApiConfigService.getFFRostersEndpoint = this.baseUrl + '/v1/ff/rosters';;
    this.fleaflickerApiConfigService.getFFScheduleEndpoint = this.baseUrl + '/v1/ff/schedule';
    this.fleaflickerApiConfigService.getFFTransactionsEndpoint = this.baseUrl + '/v1/ff/transactions';
    this.fleaflickerApiConfigService.getFFFutureDraftPicksEndpoint = this.baseUrl + '/v1/ff/futureDraftPicks';
    this.fleaflickerApiConfigService.getFFTradesEndpoint = this.baseUrl + '/v1/ff/trades';
    this.fleaflickerApiConfigService.getFFDraftResultsEndpoint = this.baseUrl + '/v1/ff/draftResults';
    this.fleaflickerApiConfigService.getUserLeagueEndpoint = this.baseUrl + '/v1/ff/user';

    // ESPN Endpoints
    this.espnApiConfigService.getESPNLeagueEndpoint = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons/SELECTED_YEAR/segments/0/leagues/LEAGUE_ID?view=mDraftDetail&view=mLiveScoring&view=mMatchupScore&view=mPendingTransactions&view=mPositionalRatings&view=mRoster&view=mSettings&view=mTeam&view=modular&view=mNav'
  }
}
