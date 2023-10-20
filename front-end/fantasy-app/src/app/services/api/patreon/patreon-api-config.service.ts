import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class PatreonAPIConfigService {

  // tslint:disable-next-line:variable-name
  private _getTokenForCodeEndpoint = '';

  private _addLeaguesToUserEndpoint = '';

  get getUserFromPatreonEndpoint(): string {
    return this._getTokenForCodeEndpoint;
  }

  set getUserFromPatreonEndpoint(value: string) {
    this._getTokenForCodeEndpoint = value;
  }
  
  get addLeaguesToUserEndpoint(): string {
    return this._addLeaguesToUserEndpoint;
  }

  set addLeaguesToUserEndpoint(value: string) {
    this._addLeaguesToUserEndpoint = value;
  }
}
