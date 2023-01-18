import {Injectable} from '@angular/core';
import {EndpointsService} from '../endpoints.service';
import {DeviceDetectorService} from 'ngx-device-detector';
import {ConfigOption} from '../../model/config/ConfigOption';
import {ConfigApiService} from '../api/config/config-api.service';
import {BaseComponent} from '../../components/base-component.abstract';

/**
 * dictionary of constant config value keys
 */
export const ConfigKeyDictionary = {
  SHOW_HOME_DIALOG: 'show_home_dialog',
  HOME_DIALOG_HEADER: 'home_dialog_header',
  HOME_DIALOG_BODY: 'home_dialog_body',
  HOME_DIALOG_BG_COLOR: 'home_dialog_bg_color',
  DEMO_LEAGUE_ID: 'demo_league_id',
  ENABLE_WRAPPED: 'enable_wrapped'
} as const;

@Injectable({
  providedIn: 'root'
})
export class ConfigService extends BaseComponent {

  private _isMobile: boolean = false;

  private _showHeaderInfo: boolean = false;

  private _headerInfoText: string = '';

  private _headerInfoURL: string = '';

  /** config options list for application */
  configOptions: ConfigOption[] = [];

  constructor(private endpointsService: EndpointsService,
              private deviceDetectorService: DeviceDetectorService,
              private configApiService: ConfigApiService
  ) {
    super();
  }

  get isMobile(): boolean {
    return this._isMobile;
  }

  get isShowInfoHeader(): boolean {
    return this._showHeaderInfo;
  }

  get headerInfoText(): string {
    return this._headerInfoText;
  }

  get headerInfoURL(): string {
    return this._headerInfoURL;
  }

  checkIfMobile = () =>
    this._isMobile = this.deviceDetectorService.isMobile()

  applyConfigs(): void {
    // assign endpoints
    this.endpointsService.assignEndpoints();
    // load config options
    this.addSubscriptions(this.configApiService.fetchAllConfigOptions().subscribe((options) => {
        this.configOptions = options;
        this._showHeaderInfo = this.getConfigOptionByKey('show_header_info')?.configValue === 'true';
        this._headerInfoText = this.getConfigOptionByKey('header_info_text')?.configValue;
        this._headerInfoURL = this.getConfigOptionByKey('header_info_url')?.configValue;
      }
    ));
  }

  /**
   * fetch config option from config key.
   * @param key config key to look up
   */
  getConfigOptionByKey = (key: string): ConfigOption =>
    this.configOptions.find((option) => option.configKey === key)
}
