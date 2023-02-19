import {Injectable} from '@angular/core';
import {FantasyPlayerApiConfigService} from './api/fantasy-player-api-config.service';
import {SleeperApiConfigService} from './api/sleeper/sleeper-api-config.service';
import {ConfigApiConfigService} from './api/config/config-api-config.service';
import {MflApiConfigService} from './api/mfl/mfl-api-config.service';

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
              private configApiConfigService: ConfigApiConfigService) {
  }

  public assignEndpoints(): void {

    // config option endpoint
    this.configApiConfigService.getConfigOptionsEndpoint = this.baseUrl + '/v1/config/all';

    // Fantasy Player Database Endpoints
    this.fantasyPlayerApiConfigService.getPlayerValuesForTodayEndpoint = this.baseUrl + '/v1/player/all/today';
    this.fantasyPlayerApiConfigService.getPlayerValuesForMarketEndpoint = this.baseUrl + '/v1/player/all/market/';
    this.fantasyPlayerApiConfigService.getPrevPlayerValuesEndpoint = this.baseUrl + '/v1/player/all/prev/';
    this.fantasyPlayerApiConfigService.getHistoricalPlayerValues = this.baseUrl + '/v1/player/';

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
    this.mflAPIConfigService.getMFLLeagueStandingEndpoint = this.baseUrl + '/v1/mfl/leagueStandings';
    this.mflAPIConfigService.getMFLRostersEndpoint = this.baseUrl + '/v1/mfl/rosters';
    this.mflAPIConfigService.getMFLFutureDraftPicksEndpoint = this.baseUrl + '/v1/mfl/futureDraftPicks';

  }
}
