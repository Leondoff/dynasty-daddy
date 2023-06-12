import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MflApiConfigService {

  private _getMFLLeagueEndpoint = '';

  private _getMFLRostersEndpoint = '';

  private _getMFLScheduleEndpoint = '';

  private _getMFLLeagueStandingEndpoint = '';

  private _getMFLDraftResultsEndpoint = '';

  private _getMFLLeaguesForUser = '';

  private _getMFLFutureDraftPicksEndpoint = '';

  private _getMFLPlayersEndpoint = '';

  private _getMFLTransactionsEndpoint = '';

  private _postMFLWaiverMoveEndpoint = '';

  get getMFLLeagueEndpoint(): string {
    return this._getMFLLeagueEndpoint;
  }

  set getMFLLeagueEndpoint(value: string) {
    this._getMFLLeagueEndpoint = value;
  }

  get getMFLDraftResultsEndpoint(): string {
    return this._getMFLDraftResultsEndpoint;
  }

  set getMFLDraftResultsEndpoint(value: string) {
    this._getMFLDraftResultsEndpoint = value;
  }

  get getMFLLeaguesForUser(): string {
    return this._getMFLLeaguesForUser;
  }

  set getMFLLeaguesForUser(value: string) {
    this._getMFLLeaguesForUser = value;
  }

  get getMFLLeagueStandingEndpoint(): string {
    return this._getMFLLeagueStandingEndpoint;
  }

  set getMFLLeagueStandingEndpoint(value: string) {
    this._getMFLLeagueStandingEndpoint = value;
  }

  get getMFLFutureDraftPicksEndpoint(): string {
    return this._getMFLFutureDraftPicksEndpoint;
  }

  set getMFLFutureDraftPicksEndpoint(value: string) {
    this._getMFLFutureDraftPicksEndpoint = value;
  }

  get getMFLPlayersEndpoint(): string {
    return this._getMFLPlayersEndpoint;
  }

  set getMFLPlayersEndpoint(value: string) {
    this._getMFLPlayersEndpoint = value;
  }

  get getMFLTransactionsEndpoint(): string {
    return this._getMFLTransactionsEndpoint;
  }

  set getMFLTransactionsEndpoint(value: string) {
    this._getMFLTransactionsEndpoint = value;
  }

  get getMFLRostersEndpoint(): string {
    return this._getMFLRostersEndpoint;
  }

  set getMFLRostersEndpoint(value: string) {
    this._getMFLRostersEndpoint = value;
  }

  get postMFLWaiverMoveEndpoint(): string {
    return this._postMFLWaiverMoveEndpoint;
  }

  set postMFLWaiverMoveEndpoint(value: string) {
    this._postMFLWaiverMoveEndpoint = value;
  }

  get getMFLScheduleEndpoint(): string {
    return this._getMFLScheduleEndpoint;
  }

  set getMFLScheduleEndpoint(value: string) {
    this._getMFLScheduleEndpoint = value;
  }
}
