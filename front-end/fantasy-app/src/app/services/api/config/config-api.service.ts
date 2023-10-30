import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {ConfigApiConfigService} from './config-api-config.service';
import {ConfigOption} from '../../../model/config/ConfigOption';
import {catchError, map} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ConfigApiService {

  constructor(private http: HttpClient, private configApiConfigService: ConfigApiConfigService) {
  }

  /**
   * fetches all config options for application
   */
  fetchAllConfigOptions(): Observable<ConfigOption[]> {
    return this.http.get<any>(this.configApiConfigService.getConfigOptionsEndpoint).pipe(map(
      (options: any[]) => {
        const configOptions: ConfigOption[] = [];
        options.map(option => configOptions.push(new ConfigOption(option.config_key, option.config_value)));
        return configOptions;
      }
    ),
    catchError(error => {
      console.error('Error while fetching config options:', error);
      return throwError('An error occurred while fetching config options.');
    }));
  }
}
