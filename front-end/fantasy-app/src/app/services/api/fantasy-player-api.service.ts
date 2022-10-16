import {Injectable} from '@angular/core';
import {FantasyPlayer, FantasyPlayerDataPoint} from '../../model/FantasyPlayer';
import {HttpClient} from '@angular/common/http';
import {FantasyPlayerApiConfigService} from './fantasy-player-api-config.service';
import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';


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
    return this.http.get<FantasyPlayerDataPoint[]>(this.fantasyPlayerApiConfigService.getHistoricalPlayerValues + nameId + `?isAllTime=${isAllTime}`)
      .pipe(tap((players: FantasyPlayerDataPoint[]) => players
      ));
  }
}
