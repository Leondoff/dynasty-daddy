import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ESPNApiConfigService {

  private _getESPNLeagueEndpoint = '';

  private _getESPNTransactionsEndpoint = '';

  get getESPNLeagueEndpoint(): string {
    return this._getESPNLeagueEndpoint;
  }

  set getESPNLeagueEndpoint(value: string) {
    this._getESPNLeagueEndpoint = value;
  }

  get getESPNTransactionsEndpoint(): string {
    return this._getESPNTransactionsEndpoint;
  }

  set getESPNTransactionsEndpoint(value: string) {
    this._getESPNTransactionsEndpoint = value;
  }
}
