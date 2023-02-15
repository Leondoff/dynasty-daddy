import { Component, OnInit } from '@angular/core';
import { LeagueService } from '../../services/league.service';
import { PlayoffCalculatorService } from '../services/playoff-calculator.service';
import { NflService } from '../../services/utilities/nfl.service';
import { MatchUpProbability } from '../model/playoffCalculator';
import { MatchupService } from '../services/matchup.service';
import { PowerRankingsService } from '../services/power-rankings.service';
import { ConfigService } from '../../services/init/config.service';
import { UntypedFormControl } from '@angular/forms';
import { BaseComponent } from '../base-component.abstract';
import { LeagueSwitchService } from '../services/league-switch.service';
import { ActivatedRoute } from '@angular/router';
import { AddPlayerComparisonModalComponent } from "../modals/add-player-comparison-modal/add-player-comparison-modal.component";
import { EloTeamComparisonModalComponent } from "../modals/elo-team-comparison-modal/elo-team-comparison-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { PlayerService } from "../../services/player.service";

@Component({
  selector: 'app-playoff-calculator',
  templateUrl: './playoff-calculator.component.html',
  styleUrls: ['./playoff-calculator.component.css']
})
export class PlayoffCalculatorComponent extends BaseComponent implements OnInit {

  /** upcoming match ups prob */
  upcomingMatchUps: MatchUpProbability[][] = [];

  /** playoff match ups prob */
  playoffMatchUps: MatchUpProbability[][] = [];

  /** past match ups prob */
  completedMatchUps: MatchUpProbability[][] = [];

  /** list of selectable weeks to choose from */
  selectableWeeks: { week: number; value: string }[] = [];

  /** currently selected forecast week */
  selectedWeek: number;

  /** show playoff machine game selections */
  showPlayoffMachine: boolean = false;

  /** matchup offset for upcoming matchup selection cards */
  matchupOffset: number = 0;

  /** playoff machine start week */
  playoffMachineWeek: number;

  /** selectable metrics */
  selectableMetrics: { display: string, value: string, isDisabled: boolean }[] = [
    { display: 'Projected record', value: 'record', isDisabled: false },
    { display: 'Make playoffs', value: 'makePlayoffs', isDisabled: true },
    { display: 'Win division', value: 'winDivision', isDisabled: false },
    { display: 'Bye week', value: 'getBye', isDisabled: false },
    { display: 'Best Record', value: 'bestRecord', isDisabled: false },
    { display: 'Worst Record', value: 'worstRecord', isDisabled: false },
    { display: 'Run the table (from selected week)', value: 'winOut', isDisabled: false },
    { display: 'Make semi finals', value: 'makeConfChamp', isDisabled: false },
    { display: 'Make championship', value: 'makeChampionship', isDisabled: false },
    { display: 'Win championship', value: 'winChampionship', isDisabled: false }];

  /** form control for metrics dropdown */
  selectedMetrics = new UntypedFormControl();

  /** no league selected error message */
  noLeagueErrMsg = 'Cannot generate playoff calculator because no league is selected.';

  /** cannot generate calculator because league hasn't started error */
  leagueNotStartedErrMsg = 'Cannot generate playoff calculator because league hasn\'t started.';

  constructor(
    public leagueService: LeagueService,
    public playoffCalculatorService: PlayoffCalculatorService,
    public nflService: NflService,
    public powerRankingsService: PowerRankingsService,
    public matchupService: MatchupService,
    public configService: ConfigService,
    private playerService: PlayerService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    public leagueSwitchService: LeagueSwitchService) {
    super();
  }

  ngOnInit(): void {
    this.playerService.loadPlayerValuesForToday();
    this.initPlayoffCalc();
    this.addSubscriptions(this.leagueSwitchService.leagueChanged$.subscribe(() => {
      this.initPlayoffCalc();
    }
    ), this.route.queryParams.subscribe(params => {
      this.leagueSwitchService.loadFromQueryParams(params);
    })
    );
  }

  initPlayoffCalc(): void {
    if (this.leagueService.selectedLeague) {
      // TODO fix this
      if (this.matchupService.leagueMatchUpUI.length === 0 || this.playoffCalculatorService.matchUpsWithProb.length === 0) {
        console.warn('Warning: Match Data was not loaded correctly. Recalculating Data...');
        this.matchupService.initMatchUpCharts(this.leagueService.selectedLeague, this.nflService.getCompletedWeekForSeason(this.leagueService.selectedLeague.season));
      }
      const completedNFLWeek = this.nflService.getCompletedWeekForSeason(this.leagueService.selectedLeague.season);
      // get determined match up week in fantasy (playoffs take longer to determine winner)
      let determinedPlayoffWeek = Number(this.leagueService.selectedLeague.season) >= 2021 ? 18 : 17;
      if (completedNFLWeek >= this.leagueService.selectedLeague.playoffStartWeek) {
        this.leagueService.playoffMatchUps.forEach(matchUp => {
          if (!matchUp.loss && !matchUp.win) {
            determinedPlayoffWeek = this.leagueService.selectedLeague.playoffStartWeek + matchUp.round - 1;
          }
        });
      }
      // get completed week of nfl season (not factoring in if match ups are determined)
      const maxSelectableWeek = completedNFLWeek >= determinedPlayoffWeek ? determinedPlayoffWeek - 1 : completedNFLWeek;
      this.playoffMachineWeek = this.leagueService.selectedLeague.status === 'complete' ? maxSelectableWeek + 1 : maxSelectableWeek;
      this.powerRankingsService.powerRankings = this.powerRankingsService.calculateEloAdjustedADPValue();
      this.selectedWeek = this.playoffMachineWeek + 1;
      this.refreshGames();
      this.generateSelectableWeeks(maxSelectableWeek);
      this.selectedMetrics.setValue(this.setDefaultSelectedMetrics());
    }
  }

