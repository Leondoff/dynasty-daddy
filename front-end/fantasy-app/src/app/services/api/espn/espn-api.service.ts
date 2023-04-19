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

  constructor(private http: HttpClient, private espnApiConfigService: ESPNApiConfigService) {
  }

  /**
   * fetches all config options for application
   * @param year season to load
   * @param leagueId id of league to fetch
   */
  getESPNLeague(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.espnApiConfigService.getESPNLeagueEndpoint.replace('SELECTED_YEAR', year).replace('LEAGUE_ID', leagueId)).pipe(map(
      (league: any) => {
        return league;
      }
    ));
  }
  
}
