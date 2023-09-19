import { AfterViewInit, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { LeagueService } from '../../../services/league.service';
import { PowerRankingsService } from '../../services/power-rankings.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PlayoffCalculatorService } from '../../services/playoff-calculator.service';
import { ColorService } from '../../../services/utilities/color.service';
import { ConfigService } from '../../../services/init/config.service';
import { LeagueSwitchService } from '../../services/league-switch.service';

@Component({
  selector: 'app-playoff-calculator-season-table',
  templateUrl: './playoff-calculator-season-table.component.html',
  styleUrls: ['./playoff-calculator-season-table.component.css']
})
export class PlayoffCalculatorSeasonTableComponent implements OnInit, AfterViewInit, OnChanges {

  /** mat sort */
  @ViewChild(MatSort) sort: MatSort;

  /** which week is the data forecasted on */
  @Input()
  forecastWeek: number;

  /** selected metrics to display in table */
  @Input()
  selectedMetrics: { display: string, value: string, isDisabled: boolean }[];

  /** datasource for table */
  public dataSource: MatTableDataSource<any>;

  constructor(public leagueService: LeagueService,
    public powerRankingsService: PowerRankingsService,
    public leagueSwitchService: LeagueSwitchService,
    public playoffCalculatorService: PlayoffCalculatorService,
    private colorService: ColorService,
    public configService: ConfigService) {
  }

  /** team properties like name division value */
  teamCols = ['teamName'];

  /** ratings properties like elo change and team rating */
  ratingsCols = ['teamRating'];

  /** probability properties */
  probabilityCols = ['currentRecord', 'record', 'makePlayoffs', 'winDivision', 'getBye', 'winChampionship'];

  /** combined properties to display */
  divisionTableCols = [];

  /** color gradient */
  probGradient: string[] = [];

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.powerRankingsService.powerRankings);
    if (this.playoffCalculatorService.divisions.length === 1 || this.configService.isMobile) {
      this.teamCols = ['teamName'];
    } else {
      this.teamCols = ['teamName', 'teamDivision'];
    }
    this.divisionTableCols = this.ratingsCols.concat(this.teamCols, this.probabilityCols);
    this.probGradient = this.colorService.getProbGradient();
  }

  /** sorting function */
  ngAfterViewInit(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'teamRating':
          return this.playoffCalculatorService.forecastModel === 0 ? item.adpValueStarter : item.eloAdpValueStarter;
        case 'eloChange':
          return item.eloAdpValueChange;
        case 'record':
          return this.playoffCalculatorService.teamsProjectedRecord[item.team.roster.rosterId]?.projWins
            + this.playoffCalculatorService.teamsProjectedRecord[item.team.roster.rosterId]?.medianWins;
        case 'currentRecord':
          const recordStr = this.getActualRecord(item.team.roster.rosterId);
          return Number(recordStr.split('-')[0] || 0);
        case 'makePlayoffs':
          return this.playoffCalculatorService.teamPlayoffOdds[item.team.roster.rosterId]?.timesMakingPlayoffs;
        case 'winDivision':
          return this.playoffCalculatorService.teamPlayoffOdds[item.team.roster.rosterId]?.timesWinningDivision;
        case 'getBye':
          return this.playoffCalculatorService.teamPlayoffOdds[item.team.roster.rosterId]?.timesWithBye;
        case 'makeConfChamp':
          return this.playoffCalculatorService.teamPlayoffOdds[item.team.roster.rosterId]?.timesMakeConfRd;
        case 'makeChampionship':
          return this.playoffCalculatorService.teamPlayoffOdds[item.team.roster.rosterId]?.timesMakeChampionship;
        case 'winOut':
          return this.playoffCalculatorService.teamPlayoffOdds[item.team.roster.rosterId]?.timesTeamWonOut;
        case 'worstRecord':
          return this.playoffCalculatorService.teamPlayoffOdds[item.team.roster.rosterId]?.timesWithWorstRecord;
        case 'bestRecord':
          return this.playoffCalculatorService.teamPlayoffOdds[item.team.roster.rosterId]?.timesWithBestRecord;
        case 'winChampionship':
          return this.playoffCalculatorService.teamPlayoffOdds[item.team.roster.rosterId]?.timesWinChampionship;
        default:
          return item[property];
      }
    };
    this.dataSource.sort = this.sort;
  }

  /**
   * handles on forecast date changes to hide projected record column if the data is after the reg season
   * TODO clean up this function
   */
  ngOnChanges(): void {
    this.ratingsCols = this.playoffCalculatorService.forecastModel === 0 ? ['teamRating'] : ['teamRating', 'eloChange'];
    this.probabilityCols = this.selectedMetrics.map(element => element.value);
    this.divisionTableCols = this.ratingsCols.concat(this.teamCols, this.probabilityCols);
    if (this.dataSource) {
      this.dataSource.data = this.powerRankingsService.powerRankings;
    }
  }

  /**
   * get color for probability
   * @param prob percent
   */
  getProbColor(prob: number): string {
    return this.probGradient[prob];
  }

  /**
   * get display value based on conditions
   * @param percent percent
   */
  getDisplayValue(percent: number): string {
    switch (percent) {
      case 0: {
        if (this.leagueService.selectedLeague.playoffStartWeek > this.forecastWeek) {
          return '<1%';
        }
        return '-';
      }
      case 100: {
        if (this.leagueService.selectedLeague.playoffStartWeek > this.forecastWeek) {
          return '>99%';
        }
        return '';
      }
      default: {
        return percent + '%';
      }
    }
  }

  /**
   * create projected record string based on certain league values
   * @param rosterId number
   */
  getProjRecord(rosterId: number): string {
    if (this.leagueService.selectedLeague.medianWins) {
      return (this.playoffCalculatorService.teamsProjectedRecord[rosterId]?.projWins +
        this.playoffCalculatorService.teamsProjectedRecord[rosterId]?.medianWins) + ' - '
        + (this.playoffCalculatorService.teamsProjectedRecord[rosterId]?.projLoss +
          this.playoffCalculatorService.teamsProjectedRecord[rosterId]?.medianLoss);
    }
    return this.playoffCalculatorService.teamsProjectedRecord[rosterId]?.projWins + ' - '
      + this.playoffCalculatorService.teamsProjectedRecord[rosterId]?.projLoss;
  }

  /**
   * returns realized wins and selected wins
   * if median mode is enabled display median wins as well
   * @param rosterId roster id
   */
  getActualRecord(rosterId: number): string {
    const winsAtDate = this.playoffCalculatorService.getWinsAtWeek(rosterId, this.forecastWeek - 1);
    const lossesAtDate = this.playoffCalculatorService.getLossesAtWeek(rosterId, this.forecastWeek - 1);
    if (this.leagueService.selectedLeague.medianWins) {
      return (this.playoffCalculatorService.selectedGameResults[rosterId].selectedWins +
        this.playoffCalculatorService.selectedGameResults[rosterId].selectedMedianWins +
        winsAtDate.totalWins) + ' - '
        + (this.playoffCalculatorService.selectedGameResults[rosterId].selectedLosses +
          this.playoffCalculatorService.selectedGameResults[rosterId].selectedMedianLosses +
          lossesAtDate.totalLosses);
    }
    return (this.playoffCalculatorService.selectedGameResults[rosterId].selectedWins + winsAtDate.wins) + ' - '
      + (this.playoffCalculatorService.selectedGameResults[rosterId].selectedLosses + lossesAtDate.losses);
  }
}
