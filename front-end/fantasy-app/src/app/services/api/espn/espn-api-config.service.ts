import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ESPNApiConfigService {

  private _getESPNLeagueEndpoint = '';


  get getESPNLeagueEndpoint(): string {
    return this._getESPNLeagueEndpoint;
  }

  set getESPNLeagueEndpoint(value: string) {
    this._getESPNLeagueEndpoint = value;
  }
}
