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


  get getHistoricalPlayerValues(): string {
    return this._getHistoricalPlayerValues;
  }

  set getHistoricalPlayerValues(value: string) {
    this._getHistoricalPlayerValues = value;
  }
}
