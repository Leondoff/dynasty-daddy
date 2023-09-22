import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { GridGameComponent } from "src/app/components/grid-game/grid-game.component";
import { SharedModule } from "../shared/shared.module";
import { WrappedCardComponent } from "src/app/components/wrapped/wrapped-card/wrapped-card.component";
import { WrappedCardSummaryComponent } from "src/app/components/wrapped/wrapped-card-summary/wrapped-card-summary.component";
import { WrappedCardTradeComponent } from "src/app/components/wrapped/wrapped-card-trade/wrapped-card-trade.component";
import { WrappedComponent } from "src/app/components/wrapped/wrapped.component";
import { WrappedDraftComponent } from "src/app/components/wrapped/wrapped-draft/wrapped-draft.component";
import { WrappedFinishComponent } from "src/app/components/wrapped/wrapped-finish/wrapped-finish.component";
import { WrappedStandingsComponent } from "src/app/components/wrapped/wrapped-standings/wrapped-standings.component";
import { WrappedWelcomeComponent } from "src/app/components/wrapped/wrapped-welcome/wrapped-welcome.component";
import { WrappedTransactionsComponent } from "src/app/components/wrapped/wrapped-transactions/wrapped-transactions.component";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: WrappedComponent },
    ]),
  ],
  declarations: [
    WrappedCardComponent,
    WrappedCardSummaryComponent,
    WrappedCardTradeComponent,
    WrappedComponent,
    WrappedDraftComponent,
    WrappedFinishComponent,
    WrappedStandingsComponent,
    WrappedWelcomeComponent,
    WrappedTransactionsComponent
  ]
})
export class WrappedModule {
}
