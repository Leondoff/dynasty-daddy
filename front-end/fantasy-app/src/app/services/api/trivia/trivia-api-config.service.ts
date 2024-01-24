import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TriviaApiConfigService {

  private _getLeaderboardEndpoint = '';

  private _saveEventGameEndpoint = '';

  private _getHistoricalGridironsEndpoint = '';

  private _searchGridPlayersEndpoint = '';

  private _getAllGridPlayersEndpoint = '';

  private _getAllGridResultsEndpoint = '';

  private _postCorrectAnswerEndpoint = '';

  get getLeaderboardEndpoint(): string {
    return this._getLeaderboardEndpoint;
  }

  set getLeaderboardEndpoint(value: string) {
    this._getLeaderboardEndpoint = value;
  }

  get saveEventGameEndpoint(): string {
    return this._saveEventGameEndpoint;
  }

  set saveEventGameEndpoint(value: string) {
    this._saveEventGameEndpoint = value;
  }

  get searchGridPlayersEndpoint(): string {
    return this._searchGridPlayersEndpoint;
  }

  set searchGridPlayersEndpoint(value: string) {
    this._searchGridPlayersEndpoint = value;
  }

  get getAllGridPlayersEndpoint(): string {
    return this._getAllGridPlayersEndpoint;
  }

  set getAllGridPlayersEndpoint(value: string) {
    this._getAllGridPlayersEndpoint = value;
  }

  get getAllGridResultsEndpoint(): string {
    return this._getAllGridResultsEndpoint;
  }

  set getAllGridResultsEndpoint(value: string) {
    this._getAllGridResultsEndpoint = value;
  }

  get getHistoricalGridironsEndpoint(): string {
    return this._getHistoricalGridironsEndpoint;
  }

  set getHistoricalGridironsEndpoint(value: string) {
    this._getHistoricalGridironsEndpoint = value;
  }

  get postCorrectAnswerEndpoint(): string {
    return this._postCorrectAnswerEndpoint;
  }

  set postCorrectAnswerEndpoint(value: string) {
    this._postCorrectAnswerEndpoint = value;
  }

}