  /**
   * generate valid weeks to select probability
   * @param maxSelectableWeek number of week that has been completed in the playoffs
   * @private
   */
  private generateSelectableWeeks(maxSelectableWeek: number): void {
    this.selectableWeeks = [];
    this.selectableWeeks.push({ week: this.leagueService.selectedLeague.startWeek, value: 'Preseason' });
    for (let i = this.leagueService.selectedLeague.startWeek; i <= maxSelectableWeek; i++) {
      const disclaimer = this.leagueService.selectedLeague.playoffStartWeek === i + 1 ? ' (End of regular season)' : '';
      this.selectableWeeks.push({
        week: i + 1, value: 'Before Week '
          + (i + 1) + disclaimer
      });
    }
    if (this.leagueService.selectedLeague.status === 'complete') {
      this.selectableWeeks.push({
        week: this.leagueService.selectedLeague.startWeek
          + this.playoffCalculatorService.matchUpsWithProb.length + 1, value: 'Today'
      });
    }
    this.selectableWeeks.reverse()
  }

  /**
   * refresh game probability
   */
  refreshGames(): void {
    this.playoffCalculatorService.calculateGamesWithProbability(this.selectedWeek);
    if (this.playoffCalculatorService.matchUpsWithProb.length > 0) {
      if (this.leagueService.selectedLeague.season === this.nflService.stateOfNFL.season && this.nflService.stateOfNFL.seasonType !== 'post') {
        // get upcoming match ups
        this.upcomingMatchUps = this.playoffCalculatorService.matchUpsWithProb.slice(
          this.nflService.stateOfNFL.completedWeek - this.leagueService.selectedLeague.startWeek + 1,
          this.leagueService.selectedLeague.playoffStartWeek - this.leagueService.selectedLeague.startWeek,
        );
        // get upcoming playoff match ups
        if (this.leagueService.selectedLeague.season === this.nflService.stateOfNFL.season) {
          // week diff if mid playoffs
          const activeWeekDiff = this.nflService.stateOfNFL.week - this.leagueService.selectedLeague.playoffStartWeek;
          // set week diff value for slice
          const weekOffset = activeWeekDiff > 0 ? activeWeekDiff : 0;
          this.playoffMatchUps = this.playoffCalculatorService.matchUpsWithProb.slice(
            this.leagueService.selectedLeague.playoffStartWeek - this.leagueService.selectedLeague.startWeek + weekOffset
          );
        } else {
          this.playoffMatchUps = [];
        }
        // get completed match ups
        this.completedMatchUps =
          this.playoffCalculatorService.matchUpsWithProb.slice(0, this.nflService.stateOfNFL.completedWeek
            - this.leagueService.selectedLeague.startWeek + 1).reverse();
      } else {
        this.completedMatchUps = this.playoffCalculatorService.matchUpsWithProb.slice().reverse();
      }
    }
  }

  /**
   * update probability handler may remove later idk
   * @param value
   */
  updateProbability(value: number): void {
    this.selectedWeek = value;
    // check to ensure we aren't calculating a week that doesn't exist
    const maxCompletedWeek = this.nflService.getCompletedWeekForSeason(this.leagueService.selectedLeague.season);
    if (this.playoffCalculatorService.forecastModel === 1) {
      this.powerRankingsService.powerRankings =
        this.powerRankingsService.calculateEloAdjustedADPValue(this.powerRankingsService.powerRankings, this.selectedWeek > maxCompletedWeek ? maxCompletedWeek : this.selectedWeek - 1);
      this.refreshGames();
    }
    this.selectedMetrics.setValue(this.setDefaultSelectedMetrics());
    this.playoffCalculatorService.updateSeasonOdds(value);
  }

  changeForecastModel(): void {
    this.updateProbability(this.selectedWeek);
    this.refreshGames();
    this.selectedMetrics.setValue(this.setDefaultSelectedMetrics());
    this.playoffCalculatorService.updateSeasonOdds(this.selectedWeek);
  }

  openEloHistoricalModal(): void {
    this.dialog.open(EloTeamComparisonModalComponent
      , {
        minHeight: '400px',
        minWidth: '1200px',
      }
    );
  }

