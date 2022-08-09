import {Injectable} from '@angular/core';
import LogRocket from 'logrocket';

@Injectable({
  providedIn: 'root'
})
export class LogRocketService {

  constructor() {
  }

  /**
   * identify logrocket session when logging in
   * @param identifier string indentifier
   */
  identifySession(identifier: string): void {
    if (!window.location.origin.includes('localhost')) {
      console.log('identify log rocket session', identifier);
      LogRocket.identify(identifier, {
        username: identifier,
      });
    }
  }
}
