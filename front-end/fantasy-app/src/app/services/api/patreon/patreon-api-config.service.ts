import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class PatreonAPIConfigService {

  // tslint:disable-next-line:variable-name
  private _getTokenForCodeEndpoint = '';

  private _addLeaguesToUserEndpoint = '';

  private _addPRPresetsToUserEndpoint = '';

  private _addLFPresetsToUserEndpoint = '';

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

  get addPRPresetsToUserEndpoint(): string {
    return this._addPRPresetsToUserEndpoint;
  }

  set addPRPresetsToUserEndpoint(value: string) {
    this._addPRPresetsToUserEndpoint = value;
  }

  get addLFPresetsToUserEndpoint(): string {
    return this._addLFPresetsToUserEndpoint;
  }

  set addLFPresetsToUserEndpoint(value: string) {
    this._addLFPresetsToUserEndpoint = value;
  }
}
