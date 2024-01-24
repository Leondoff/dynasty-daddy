import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { GridPlayer } from 'src/app/components/model/gridPlayer';
import { TriviaApiConfigService } from './trivia-api-config.service';



@Injectable({
    providedIn: 'root'
})
export class TriviaApiService {

    /** historical gridirons cache */
    private historicalGridirons;

    /** gridiron results cache */
    private gridironResults = {};

    constructor(private http: HttpClient, private triviaApiConfigService: TriviaApiConfigService) {
    }

    /**
    * return all players in grid game based on search
    * @param search string to search on
    */
    getGridGamePlayersFromSearch(search: String): Observable<{ id: boolean, name: string, pos: string, start_year: string, end_year: string }[]> {
        return this.http.get<{ id: boolean, name: string, pos: string, start_year: string, end_year: string }[]>(this.triviaApiConfigService.searchGridPlayersEndpoint + `?search=${search}`)
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
        return this.http.get<GridPlayer[]>(this.triviaApiConfigService.getHistoricalGridironsEndpoint)
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
        return this.http.get<any[]>(this.triviaApiConfigService.getAllGridResultsEndpoint + `?gridId=${id}`)
            .pipe(map(res => {
                this.gridironResults[id] = res;
                return res;
            }));
    }

    /**
    * return all players in grid game
    */
    postCorrectGridironAnswer(playerList: { playerId: number, cellNum: number, name: string, img: string }[], id: number = -1): Observable<GridPlayer[]> {
        return this.http.post<any>(this.triviaApiConfigService.postCorrectAnswerEndpoint, { playerList, id })
            .pipe(map(res => {
                return res;
            }));
    }

    getEventLeaderboard(eventId: number): Observable<any[]> {
        return this.http.get<any[]>(this.triviaApiConfigService.getLeaderboardEndpoint + `?eventId=${eventId}`)
            .pipe(map(res => {
                return res;
            }));
    }

    saveEventGame(eventId: number, name: string, eventCode: string, playerList: any[]): Observable<any[]> {
        return this.http.post<any[]>(this.triviaApiConfigService.saveEventGameEndpoint, {
            eventId,
            name,
            eventCode,
            gameJson: { "grid": playerList }
        })
            .pipe(map(res => {
                return res;
            }));
    }


}