import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MflApiConfigService} from './mfl-api-config.service';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MflApiService {

  MFL_JSON_FORMAT = 'JSON=1';

  constructor(private http: HttpClient, private mflApiConfigService: MflApiConfigService) {
  }

  /**
   * fetches all config options for application
   */
  getMFLLeague(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.mflApiConfigService.getMFLBaseURL + year + '/export?TYPE=league&L=' +
      leagueId + '&APIKEY=&' + this.MFL_JSON_FORMAT).pipe(map(
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
  getMFLRosters(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.mflApiConfigService.getMFLBaseURL + year + '/export?TYPE=rosters&L=' +
      leagueId + '&APIKEY=&FRANCHISE=&W=&' + this.MFL_JSON_FORMAT).pipe(map(
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
  getMFLSchedules(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.mflApiConfigService.getMFLBaseURL + year + '/export?TYPE=schedule&L=' +
      leagueId + '&APIKEY=&W=&F=&' + this.MFL_JSON_FORMAT).pipe(map(
      (schedules: any) => {
        return schedules;
      }
    ));
  }

  /**
   * fetch playoff matches
   * @param year season
   * @param leagueId league id
   */
  getMFLPlayoffBrackets(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.mflApiConfigService.getMFLBaseURL + year + '/export?TYPE=playoffBrackets&L=' +
      leagueId + '&APIKEY=&' + this.MFL_JSON_FORMAT).pipe(map(
      (playoffs: any) => {
        return playoffs;
      }
    ));
  }

  /**
   * fetch transactions for season
   * @param year season
   * @param leagueId league id
   */
  getMFLTransactions(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.mflApiConfigService.getMFLBaseURL + year + '/export?TYPE=transactions&L=' +
      leagueId + '&APIKEY=&W=&TRANS_TYPE=&FRANCHISE=&DAYS=&COUNT=&' + this.MFL_JSON_FORMAT).pipe(map(
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
  getMFLDraftResults(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.mflApiConfigService.getMFLBaseURL + year + '/export?TYPE=draftResults&L=' +
      leagueId + '&APIKEY=&' + this.MFL_JSON_FORMAT).pipe(map(
      (draftResults: any) => {
        return draftResults;
      }
    ));
  }

  /**
   * fetch future draft picks
   * @param year season
   * @param leagueId league id
   */
  getMFLFutureDraftPicks(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.mflApiConfigService.getMFLBaseURL + year + '/export?TYPE=futureDraftPicks&L=' +
      leagueId + '&APIKEY=&' + this.MFL_JSON_FORMAT).pipe(map(
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
  getMFLLeagueStandings(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.mflApiConfigService.getMFLBaseURL + year + '/export?TYPE=leagueStandings&L=' +
      leagueId + '&APIKEY=&' + this.MFL_JSON_FORMAT).pipe(map(
      (standings: any) => {
        return standings;
      }
    ));
  }

  /**
   * fetch all players in mfl
   * @param year season
   * @param leagueId league id
   */
  getMFLPlayers(year: string, leagueId: string): Observable<any> {
    return this.http.get<any>(this.mflApiConfigService.getMFLBaseURL + year + '/export?TYPE=players&L=' +
      leagueId + '&APIKEY=&DETAILS=&SINCE=&PLAYERS=&' + this.MFL_JSON_FORMAT).pipe(map(
      (players: any) => {
        const playerMap = {};
        players.players.player.forEach(p => {
          const nameArr = p.name.split(', ');
          playerMap[p.id] = { position: p.position, full_name: nameArr[1] + ' ' + nameArr[0]};
        });
        return playerMap;
      }
    ));
  }
}
