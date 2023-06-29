import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FFPCApiConfigService {

  private _getFFPCLeagueEndpoint = '';

  private _getFFPCRostersEndpoint = '';

  private _getFFPCScheduleEndpoint = '';

  private _getFFPCLeagueStandingEndpoint = '';

  private _getFFPCDraftResultsEndpoint = '';

  private _getFFPCLeaguesForUser = '';

  private _getFFPCTransactionsEndpoint = '';

  get getFFPCLeagueEndpoint(): string {
    return this._getFFPCLeagueEndpoint;
  }

  set getFFPCLeagueEndpoint(value: string) {
    this._getFFPCLeagueEndpoint = value;
  }

  get getFFPCDraftResultsEndpoint(): string {
    return this._getFFPCDraftResultsEndpoint;
  }

  set getFFPCDraftResultsEndpoint(value: string) {
    this._getFFPCDraftResultsEndpoint = value;
  }

  get getFFPCLeaguesForUser(): string {
    return this._getFFPCLeaguesForUser;
  }

  set getFFPCLeaguesForUser(value: string) {
    this._getFFPCLeaguesForUser = value;
  }

  get getFFPCLeagueStandingEndpoint(): string {
    return this._getFFPCLeagueStandingEndpoint;
  }

  set getFFPCLeagueStandingEndpoint(value: string) {
    this._getFFPCLeagueStandingEndpoint = value;
  }

  get getFFPCTransactionsEndpoint(): string {
    return this._getFFPCTransactionsEndpoint;
  }

  set getFFPCTransactionsEndpoint(value: string) {
    this._getFFPCTransactionsEndpoint = value;
  }

  get getFFPCRostersEndpoint(): string {
    return this._getFFPCRostersEndpoint;
  }

  set getFFPCRostersEndpoint(value: string) {
    this._getFFPCRostersEndpoint = value;
  }

  get getFFPCScheduleEndpoint(): string {
    return this._getFFPCScheduleEndpoint;
  }

  set getFFPCScheduleEndpoint(value: string) {
    this._getFFPCScheduleEndpoint = value;
  }
}
