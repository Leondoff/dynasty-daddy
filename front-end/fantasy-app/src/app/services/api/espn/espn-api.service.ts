import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ESPNApiConfigService } from './espn-api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ESPNApiService {

  viewsToPull: string = '?view=mDraftDetail&view=mLiveScoring&view=mMatchupScore&view=mPendingTransactions&view=mPositionalRatings&view=mRoster&view=mSettings&view=mTeam&view=modular&view=mNav';

  transactionsView: string = '?scoringPeriodId=${week}&view=mTransactions2';

  constructor(private http: HttpClient, private espnApiConfigService: ESPNApiConfigService) {
  }

  /**
   * fetches all config options for application
   * @param year season to load
   * @param leagueId id of league to fetch
   */
  getESPNLeague(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.espnApiConfigService.getESPNLeagueEndpoint.replace('SELECTED_YEAR', year).replace('LEAGUE_ID', leagueId) + this.viewsToPull).pipe(map(
      (league: any) => {
        return league;
      }
    ));
  }

  /**
   * Fetch transactions for a ESPN league
   * @param year season to load
   * @param leagueId league to load
   * @param week week to pull transactions for
   */
  getTransactionsForWeek(year: string, leagueId: string, week: number): Observable<any> {
    return this.http.get<any>(this.espnApiConfigService.getESPNLeagueEndpoint.replace('SELECTED_YEAR', year).replace('LEAGUE_ID', leagueId) + this.transactionsView.replace('${week}', week.toString())).pipe(map(
      (transactions: any) => {
        return transactions?.transactions?.filter(t => ['WAIVER', 'FREEAGENT', 'TRADE'].includes(t.type) && t.status == 'EXECUTED') || [];
      }
    ));
  }
  
}
