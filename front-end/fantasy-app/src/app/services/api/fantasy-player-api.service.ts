import { Injectable } from '@angular/core';
import { FantasyMarket, FantasyPlayer, FantasyPlayerDataPoint } from '../../model/assets/FantasyPlayer';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FantasyPlayerApiConfigService } from './fantasy-player-api-config.service';
import { Observable, of } from 'rxjs';
import { tap, map, delay } from 'rxjs/operators';
import { GridPlayer } from 'src/app/components/model/gridPlayer';
import { LeagueScoringDTO } from 'src/app/model/league/LeagueScoringDTO';
import { FantasyPlatformDTO } from 'src/app/model/league/FantasyPlatformDTO';


@Injectable({
  providedIn: 'root'
})
export class FantasyPlayerApiService {

  /**
   * cached players list
   * @private
   */
  private playersList: FantasyPlayer[];

  /**
   * cached prev month player list
   * @private
   */
  private prevPlayerList: FantasyPlayerDataPoint[];

  /**
   * cache portfolio data
   */
  private fantasyPortfolioCache = {};

  /**
   * cache player values that have been loaded
   */
  private playerValuesDict = {};

  /** historical gridirons cache */
  private historicalGridirons;

  /** gridiron results cache */
  private gridironResults = {};

  /** league format cache */
  private leagueFormatCache;

  /** non offense players loaded */
  private nonOffensePlayers;

  /** trade database volume cache */
  private tradeDatabaseVolume;

  constructor(private http: HttpClient, private fantasyPlayerApiConfigService: FantasyPlayerApiConfigService) {
  }

  /**
   * get player values for today
   */
  getPlayerValuesForToday(): Observable<FantasyPlayer[]> {
    return this.playersList ? of(this.playersList) : this.refreshPlayerValuesForToday();
  }

  /**
   * refresh cached player values for today
   */
  refreshPlayerValuesForToday(): Observable<FantasyPlayer[]> {
    return this.http.get<FantasyPlayer[]>(this.fantasyPlayerApiConfigService.getPlayerValuesForTodayEndpoint)
      .pipe(tap((players: FantasyPlayer[]) => {
        this.playersList = players.map(player => {
          player.avg_adp = Number(player.avg_adp);
          player.injury_status = player.injury_status || '';
          player.sf_change = Math.round(
            (player.sf_trade_value - player.last_month_value_sf) / (player.sf_trade_value === 0 ? 1 : player.sf_trade_value) * 100);
          player.standard_change = Math.round(
            (player.trade_value - player.last_month_value) / (player.trade_value === 0 ? 1 : player.trade_value) * 100);
          return player;
        });
      }, err => {
        throw new Error(err);
      }
      ));
  }

  /**
   * get player values for today
   */
  getPlayerValueForFantasyMarket(market: FantasyMarket): Observable<{}> {
    return this.playerValuesDict[market] != null ? of(this.playerValuesDict[market]) : this.fetchPlayerValuesForMarket(market);
  }

  /**
   * Fetches player values for market and caches
   * @param market market number
   * @returns map of player values from market
   */
  private fetchPlayerValuesForMarket(market: number): Observable<{}> {
    return this.http.get<FantasyPlayer[]>(this.fantasyPlayerApiConfigService.getPlayerValuesForMarketEndpoint + market.toString())
      .pipe(map((players: FantasyPlayer[]) => {
        this.playerValuesDict[market] = {}
        players.forEach(player => {
          player.sf_change = Math.round(
            (player.sf_trade_value - player.last_month_value_sf) / (player.sf_trade_value === 0 ? 1 : player.sf_trade_value) * 100);
          player.standard_change = Math.round(
            (player.trade_value - player.last_month_value) / (player.trade_value === 0 ? 1 : player.trade_value) * 100);
          this.playerValuesDict[market][player.name_id] = player;
        });
        return this.playerValuesDict[market];
      }, err => {
        throw new Error(err);
      }
      ));
  }

  /**
   * get player values for last month
   */
  getPrevPlayerValues(days: number = 30): Observable<FantasyPlayerDataPoint[]> {
    return this.prevPlayerList ? of(this.prevPlayerList) : this.refreshPrevPlayerValues(days);
  }

