import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import 'chartjs-plugin-colorschemes';
import { EndpointsService } from './services/endpoints.service';
import { ConfigService } from './services/init/config.service';
import { StartupService } from './services/init/startup.service';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { AboutComponent } from './components/about/about.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';
import { environment } from '../environments';
import { EditLeagueSettingsModalComponent } from './components/modals/edit-league-settings-modal/edit-league-settings-modal.component';
import { StandardPageComponent } from './components/standard-page/standard-page.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ConfirmationDialogModal } from './components/modals/confirmation-dialog/confirmation-dialog.component';
import { SharedModule } from './modules/shared/shared.module';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HomeComponent } from './components/home/home.component';
import * as Sentry from "@sentry/angular-ivy";
import { Router } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { PwaService } from './services/utilities/pwa.service';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';

export function initialize(startupService: StartupService): any {
  return (): Promise<any> => {
    return startupService.startupApplication();
  };
}

// tslint:disable-next-line:prefer-const
let UniversalDeviceDetectorService;

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    AboutComponent,
    SidebarComponent,
    PrivacyPolicyComponent,
    EditLeagueSettingsModalComponent,
    StandardPageComponent,
    ConfirmationDialogModal,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
    AppRoutingModule,
    NgxGoogleAnalyticsModule.forRoot(environment.gaMeasurementId),
    NgxGoogleAnalyticsRouterModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [EndpointsService,
    ConfigService,
    StartupService,
    PwaService,
    {
      provide: APP_INITIALIZER,
      useFactory: initialize,
      deps: [StartupService],
      multi: true,
    },
    {
      provide: DeviceDetectorService,
      useClass: UniversalDeviceDetectorService
    },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false,
      }),
    }, {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
