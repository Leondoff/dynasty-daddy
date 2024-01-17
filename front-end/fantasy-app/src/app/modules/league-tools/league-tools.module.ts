import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../shared/shared.module";
import { LeagueFormatComponent } from "src/app/components/league-format/league-format.component";
import { LeagueFormatChartComponent } from "src/app/components/league-format/league-format-chart/league-format-chart.component";
import { LeagueFormatTableComponent } from "src/app/components/league-format/league-format-table/league-format-table.component";
import { FilterLeagueFormatModalComponent } from "src/app/components/modals/filter-league-format-modal/filter-league-format-modal.component";
import { DraftComponent } from "src/app/components/draft/draft.component";
import { DraftTableComponent } from "src/app/components/draft/draft-table/draft-table.component";
import { TradeFinderTableComponent } from "src/app/components/trade-finder/trade-finder-table/trade-finder-table.component";
import { TradeFinderCardComponent } from "src/app/components/trade-finder/trade-finder-card/trade-finder-card.component";
import { TradeFinderComponent } from "src/app/components/trade-finder/trade-finder.component";
import { FantasyPortfolioComponent } from "src/app/components/fantasy-portfolio/fantasy-portfolio.component";
import { FantasyPortfolioTableComponent } from "src/app/components/fantasy-portfolio/fantasy-portfolio-table/fantasy-portfolio-table.component";
import { FantasyPortfolioChartComponent } from "src/app/components/fantasy-portfolio/fantasy-portfolio-chart/fantasy-portfolio-chart.component";
import { PlayoffCalculatorComponent } from "src/app/components/playoff-calculator/playoff-calculator.component";
import { PlayoffCalculatorGamesCardComponent } from "src/app/components/playoff-calculator/playoff-calculator-games-container/playoff-calculator-games-card/playoff-calculator-games-card.component";
import { PlayoffCalculatorGamesContainerComponent } from "src/app/components/playoff-calculator/playoff-calculator-games-container/playoff-calculator-games-container.component";
import { PlayoffCalculatorSeasonTableComponent } from "src/app/components/playoff-calculator/playoff-calculator-season-table/playoff-calculator-season-table.component";
import { PlayoffCalculatorSelectableGameCardComponent } from "src/app/components/playoff-calculator/playoff-calculator-games-container/playoff-calculator-selectable-game-card/playoff-calculator-selectable-game-card.component";
import { StandingsComponent } from "src/app/components/standings/standings.component";
import { ScheduleComparisonComponent } from "src/app/components/standings/schedule-comparison/schedule-comparison.component";
import { TeamTiersChartComponent } from "src/app/components/standings/team-tiers-chart/team-tiers-chart.component";
import { WeeklyMedianChartComponent } from "src/app/components/standings/weekly-median-chart/weekly-median-chart.component";
import { WeeklyRecordVsAllComponent } from "src/app/components/standings/weekly-record-vs-all/weekly-record-vs-all.component";
import { StrengthOfScheduleChartComponent } from "src/app/components/standings/strength-of-schedule-chart/strength-of-schedule-chart.component";
import { TeamTransactionsChartComponent } from "src/app/components/standings/team-transactions-chart/team-transactions-chart.component";
import { FantasyTeamDetailsComponent } from "src/app/components/fantasy-team-details/fantasy-team-details.component";
import { FantasyTeamDetailsWeeklyPointsChartComponent } from "src/app/components/fantasy-team-details/fantasy-team-details-weekly-points-chart/fantasy-team-details-weekly-points-chart.component";
import { FantasyTeamRankingsRadarChart } from "src/app/components/fantasy-team-details/fantasy-team-rankings-radar-chart/fantasy-team-rankings-radar-chart";
import { CompletedDraftTableComponent } from "src/app/components/draft/completed-draft-table/completed-draft-table.component";
import { FilterPortfolioModalComponent } from "src/app/components/modals/filter-portfolio-modal/filter-portfolio-modal.component";
import { EloTeamComparisonModalComponent } from "src/app/components/modals/elo-team-comparison-modal/elo-team-comparison-modal.component";
import { LeagueLoginModalComponent } from "src/app/components/modals/league-login-modal/league-login-modal.component";
import { PowerRankingsChartComponent } from "src/app/components/power-rankings/power-rankings-chart/power-rankings-chart.component";
import { PowerRankingsTableComponent } from "src/app/components/power-rankings/power-rankings-table/power-rankings-table.component";
import { PowerRankingsComponent } from "src/app/components/power-rankings/power-rankings.component";
import { LeagueFormatModalComponent } from "src/app/components/modals/league-format-modal/league-format-modal.component";
import { EditMockDraftModalComponent } from "src/app/components/modals/edit-mock-draft-modal/edit-mock-draft-modal.component";

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([
      { path: 'team/:ownerName', component: FantasyTeamDetailsComponent },
      { path: 'trade/finder', component: TradeFinderComponent },
      { path: 'draft', component: DraftComponent },
      { path: 'probability', component: PlayoffCalculatorComponent },
      { path: 'standings', component: StandingsComponent },
      { path: 'portfolio', component: FantasyPortfolioComponent },
      { path: 'format', component: LeagueFormatComponent },
      { path: 'rankings', component: PowerRankingsComponent },
    ]),
  ],
  declarations: [
    LeagueFormatComponent,
    LeagueFormatChartComponent,
    LeagueFormatTableComponent,
    LeagueFormatModalComponent,
    FilterLeagueFormatModalComponent,
    DraftComponent,
    DraftTableComponent,
    TradeFinderTableComponent,
    TradeFinderCardComponent,
    TradeFinderComponent,
    FantasyPortfolioComponent,
    FantasyPortfolioTableComponent,
    FantasyPortfolioChartComponent,
    PlayoffCalculatorComponent,
    PlayoffCalculatorGamesCardComponent,
    PlayoffCalculatorGamesContainerComponent,
    PlayoffCalculatorSeasonTableComponent,
    PlayoffCalculatorSelectableGameCardComponent,
    EditMockDraftModalComponent,
    StandingsComponent,
    ScheduleComparisonComponent,
    TeamTiersChartComponent,
    WeeklyMedianChartComponent,
    WeeklyRecordVsAllComponent,
    ScheduleComparisonComponent,
    StrengthOfScheduleChartComponent,
    TeamTransactionsChartComponent,
    FantasyTeamDetailsComponent,
    FantasyTeamDetailsWeeklyPointsChartComponent,
    FantasyTeamRankingsRadarChart,
    CompletedDraftTableComponent,
    DraftTableComponent,
    FilterPortfolioModalComponent,
    EloTeamComparisonModalComponent,
    LeagueLoginModalComponent,
    FilterPortfolioModalComponent,
    PowerRankingsComponent,
    PowerRankingsTableComponent,
    PowerRankingsChartComponent,
  ]
})
export class LeagueToolsModule {
}