  /**
   * refresh cached player values for last month
   */
  refreshPrevPlayerValues(days: number): Observable<FantasyPlayerDataPoint[]> {
    return this.http.get<FantasyPlayerDataPoint[]>(this.fantasyPlayerApiConfigService.getPrevPlayerValuesEndpoint + days)
      .pipe(tap((players: FantasyPlayerDataPoint[]) => this.prevPlayerList = players, err => {
        throw new Error(err);
      }
      ));
  }


  /**
   * get historical player value over time by id
   * @param nameId player name id
   */
  getHistoricalPlayerValueById(nameId: string, isAllTime: boolean = false): Observable<FantasyPlayerDataPoint[]> {
    return this.http.get<FantasyPlayerDataPoint[]>(this.fantasyPlayerApiConfigService.getHistoricalPlayerValuesEndpoint + nameId + `?isAllTime=${isAllTime}`)
      .pipe(tap((players: FantasyPlayerDataPoint[]) => players
      ));
  }

  /**
   * get historical player value over time by id
   * @param nameId player name id
   */
  getPlayerDetailsByNameId(nameId: string): Observable<{ historicalData: FantasyPlayerDataPoint[], profile: any, tradeData: any }> {
    return this.http.get<{ historicalData: FantasyPlayerDataPoint[], profile: any, tradeData: any }>(this.fantasyPlayerApiConfigService.getPlayerDetailsEndpoint + nameId)
      .pipe(tap((player: { historicalData: FantasyPlayerDataPoint[], profile: any, tradeData: any }) => player));
  }

  /**
    * get fantasy portfolio player values over time (cache layer)
    * @param intervalDays number of days in the past to fetch
    * @param portfolioList list of name id strings
    */
  getFantasyPortfolio(intervalDays: number, portfolioList: Array<string>): Observable<{}> {
    return JSON.stringify(this.fantasyPortfolioCache) !== '{}' ? of(this.fantasyPortfolioCache) : this.refreshFantasyPortfolio(intervalDays, portfolioList);
  }

