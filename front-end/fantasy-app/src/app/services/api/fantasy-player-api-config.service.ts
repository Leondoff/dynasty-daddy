import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FantasyPlayerApiConfigService {

  // tslint:disable-next-line:variable-name
  private _getPlayerValuesForTodayEndpoint = '';

  private _getPrevPlayerValuesEndpoint = '';

  private _getHistoricalPlayerValues = '';

  private _getPlayerValuesForMarket = '';

  private _getPlayerDetailsEndpoint = '';

  private _getFantasyPortfolioEndpoint = '';

  private _getGridPlayersEndpoint = '';

  private _validateSelectedPlayerEndpoint = '';

  get getPlayerValuesForTodayEndpoint(): string {
    return this._getPlayerValuesForTodayEndpoint;
  }

  set getPlayerValuesForTodayEndpoint(value: string) {
    this._getPlayerValuesForTodayEndpoint = value;
  }

  get getPlayerValuesForMarketEndpoint(): string {
    return this._getPlayerValuesForMarket;
  }

  set getPlayerValuesForMarketEndpoint(value: string) {
    this._getPlayerValuesForMarket = value;
  }

  get getPrevPlayerValuesEndpoint(): string {
    return this._getPrevPlayerValuesEndpoint;
  }

  set getPrevPlayerValuesEndpoint(value: string) {
    this._getPrevPlayerValuesEndpoint = value;
  }

  get getHistoricalPlayerValuesEndpoint(): string {
    return this._getHistoricalPlayerValues;
  }

  set getHistoricalPlayerValuesEndpoint(value: string) {
    this._getHistoricalPlayerValues = value;
  }

  get getPlayerDetailsEndpoint(): string {
    return this._getPlayerDetailsEndpoint;
  }

  set getPlayerDetailsEndpoint(value: string) {
    this._getPlayerDetailsEndpoint = value;
  }

  get getFantasyPortfolioEndpoint(): string {
    return this._getFantasyPortfolioEndpoint;
  }

  set getFantasyPortfolioEndpoint(value: string) {
    this._getFantasyPortfolioEndpoint = value;
  }

  get getGridPlayersEndpoint(): string {
    return this._getGridPlayersEndpoint;
  }

  set getGridPlayersEndpoint(value: string) {
    this._getGridPlayersEndpoint = value;
  }

  get validateSelectedPlayerEndpoint(): string {
    return this._validateSelectedPlayerEndpoint;
  }

  set validateSelectedPlayerEndpoint(value: string) {
    this._validateSelectedPlayerEndpoint = value;
  }
}
