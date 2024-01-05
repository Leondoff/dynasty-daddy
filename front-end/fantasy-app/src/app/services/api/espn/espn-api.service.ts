import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ESPNApiConfigService } from './espn-api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ESPNApiService {

  constructor(
    private http: HttpClient,
    private espnApiConfigService: ESPNApiConfigService
  ) {
  }

  /**
   * Retrieves ESPN league data for a specific year and league ID.
   *
   * @param season - The year of the ESPN League.
   * @param leagueId - The ESPN League ID.
   * @param espnS2 - ESPN S2 cookie for authentication (optional).
   * @param swid - ESPN SWID cookie for authentication (optional).
   *
   * @returns An Observable containing the ESPN league data.
   */
  getESPNLeague(season: string, leagueId: string, espnS2: string = null, swid: string = null): Observable<any> {

    // Make the HTTP request with the specified options
    return this.http.post<any>(this.espnApiConfigService.getESPNLeagueEndpoint, { season, leagueId, espnS2, swid }).pipe(
      map((league: any) => {
        return league;
      })
    );
  }

  /**
   * Fetch transactions for a ESPN league
   * @param season season to load
   * @param leagueId league to load
   * @param week week to pull transactions for
   */
  getTransactionsForWeek(season: string, leagueId: string, week: number, espnS2: string = null, swid: string = null): Observable<any> {
    return this.http.post<any>(this.espnApiConfigService.getESPNTransactionsEndpoint, { season, leagueId, week, swid, espnS2 }).pipe(map(
      (transactions: any) => {
        return transactions?.transactions?.filter(t => ['WAIVER', 'FREEAGENT', 'TRADE_ACCEPT'].includes(t.type) && t.status == 'EXECUTED' && t.items.length > 0) || [];
      }
    ));
  }

}