  /**
   * get fantasy portfolio player values over time
   * @param intervalDays number of days in the past to fetch
   * @param portfolioList list of name id strings
   */
  private refreshFantasyPortfolio(intervalDays: number, portfolioList: Array<string>): Observable<{}> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.fantasyPlayerApiConfigService.getFantasyPortfolioEndpoint, { intervalDays, portfolioList }, { headers: headers })
      .pipe(map((portfolio: any) => {
        portfolio.forEach(p => {
          this.fantasyPortfolioCache[p.name_id] = p.player_data;
        });
        return this.fantasyPortfolioCache;
      }));
  }

  /**
  * return all players in grid game based on search
  * @param search string to search on
  */
  getGridGamePlayersFromSearch(search: String): Observable<{ id: boolean, name: string, pos: string, start_year: string, end_year: string }[]> {
    return this.http.get<{ id: boolean, name: string, pos: string, start_year: string, end_year: string }[]>(this.fantasyPlayerApiConfigService.searchGridPlayersEndpoint + `?search=${search}`)
      .pipe(map(res => {
        return res;
      }));
  }

  /**
   * get historical gridirons
   */
  fetchHistoricalGridirons(): Observable<any[]> {
    return this.historicalGridirons ? of(this.historicalGridirons) : this.getHistoricalGridirons();
  }

  /**
   * return all players in grid game
   */
  private getHistoricalGridirons(): Observable<GridPlayer[]> {
    return this.http.get<GridPlayer[]>(this.fantasyPlayerApiConfigService.getHistoricalGridironsEndpoint)
      .pipe(map(res => {
        this.historicalGridirons = res;
        return res;
      }));
  }

  /**
   * get gridiron results
   */
  fetchAllGridironResults(id: number): Observable<any[]> {
    return this.gridironResults[id] ? of(this.gridironResults[id]) : this.getGridironResults(id);
  }

  /**
   * return all players in grid game
   */
  private getGridironResults(id: number): Observable<any[]> {
    return this.http.get<any[]>(this.fantasyPlayerApiConfigService.getAllGridResultsEndpoint + `?gridId=${id}`)
      .pipe(map(res => {
        this.gridironResults[id] = res;
        return res;
      }));
  }

  /**
  * return all players in grid game
  */
  postCorrectGridironAnswer(playerList: { playerId: number, cellNum: number, name: string, img: string }[], id: number = -1): Observable<GridPlayer[]> {
    return this.http.post<any>(this.fantasyPlayerApiConfigService.postCorrectAnswerEndpoint, { playerList, id })
      .pipe(map(res => {
        return res;
      }));
  }

  /**
   * get league format for league
   */
  fetchLeagueFormatForLeague(leagueId: string, season: number, format: any, settings: LeagueScoringDTO): Observable<any[]> {
    return this.leagueFormatCache?.[leagueId]?.[season] ? of(this.leagueFormatCache[leagueId][season]).pipe(delay(1000)) : this.getFetchLeagueFormatForLeague(leagueId, season, format, settings);
  }

  /**
   * return all players advance format metrics for league
   */
  private getFetchLeagueFormatForLeague(leagueId: string, seasonVal: number, format: any, settings: LeagueScoringDTO): Observable<any[]> {
    const startWeek = 1;
    const endWeek = 17;
    const season = seasonVal || 2022;
    return this.http.post<any[]>(this.fantasyPlayerApiConfigService.getLeagueFormatEndpoint, { season, startWeek, endWeek, format, settings })
      .pipe(map(res => {
        if (!this.leagueFormatCache) {
          this.leagueFormatCache = {};
        }
        if (!this.leagueFormatCache[leagueId]) {
          this.leagueFormatCache[leagueId] = {};
        }
        this.leagueFormatCache[leagueId][season] = res;
        return res;
      }));
  }

  /**
   * get non offense players
   * @param type players to fetch
   */
  fetchNonOffensePlayers(positions: string[]): Observable<any[]> {
    return this.nonOffensePlayers?.[positions.join('|')] ? of(this.nonOffensePlayers[positions.join('|')]) : this.getNonOffensePlayers(positions);
  }

  /**
   * return non offense players
   */
  private getNonOffensePlayers(positions: string[]): Observable<{}> {
    return this.http.get<any[]>(this.fantasyPlayerApiConfigService.getNonOffensePlayersEndpoint + `?positions=${positions}`)
      .pipe(map(res => {
        if (!this.nonOffensePlayers) {
          this.nonOffensePlayers = {};
        }
        const key = positions.join('|');
        if (!this.nonOffensePlayers[key]) {
          this.nonOffensePlayers[key] = {};
        }
        this.nonOffensePlayers[key] = res;
        return res;
      }));
  }

  /**
  * Add user leagues to database
  * @param user user platform with leagues
  * @param season year in string
  */
  postLeaguesToDatabase(user: FantasyPlatformDTO, season: string): Observable<void> {
    const leagues = [];
    user.leagues.forEach(l => {
      leagues.push({ leagueId: l.leagueId, season, platform: 'Sleeper' });
    });
    if (leagues.length === 0) return of();
    return this.http.post<any>(this.fantasyPlayerApiConfigService.postLeaguesToDatabaseEndpoint, { leagues })
      .pipe(map(res => {
        return res;
      }));
  }

  /**
   * Search trade database for trades
   * @param sideA list of sleeper ids
   * @param sideB list of sleeper ids
   * @param isSuperFlex list of boolean
   * @param starters starter count list
   * @param teams team count list
   * @param leagueType string type
   * @param ppr ppr list
   * @param tep tep list
   * @param page number page
   * @param pageLength page length
   */
  searchTradeDatabase(sideA: string[], sideB: string[], isSuperflex: boolean[], starters: number[], teams: number[], leagueType: string, ppr: number[], tep: number[], page: number, pageLength: number): Observable<any[]> {
    return this.http.post<any>(this.fantasyPlayerApiConfigService.searchTradeDatabaseEndpoint, { sideA, sideB, isSuperflex, starters, teams, leagueType, ppr, tep, page, pageLength })
      .pipe(map(res => {
        return res;
      }));
  }

  /**
   * Loades recent trade volumn from cache or api
   * @returns Observable of players trade volume
   */
  loadRecentTradeVolume(): Observable<any[]> {
    return this.tradeDatabaseVolume ? of(this.tradeDatabaseVolume) : this.refreshRecentTradeVolume();
  }

  /**
    * return recent trade volume from the trade database
    */
  private refreshRecentTradeVolume(): Observable<any[]> {
    return this.http.get<any[]>(this.fantasyPlayerApiConfigService.getRecentTradeVolumeEndpoint)
      .pipe(map(res => {
        this.tradeDatabaseVolume = res;
        return res;
      }));
  }

}
