import { Injectable } from '@angular/core';
import { EndpointsService } from '../endpoints.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ConfigOption } from '../../model/config/ConfigOption';
import { ConfigApiService } from '../api/config/config-api.service';
import { BaseComponent } from '../../components/base-component.abstract';
import { DisplayService } from '../utilities/display.service';

/**
 * dictionary of constant config value keys
 */
export const ConfigKeyDictionary = {
  SHOW_HOME_DIALOG: 'show_home_dialog',
  HOME_DIALOG_HEADER: 'home_dialog_header',
  HOME_DIALOG_BODY: 'home_dialog_body',
  HOME_DIALOG_BG_COLOR: 'home_dialog_bg_color',
  DEMO_LEAGUE_ID: 'demo_league_id',
  ENABLE_WRAPPED: 'enable_wrapped',
  PREFERRED_CREATORS: 'preferred_creators',
  SHOW_HEADER_INFO: 'show_header_info',
  HEADER_INFO_TEXT: 'header_info_text',
  HEADER_INFO_URL: 'header_info_url'
} as const;

@Injectable({
  providedIn: 'root'
})
export class ConfigService extends BaseComponent {

  private _isMobile: boolean = false;

  private _showHeaderInfo: boolean = false;

  private _headerInfoText: string = '';

  private _headerInfoURL: string = '';

  private _preferredCreators: PreferredCreatorSlide[] = [];

  /** config options list for application */
  configOptions: ConfigOption[] = [];

  constructor(private endpointsService: EndpointsService,
    private deviceDetectorService: DeviceDetectorService,
    private displayService: DisplayService,
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

  get preferredCreators(): PreferredCreatorSlide[] {
    return this._preferredCreators;
  }

  checkIfMobile = () =>
    this._isMobile = this.deviceDetectorService.isMobile()

  applyConfigs(): void {
    // assign endpoints
    this.endpointsService.assignEndpoints();
    // load config options
    this.addSubscriptions(this.configApiService.fetchAllConfigOptions().subscribe((options) => {
      this.configOptions = options;
      this._showHeaderInfo = this.getConfigOptionByKey(ConfigKeyDictionary.SHOW_HEADER_INFO)?.configValue === 'true';
      this._headerInfoText = this.getConfigOptionByKey(ConfigKeyDictionary.HEADER_INFO_TEXT)?.configValue;
      this._headerInfoURL = this.getConfigOptionByKey(ConfigKeyDictionary.HEADER_INFO_URL)?.configValue;
      this._preferredCreators = this.formatPreferredCreators();
      
    }
    ));
  }

  /**
   * format preferred creators and return them randomized
   */
  formatPreferredCreators(): PreferredCreatorSlide[] {
    const rawCreators = JSON.parse(this.getConfigOptionByKey(ConfigKeyDictionary.PREFERRED_CREATORS).configValue);
    return [...this.displayService.shuffle(rawCreators.slice(0, rawCreators.length - 1)), ...[rawCreators[rawCreators.length - 1]]];
  }

  /**
   * fetch config option from config key.
   * @param key config key to look up
   */
  getConfigOptionByKey = (key: string): ConfigOption =>
    this.configOptions.find((option) => option.configKey === key)
}

export class PreferredCreatorSlide { url: string; image: string; alt: string; icon: string }
