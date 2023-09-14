import { Injectable } from '@angular/core';

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

  private _searchGridPlayersEndpoint = '';

  private _getAllGridPlayersEndpoint = '';

  private _validateSelectedPlayerEndpoint = '';

  private _getHistoricalGridironsEndpoint = '';

  private _postCorrectAnswerEndpoint = '';

  private _getAllGridResultsEndpoint = '';

  private _getLeagueFormatEndpoint = '';

  private _getNonOffensePlayersEndpoint = '';

  private _postLeaguesToDatabaseEndpoint = '';

  private _searchTradeDatabaseEndpoint = '';

  private _getRecentTradeVolumeEndpoint = '';

  get getPlayerValuesForTodayEndpoint(): string {
    return this._getPlayerValuesForTodayEndpoint;
  }

  set getPlayerValuesForTodayEndpoint(value: string) {
    this._getPlayerValuesForTodayEndpoint = value;
  }

  get getNonOffensePlayersEndpoint(): string {
    return this._getNonOffensePlayersEndpoint;
  }

  set getNonOffensePlayersEndpoint(value: string) {
    this._getNonOffensePlayersEndpoint = value;
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

  get validateSelectedPlayerEndpoint(): string {
    return this._validateSelectedPlayerEndpoint;
  }

  set validateSelectedPlayerEndpoint(value: string) {
    this._validateSelectedPlayerEndpoint = value;
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

  get getAllGridResultsEndpoint(): string {
    return this._getAllGridResultsEndpoint;
  }

  set getAllGridResultsEndpoint(value: string) {
    this._getAllGridResultsEndpoint = value;
  }

  get getLeagueFormatEndpoint(): string {
    return this._getLeagueFormatEndpoint;
  }

  set getLeagueFormatEndpoint(value: string) {
    this._getLeagueFormatEndpoint= value;
  }

  get postLeaguesToDatabaseEndpoint(): string {
    return this._postLeaguesToDatabaseEndpoint;
  }

  set postLeaguesToDatabaseEndpoint(value: string) {
    this._postLeaguesToDatabaseEndpoint= value;
  }

  get searchTradeDatabaseEndpoint(): string {
    return this._searchTradeDatabaseEndpoint;
  }

  set searchTradeDatabaseEndpoint(value: string) {
    this._searchTradeDatabaseEndpoint= value;
  }

  get getRecentTradeVolumeEndpoint(): string {
    return this._getRecentTradeVolumeEndpoint;
  }

  set getRecentTradeVolumeEndpoint(value: string) {
    this._getRecentTradeVolumeEndpoint = value;
  }
}
