import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FFPCApiConfigService } from './ffpc-api-config.service';

@Injectable({
  providedIn: 'root'
})
export class FFPCApiService {

  constructor(
    private http: HttpClient,
    private ffpcApiConfigService: FFPCApiConfigService
  ) {
  }

  /**
   * fetches all config options for application
   * @param leagueId id of league to fetch
   */
  getFFPCLeague(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.ffpcApiConfigService.getFFPCLeagueEndpoint + '?leagueId=' + leagueId + '&year=' + year).pipe(map(
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
  getFFPCRosters(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.ffpcApiConfigService.getFFPCRostersEndpoint + '?leagueId=' + leagueId + '&year=' + year).pipe(map(
      (roster: any) => {
        return roster;
      }
    ));
  }

  /**
   * fetch team schedules
   * @param year season
   * @param leagueId league id
   */
  getFFPCSchedules(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.ffpcApiConfigService.getFFPCScheduleEndpoint + '?leagueId=' + leagueId + '&year=' + year).pipe(map(
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
  getFFPCTransactions(leagueId: string, offset: string): Observable<any> {
    return this.http.get<any>(this.ffpcApiConfigService.getFFPCTransactionsEndpoint + '?leagueId=' + leagueId + '&offset=' + offset).pipe(map(
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
  getFFPCDraftResults(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.ffpcApiConfigService.getFFPCDraftResultsEndpoint + '?leagueId=' + leagueId + '&year=' + year).pipe(map(
      (draftResults: any) => {
        return draftResults;
      }
    ));
  }

  /**
   * fetch additional team standings information
   * @param year season
   * @param leagueId league id
   */
  getFFPCLeagueStandings(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.ffpcApiConfigService.getFFPCLeagueStandingEndpoint + '?leagueId=' + leagueId + '&year=' + year).pipe(map(
      (standings: any) => {
        return standings;
      }
    ));
  }

  /**
   * fetch leagues for user in ffpc
   * @param year season
   * @param email user email
   */
    getFFPCUserLeagues(year: string, email: string): Observable<any> {
      return this.http.get<any>(this.ffpcApiConfigService.getFFPCLeaguesForUser + '?email=' + email + '&year=' + year).pipe(map(
        (roster: any) => {
          return roster;
        }
      ));
    }
}
