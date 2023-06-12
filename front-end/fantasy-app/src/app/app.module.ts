import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { EndpointsService } from './services/endpoints.service';
import { ConfigService } from './services/init/config.service';
import { StartupService } from './services/init/startup.service';
import { HomeComponent } from './components/home/home.component';
import { PowerRankingsComponent } from './components/power-rankings/power-rankings.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './components/header/header.component';
import { KtcTableComponent } from './components/player-values/ktc-table/ktc-table.component';
import { PlayerValuesComponent } from './components/player-values/player-values.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { PowerRankingsTableComponent } from './components/power-rankings/power-rankings-table/power-rankings-table.component';
import { DraftComponent } from './components/draft/draft.component';
import { DraftTableComponent } from './components/draft/draft-table/draft-table.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { StandingsComponent } from './components/standings/standings.component';
import { ScheduleComparisonComponent } from './components/standings/schedule-comparison/schedule-comparison.component';
import { MatTabsModule } from '@angular/material/tabs';
import { WeeklyRecordVsAllComponent } from './components/standings/weekly-record-vs-all/weekly-record-vs-all.component';
import { CompletedDraftTableComponent } from './components/draft/completed-draft-table/completed-draft-table.component';
import { PlayerComparisonsComponent } from './components/player-comparisons/player-comparisons.component';
import { ChartsModule } from 'ng2-charts';
import { MatChipsModule } from '@angular/material/chips';
import { AddPlayerComparisonModalComponent } from './components/modals/add-player-comparison-modal/add-player-comparison-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TradeValueLineChartComponent } from './components/player-comparisons/trade-value-line-chart/trade-value-line-chart.component';
import 'chartjs-plugin-colorschemes';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlayerDetailsComponent } from './components/player-details/player-details.component';
import { MatCardModule } from '@angular/material/card';
import { PlayerDetailsWeeklyStatsLineChartComponent } from './components/player-details/player-details-weekly-stats-line-chart/player-details-weekly-stats-line-chart.component';
import { PlayerDetailsWeeklyBoxScoresTableComponent } from './components/player-details/player-details-weekly-box-scores-table/player-details-weekly-box-scores-table.component';
import { FantasyTeamDetailsComponent } from './components/fantasy-team-details/fantasy-team-details.component';
import { PowerRankingsChartComponent } from './components/power-rankings/power-rankings-chart/power-rankings-chart.component';
import { FantasyTeamDetailsWeeklyPointsChartComponent } from './components/fantasy-team-details/fantasy-team-details-weekly-points-chart/fantasy-team-details-weekly-points-chart.component';
import { StrengthOfScheduleChartComponent } from './components/standings/strength-of-schedule-chart/strength-of-schedule-chart.component';
import { PlayoffCalculatorComponent } from './components/playoff-calculator/playoff-calculator.component';
import { PlayoffCalculatorSeasonTableComponent } from './components/playoff-calculator/playoff-calculator-season-table/playoff-calculator-season-table.component';
import { PlayoffCalculatorGamesContainerComponent } from './components/playoff-calculator/playoff-calculator-games-container/playoff-calculator-games-container.component';
import { PlayoffCalculatorGamesCardComponent } from './components/playoff-calculator/playoff-calculator-games-container/playoff-calculator-games-card/playoff-calculator-games-card.component';
import { MatRadioModule } from '@angular/material/radio';
import { QueryBuilderModule } from 'angular2-query-builder';
import { PlayoffCalculatorSelectableGameCardComponent } from './components/playoff-calculator/playoff-calculator-games-container/playoff-calculator-selectable-game-card/playoff-calculator-selectable-game-card.component';
import { FooterComponent } from './components/footer/footer.component';
import { AboutComponent } from './components/about/about.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { PlayerDetailsInsightsComponent } from './components/player-details/player-details-insights/player-details-insights.component';
import { PlayerStatisticsComponent } from './components/player-statistics/player-statistics.component';
import { PlayerPosTableComponent } from './components/player-statistics/player-pos-table/player-pos-table.component';
import { PlayerPosScatterChartComponent } from './components/player-statistics/player-pos-scatter-chart/player-pos-scatter-chart.component';
import { WeeklyMedianChartComponent } from './components/standings/weekly-median-chart/weekly-median-chart.component';
import { TeamTransactionsChartComponent } from './components/standings/team-transactions-chart/team-transactions-chart.component';
import { HighLightSearchPipe } from './pipes/high-light-search.pipe';
import { TradeCenterComponent } from './components/trade-center/trade-center.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TradeFinderComponent } from './components/trade-finder/trade-finder.component';
import { TradeFinderTableComponent } from './components/trade-finder/trade-finder-table/trade-finder-table.component';
import { TradeFinderCardComponent } from './components/trade-finder/trade-finder-card/trade-finder-card.component';
import { TeamTiersChartComponent } from './components/standings/team-tiers-chart/team-tiers-chart.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';
import { environment } from '../environments';
import { EloTeamComparisonModalComponent } from './components/modals/elo-team-comparison-modal/elo-team-comparison-modal.component';
import { EditLeagueSettingsModalComponent } from './components/modals/edit-league-settings-modal/edit-league-settings-modal.component';
import { TruncatePipe } from './pipes/truncate.pipe';
import { FantasyTeamRankingsRadarChart } from './components/fantasy-team-details/fantasy-team-rankings-radar-chart/fantasy-team-rankings-radar-chart';
import { WrappedComponent } from './components/wrapped/wrapped.component';
import { StandardPageComponent } from './components/standard-page/standard-page.component';
import { WrappedWelcomeComponent } from './components/wrapped/wrapped-welcome/wrapped-welcome.component';
import { WrappedTransactionsComponent } from './components/wrapped/wrapped-transactions/wrapped-transactions.component';
import { WrappedCardComponent } from './components/wrapped/wrapped-card/wrapped-card.component';
import { WrappedCardTradeComponent } from './components/wrapped/wrapped-card-trade/wrapped-card-trade.component';
import { WrappedDraftComponent } from './components/wrapped/wrapped-draft/wrapped-draft.component';
import { WrappedStandingsComponent } from './components/wrapped/wrapped-standings/wrapped-standings.component';
import { WrappedFinishComponent } from './components/wrapped/wrapped-finish/wrapped-finish.component';
import { WrappedCardSummaryComponent } from './components/wrapped/wrapped-card-summary/wrapped-card-summary.component';
import { LoginErrorComponenet } from './components/sub-components/login-error/login-error.component';
import { PlayerQueryBuilderComponent } from './components/sub-components/player-query-builder/player-query-builder.component';
import { FilterPlayerValuesModalComponent } from './components/modals/filter-player-values-modal/filter-player-values-modal.component';
import { FantasyMarketDropdown } from './components/sub-components/fantasy-market-dropdown/fantasy-market-dropdown.component';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { PlayerDetailsProfileComponent } from './components/player-details/player-details-profile/player-details-profile.component';
import { FantasyPortfolioComponent } from './components/fantasy-portfolio/fantasy-portfolio.component';
import { FantasyPortfolioTableComponent } from './components/fantasy-portfolio/fantasy-portfolio-table/fantasy-portfolio-table.component';
import { FantasyPortfolioChartComponent } from './components/fantasy-portfolio/fantasy-portfolio-chart/fantasy-portfolio-chart.component';
import { LeagueLoginModalComponent } from './components/modals/league-login-modal/league-login-modal.component';
import { MatCarouselModule } from '@thouet/material-carousel';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FilterPortfolioModalComponent } from './components/modals/filter-portfolio-modal/filter-portfolio-modal.component';
import { TradeCenterPlayerValuesComponent } from './components/trade-center/trade-center-player-values/trade-center-player-values.component';
import { ConfirmationDialogModal } from './components/modals/confirmation-dialog/confirmation-dialog.component';

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
    HomeComponent,
    PowerRankingsComponent,
    HeaderComponent,
    KtcTableComponent,
    PlayerValuesComponent,
    PowerRankingsTableComponent,
    DraftComponent,
    DraftTableComponent,
    StandingsComponent,
    ScheduleComparisonComponent,
    WeeklyRecordVsAllComponent,
    CompletedDraftTableComponent,
    PlayerComparisonsComponent,
    AddPlayerComparisonModalComponent,
    TradeValueLineChartComponent,
    PlayerDetailsComponent,
    PowerRankingsChartComponent,
    PlayerDetailsWeeklyStatsLineChartComponent,
    PlayerDetailsWeeklyBoxScoresTableComponent,
    FantasyTeamDetailsComponent,
    FantasyTeamDetailsWeeklyPointsChartComponent,
    StrengthOfScheduleChartComponent,
    PlayoffCalculatorComponent,
    PlayoffCalculatorSeasonTableComponent,
    PlayoffCalculatorGamesContainerComponent,
    PlayoffCalculatorGamesCardComponent,
    PlayoffCalculatorSelectableGameCardComponent,
    FooterComponent,
    AboutComponent,
    PlayerDetailsInsightsComponent,
    PlayerDetailsProfileComponent,
    PlayerStatisticsComponent,
    PlayerPosTableComponent,
    PlayerPosScatterChartComponent,
    FilterPortfolioModalComponent,
    WeeklyMedianChartComponent,
    TeamTransactionsChartComponent,
    HighLightSearchPipe,
    HighLightSearchPipe,
    TradeCenterComponent,
    TradeFinderComponent,
    TradeFinderTableComponent,
    TradeFinderCardComponent,
    TeamTiersChartComponent,
    EloTeamComparisonModalComponent,
    SidebarComponent,
    EditLeagueSettingsModalComponent,
    FilterPlayerValuesModalComponent,
    FantasyMarketDropdown,
    WrappedComponent,
    WrappedWelcomeComponent,
    WrappedTransactionsComponent,
    WrappedStandingsComponent,
    WrappedFinishComponent,
    WrappedCardSummaryComponent,
    WrappedDraftComponent,
    WrappedCardComponent,
    WrappedCardTradeComponent,
    StandardPageComponent,
    TradeCenterPlayerValuesComponent,
    FantasyTeamRankingsRadarChart,
    LoginErrorComponenet,
    PlayerQueryBuilderComponent,
    FantasyPortfolioComponent,
    FantasyPortfolioTableComponent,
    FantasyPortfolioChartComponent,
    LeagueLoginModalComponent,
    ConfirmationDialogModal,
    TruncatePipe,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatSortModule,
    MatBadgeModule,
    NgxMatSelectSearchModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatTabsModule,
    ChartsModule,
    MatChipsModule,
    MatDialogModule,
    DragDropModule,
    MatTooltipModule,
    MatCardModule,
    MatRadioModule,
    QueryBuilderModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    NgxGoogleAnalyticsModule.forRoot(environment.gaMeasurementId),
    MatCarouselModule,
    NgxGoogleAnalyticsRouterModule
  ],
  providers: [EndpointsService,
    ConfigService,
    StartupService,
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
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
