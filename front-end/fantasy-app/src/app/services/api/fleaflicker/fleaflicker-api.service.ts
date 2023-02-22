import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FleaflickerApiConfigService } from './fleaflicker-api-config.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FleaflickerApiService {

  constructor(private http: HttpClient, private fleaflickerApiConfigService: FleaflickerApiConfigService) {
  }

  /**
   * fetches all config options for application
   * @param leagueId id of league to fetch
   */
  getFFLeague(leagueId: string): Observable<any> {
    return this.http.get<any>(this.fleaflickerApiConfigService.getFFLeagueEndpoint + '?leagueId=' + leagueId).pipe(map(
      (league: any) => {
        return league;
      }
    ));
  }

  /**
   * fetch additional roster information for league
   * @param year season
   * @param leagueId league id
   */
  getFFRosters(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.fleaflickerApiConfigService.getFFRostersEndpoint + '?leagueId=' + leagueId + '&year=' + year).pipe(map(
      (roster: any) => {
        return roster;
      }
    ));
  }

  /**
   * fetch team schedules
   * @param year season
   * @param leagueId league id
   * @param week string of week num
   */
  getFFSchedules(year: string, leagueId: string, week: string): Observable<any> {
    return this.http.get<any>(this.fleaflickerApiConfigService.getFFScheduleEndpoint + '?leagueId=' + leagueId + '&year=' + year + '&week=' + week).pipe(map(
      (schedules: any) => {
        return schedules;
      }
    ));
  }

  /**
   * fetch transactions for season
   * @param leagueId league id
   * @param offset result offset
   */
  getFFTransactions(leagueId: string, offset: string): Observable<any> {
    return this.http.get<any>(this.fleaflickerApiConfigService.getFFTransactionsEndpoint + '?leagueId=' + leagueId + '&offset=' + offset).pipe(map(
      (transactions: any) => {
        return transactions;
      }
    ));
  }

  /**
   * fetch draft results from league
   * @param year season
   * @param leagueId league id
   */
  getFFDraftResults(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.fleaflickerApiConfigService.getFFDraftResultsEndpoint + '?leagueId=' + leagueId + '&year=' + year).pipe(map(
      (draftResults: any) => {
        return draftResults;
      }
    ));
  }

  /**
   * fetch future draft picks
   * @param year season
   * @param leagueId league id
   * @param teamId team id
   */
  getFFFutureDraftPicks(year: string, leagueId: string, teamId: string): Observable<any> {
    return this.http.get<any>(this.fleaflickerApiConfigService.getFFFutureDraftPicksEndpoint + '?leagueId=' + leagueId + '&year=' + year + '&teamId=' + teamId).pipe(map(
      (futures: any) => {
        return futures;
      }
    ));
  }

  /**
   * fetch additional team standings information
   * @param year season
   * @param leagueId league id
   */
  getFFLeagueStandings(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.fleaflickerApiConfigService.getFFLeagueStandingEndpoint + '?leagueId=' + leagueId + '&year=' + year).pipe(map(
      (standings: any) => {
        return standings;
      }
    ));
  }

  /**
   * fetch league trades
   * @param year season
   * @param leagueId league id
   * @param offset number offset to return
   */
  getFFTrades(year: string, leagueId: string, offset: string): Observable<any> {
    return this.http.get<any>(this.fleaflickerApiConfigService.getFFTradesEndpoint + '?leagueId=' + leagueId + '&year=' + year + '&offset=' + offset).pipe(map(
      (trades: any) => {
        return trades;
      }
    ));
  }

  /**
   * fetch leagues for user in fleaflicker
   * @param year season
   * @param email user email
   */
    getFFUserLeagues(year: string, email: string): Observable<any> {
      return this.http.get<any>(this.fleaflickerApiConfigService.getUserLeagueEndpoint + '?email=' + email + '&year=' + year).pipe(map(
        (roster: any) => {
          return roster;
        }
      ));
    }
  
}
