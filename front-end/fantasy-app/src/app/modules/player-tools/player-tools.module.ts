import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../shared/shared.module";
import { TradeDatabaseComponent } from "src/app/components/trade-database/trade-database.component";
import { BubblePackingChartComponent } from "src/app/components/sub-components/bubble-packing-chart/bubble-packing-chart.component";
import { PlayerDetailsComponent } from "src/app/components/player-details/player-details.component";
import { PlayerComparisonsComponent } from "src/app/components/player-comparisons/player-comparisons.component";
import { PlayerValuesComponent } from "src/app/components/player-values/player-values.component";
import { KtcTableComponent } from "src/app/components/player-values/ktc-table/ktc-table.component";
import { PlayerStatisticsComponent } from "src/app/components/player-statistics/player-statistics.component";
import { PlayerPosScatterChartComponent } from "src/app/components/player-statistics/player-pos-scatter-chart/player-pos-scatter-chart.component";
import { PlayerPosTableComponent } from "src/app/components/player-statistics/player-pos-table/player-pos-table.component";
import { PlayerDetailsInsightsComponent } from "src/app/components/player-details/player-details-insights/player-details-insights.component";
import { PlayerDetailsProfileComponent } from "src/app/components/player-details/player-details-profile/player-details-profile.component";
import { PlayerDetailsWeeklyBoxScoresTableComponent } from "src/app/components/player-details/player-details-weekly-box-scores-table/player-details-weekly-box-scores-table.component";
import { PlayerDetailsWeeklyStatsLineChartComponent } from "src/app/components/player-details/player-details-weekly-stats-line-chart/player-details-weekly-stats-line-chart.component";
import { PlayerTradeMarketComponent } from "src/app/components/player-details/player-trade-market/player-trade-market.component";
import { TradeValueLineChartComponent } from "src/app/components/player-comparisons/trade-value-line-chart/trade-value-line-chart.component";
import { FilterPlayerValuesModalComponent } from "src/app/components/modals/filter-player-values-modal/filter-player-values-modal.component";
import { PlayerQueryBuilderComponent } from "src/app/components/sub-components/player-query-builder/player-query-builder.component";
import { AddPlayerComparisonModalComponent } from "src/app/components/modals/add-player-comparison-modal/add-player-comparison-modal.component";
import { TradeCenterPlayerValuesComponent } from "src/app/components/trade-center/trade-center-player-values/trade-center-player-values.component";
import { TradeCenterComponent } from "src/app/components/trade-center/trade-center.component";
import { PlayerDetailsModalComponent } from "src/app/components/modals/player-details-modal/player-details-modal.component";
import { TradeCenterPlayerDemandComponent } from "src/app/components/trade-center/trade-center-player-demand/trade-center-player-demand.component";
import { EditDraftADPModalComponent } from "src/app/components/modals/edit-draft-adp-modal/edit-draft-adp-modal.component";
import { PlayerDetailsADPComponent } from "src/app/components/player-details/player-details-adp/player-details-adp.component";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: 'trade/database', component: TradeDatabaseComponent },
      { path: 'values', component: PlayerValuesComponent },
      { path: 'details/:playerNameId', component: PlayerDetailsComponent },
      { path: 'statistics', component: PlayerStatisticsComponent },
      { path: 'comparison', component: PlayerComparisonsComponent },
      { path: 'trade', component: TradeCenterComponent },
    ]),
  ],
  declarations: [
    TradeDatabaseComponent,
    BubblePackingChartComponent,
    PlayerDetailsComponent,
    PlayerComparisonsComponent,
    PlayerValuesComponent,
    KtcTableComponent,
    PlayerStatisticsComponent,
    PlayerPosScatterChartComponent,
    PlayerPosTableComponent,
    PlayerDetailsInsightsComponent,
    PlayerDetailsProfileComponent,
    PlayerDetailsWeeklyBoxScoresTableComponent,
    PlayerDetailsWeeklyStatsLineChartComponent,
    PlayerTradeMarketComponent,
    PlayerDetailsModalComponent,
    EditDraftADPModalComponent,
    PlayerDetailsADPComponent,
    TradeValueLineChartComponent,
    FilterPlayerValuesModalComponent,
    PlayerComparisonsComponent,
    PlayerQueryBuilderComponent,
    AddPlayerComparisonModalComponent,
    TradeCenterComponent,
    TradeCenterPlayerValuesComponent,
    TradeCenterPlayerDemandComponent,
  ]
})
export class PlayerToolsModule {
}
