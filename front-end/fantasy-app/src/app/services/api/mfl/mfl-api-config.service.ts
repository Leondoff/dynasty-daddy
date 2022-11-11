import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class MflApiConfigService {

  private _getMFLBaseURL = '';

  get getMFLBaseURL(): string {
    return this._getMFLBaseURL;
  }

  set getMFLBaseURL(value: string) {
    this._getMFLBaseURL = value;
  }
}
