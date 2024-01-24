import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { GridGameComponent } from "src/app/components/grid-game/grid-game.component";
import { GridResultModalComponent } from "src/app/components/modals/grid-result-modal/grid-result-modal.component";
import { SearchGridPlayerModal } from "src/app/components/modals/search-grid-player-modal/search-grid-player-modal.component";
import { SharedModule } from "../shared/shared.module";
import { SaveEventGameModal } from "src/app/components/modals/save-event-game-modal/save-event-game-modal.component";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: '', component: GridGameComponent },
    ]),
  ],
  declarations: [
    GridGameComponent,
    SearchGridPlayerModal,
    GridResultModalComponent,
    SaveEventGameModal
  ]
})
export class GridModule {
}
