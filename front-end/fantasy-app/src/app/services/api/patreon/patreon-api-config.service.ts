import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
  export class PatreonAPIConfigService {
  
    // tslint:disable-next-line:variable-name
    private _getTokenForCodeEndpoint = '';

    get getTokenForCodeEndpoint(): string {
        return this._getTokenForCodeEndpoint;
      }
    
      set getTokenForCodeEndpoint(value: string) {
        this._getTokenForCodeEndpoint = value;
      }

  }