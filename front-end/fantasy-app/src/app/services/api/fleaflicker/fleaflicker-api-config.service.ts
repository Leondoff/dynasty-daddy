import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FleaflickerApiConfigService {

  private _getFFLeagueEndpoint = '';

  private _getFFRostersEndpoint = '';

  private _getFFScheduleEndpoint = '';

  private _getFFLeagueStandingEndpoint = '';

  private _getFFDraftResultsEndpoint = '';

  private _getFFFutureDraftPicksEndpoint = '';

  private _getFFTransactionsEndpoint = '';

  private _getFFTradesEndpoint = '';

  private _getUserLeagueEndpoint = '';

  get getFFLeagueEndpoint(): string {
    return this._getFFLeagueEndpoint;
  }

  set getFFLeagueEndpoint(value: string) {
    this._getFFLeagueEndpoint = value;
  }

  get getUserLeagueEndpoint(): string {
    return this._getUserLeagueEndpoint;
  }

  set getUserLeagueEndpoint(value: string) {
    this._getUserLeagueEndpoint = value;
  }

  get getFFDraftResultsEndpoint(): string {
    return this._getFFDraftResultsEndpoint;
  }

  set getFFDraftResultsEndpoint(value: string) {
    this._getFFDraftResultsEndpoint = value;
  }

  get getFFLeagueStandingEndpoint(): string {
    return this._getFFLeagueStandingEndpoint;
  }

  set getFFLeagueStandingEndpoint(value: string) {
    this._getFFLeagueStandingEndpoint = value;
  }

  get getFFFutureDraftPicksEndpoint(): string {
    return this._getFFFutureDraftPicksEndpoint;
  }

  set getFFFutureDraftPicksEndpoint(value: string) {
    this._getFFFutureDraftPicksEndpoint = value;
  }

  get getFFTransactionsEndpoint(): string {
    return this._getFFTransactionsEndpoint;
  }

  set getFFTransactionsEndpoint(value: string) {
    this._getFFTransactionsEndpoint = value;
  }

  get getFFRostersEndpoint(): string {
    return this._getFFRostersEndpoint;
  }

  set getFFRostersEndpoint(value: string) {
    this._getFFRostersEndpoint = value;
  }

  get getFFScheduleEndpoint(): string {
    return this._getFFScheduleEndpoint;
  }

  set getFFScheduleEndpoint(value: string) {
    this._getFFScheduleEndpoint = value;
  }

  get getFFTradesEndpoint(): string {
    return this._getFFTradesEndpoint;
  }

  set getFFTradesEndpoint(value: string) {
    this._getFFTradesEndpoint = value;
  }
}