  /**
   * handles downloading csv of season data
   */
  downloadPlayoffCalculatorData(): void {

    const seasonData: any[][] = [
      ['rosterId', 'teamName', 'teamOwner', 'week', 'adpStarterValue', 'eloAdjustedADPValue', 'projWins', 'projLosses', 'medianWins', 'medianLosses', 'makePlayoffOdds', 'winDivisionOdds', 'winByeOdds', 'bestRecord', 'worstRecord', 'winOut', 'makeConfOdds', 'makeChampOdds', 'winChampOdds'],
    ];
    for (const team of this.powerRankingsService.powerRankings) {
      const row = [team.team.roster.rosterId, team.team.owner.teamName, team.team.owner.ownerName, this.selectedWeek];
      const teamRecords = this.playoffCalculatorService.teamsProjectedRecord[team.team.roster.rosterId];
      const teamOdds = this.playoffCalculatorService.teamPlayoffOdds[team.team.roster.rosterId];
      const teamRatings = [team.adpValueStarter, team.eloAdpValueStarter, team.eloAdpValueChange];
      const teamDataList = [
        teamRecords.projWins,
        teamRecords.projLoss,
        teamRecords.medianWins,
        teamRecords.medianLoss,
        teamOdds.timesMakingPlayoffs,
        teamOdds.timesWinningDivision,
        teamOdds.timesWithBye,
        teamOdds.timesWithBestRecord,
        teamOdds.timesWithWorstRecord,
        teamOdds.timesTeamWonOut,
        teamOdds.timesMakeConfRd,
        teamOdds.timesMakeChampionship,
        teamOdds.timesWinChampionship];
      seasonData.push(row.concat(teamRatings, teamDataList));
    }

    const seasonOddsCSV = seasonData.map(e => e.join(',')).join('\n');

    const filename = `${this.leagueService.selectedLeague.name.replace(/ /g, '_')}_Season_Projections_${this.leagueService.selectedLeague.season}_${this.selectedWeek}.csv`;

    const blob = new Blob([seasonOddsCSV], { type: 'text/csv;charset=utf-8;' });
    let newVariable: any = window.navigator;
    if (newVariable.msSaveBlob) { // IE 10+
      newVariable.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  /**
   * handles page select for playoff machine
   * @param change
   */
  updatePlayoffMachineWeek(change: number): void {
    this.playoffMachineWeek += change;
    this.matchupOffset += change;
  }

  /**
   * generate default selected metrics on init
   * @private
   */
  private setDefaultSelectedMetrics(): { display: string, name: string, isDisabled: boolean }[] {
    let defaultMetrics = [];
    this.updateDisabledSelectedMetrics();
    if (this.selectedWeek >= this.leagueService.selectedLeague.playoffStartWeek) {
      defaultMetrics = this.buildMetricsListOnValues(['makePlayoffs', 'makeConfChamp', 'makeChampionship', 'winChampionship']);
    } else {
      defaultMetrics = this.buildMetricsListOnValues(['record', 'makePlayoffs', 'winDivision', 'getBye', 'winChampionship']);
      if (this.leagueService.selectedLeague.playoffTeams % 4 === 0) {
        defaultMetrics.splice(3, 1);
      }
      if (this.leagueService.selectedLeague.divisions < 2) {
        defaultMetrics.splice(2, 1);
      }
      if (defaultMetrics.length <= 3) {
        defaultMetrics = this.buildMetricsListOnValues(['record', 'makePlayoffs', 'makeConfChamp', 'makeChampionship', 'winChampionship']);
      }
      if (this.configService.isMobile) {
        defaultMetrics.splice(0, 1);
      }
    }
    return defaultMetrics;
  }

  /**
   * returns a list in correct format of selected metric objects
   * @param valueList
   * @private
   */
  private buildMetricsListOnValues(valueList: string[]): { display: string, value: string, isDisabled: boolean }[] {
    const selectedValues = [];
    valueList.map(value => {
      selectedValues.push(this.selectableMetrics.find(element => element.value === value));
    });
    return selectedValues;
  }

  /**
   * helper to handle disabling fields based on conditions
   * @private
   */
  private updateDisabledSelectedMetrics(): void {
    if (this.selectedWeek >= this.leagueService.selectedLeague.playoffStartWeek) {
      // disable during season metrics
      this.selectableMetrics[0].isDisabled = true;
      this.selectableMetrics[2].isDisabled = true;
      this.selectableMetrics[3].isDisabled = true;
      this.selectableMetrics[4].isDisabled = true;
      this.selectableMetrics[5].isDisabled = true;
      this.selectableMetrics[6].isDisabled = true;
    } else {
      this.selectableMetrics[0].isDisabled = false;
      this.selectableMetrics[2].isDisabled = false;
      this.selectableMetrics[3].isDisabled = false;
      this.selectableMetrics[4].isDisabled = false;
      this.selectableMetrics[5].isDisabled = false;
      this.selectableMetrics[6].isDisabled = false;
    }
    if (this.leagueService.selectedLeague.divisions <= 1) {
      this.selectableMetrics[2].isDisabled = true;
    }
    if (this.leagueService.selectedLeague.playoffTeams % 4 === 0) {
      this.selectableMetrics[3].isDisabled = true;
    }
  }
}
