import { Injectable } from '@angular/core';
import { FantasyMarket, FantasyPlayer, FantasyPlayerDataPoint } from '../../model/assets/FantasyPlayer';
import { HttpClient } from '@angular/common/http';
import { FantasyPlayerApiConfigService } from './fantasy-player-api-config.service';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';


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
   * cache player values that have been loaded
   */
  private playerValuesDict = {};

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
  getPlayerDetailsByNameId(nameId: string): Observable<{historicalValues: FantasyPlayerDataPoint[], profile: any}> {
    return this.http.get<{historicalValues: FantasyPlayerDataPoint[], profile: any}>(this.fantasyPlayerApiConfigService.getPlayerDetailsEndpoint + nameId)
      .pipe(tap((player: {historicalValues: FantasyPlayerDataPoint[], profile: any}) => player));
  }
}
