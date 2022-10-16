import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {LeagueCompletedPickData, LeagueTeam} from '../../../model/LeagueTeam';
import {CompletedDraft} from '../../../model/LeagueUser';
import {MatPaginator} from '@angular/material/paginator';
import {LeagueService} from '../../../services/league.service';
import {PlayerService} from '../../../services/player.service';
import {FantasyPlayer} from '../../../model/FantasyPlayer';
import {ConfigService} from '../../../services/init/config.service';
import {ChartOptions, ChartType} from 'chart.js';
import {BaseChartDirective, Label} from 'ng2-charts';
import 'chartjs-plugin-colorschemes/src/plugins/plugin.colorschemes';
import {ClassicColorBlind10} from 'chartjs-plugin-colorschemes/src/colorschemes/colorschemes.tableau';
import {PlayerComparisonService} from '../../services/player-comparison.service';
import {Router} from '@angular/router';
import {NflService} from '../../../services/utilities/nfl.service';
import {LeagueSwitchService} from "../../services/league-switch.service";

@Component({
  selector: 'app-completed-draft-table',
  templateUrl: './completed-draft-table.component.html',
  styleUrls: ['./completed-draft-table.component.css']
})
export class CompletedDraftTableComponent implements OnInit, OnChanges {

  /** selected draft completed */
  @Input()
  selectedDraft: CompletedDraft;

  /** columns */
  displayedColumns = this.configService.isMobile ? ['pickNumber', 'owner', 'selectedPlayer'] : ['pickNumber', 'team', 'owner', 'selectedPlayer', 'actions'];

  /** mat paginator */
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  /** chart set up */
  @ViewChild(BaseChartDirective, {static: true}) chart: BaseChartDirective;

  /** pie chart values */
  public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'left',
    },
    plugins: {
      colorschemes: {
        scheme: ClassicColorBlind10,
        override: true
      }
    }
  };
  public pieChartLabels: Label[] = [];
  public pieChartData: number[] = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;

  /** page length */
  pageLength: number;

  /** mat datasource */
  dataSource: MatTableDataSource<LeagueCompletedPickData> = new MatTableDataSource<LeagueCompletedPickData>();

  /** search value */
  searchVal: string = '';

  /** filter positions */
  filterPosGroup: boolean[] = [true, true, true, true];

  /** is superflex */
  isSuperFlex: boolean = true;

  /** average value of pick in round */
  roundPickValue: number[] = [];

  /** keepers by roster id */
  keepersByTeam: {} = {};

  /** filtered draft list */
  filteredDraftPicks: LeagueCompletedPickData[] = [];

  /** display string for best overall pick */
  bestOverallPickStr: string = '';

  /** display string for best value pick */
  bestValuePickStr: string = '';

  /** best team draft data */
  bestTeamDraft: { team: LeagueTeam, valueAdded: number } = null;

  /** worst team draft data */
  worstTeamDraft: { team: LeagueTeam, valueAdded: number } = null;

  /** pick array of values */
  pickValues: FantasyPlayer[] = [];

  constructor(public leagueService: LeagueService,
              public playerService: PlayerService,
              public configService: ConfigService,
              public playerComparisonService: PlayerComparisonService,
              public leagueSwitchService: LeagueSwitchService,
              private nflService: NflService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.pieChartLegend = !this.configService.isMobile;
    this.pageLength = this.leagueService.selectedLeague.totalRosters;
    this.isSuperFlex = this.leagueService.selectedLeague.isSuperflex;
    this.pickValues = this.playerService.getDraftPicksForYear(this.nflService.stateOfNFL.seasonType === 'pre'
      ? this.nflService.stateOfNFL.season : null);
    this.refreshMetrics();
    this.paginator.pageIndex = 0;
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(): void {
    this.isSuperFlex = this.leagueService.selectedLeague.isSuperflex;
    this.dataSource = new MatTableDataSource(this.selectedDraft.picks);
    this.refreshMetrics();
    this.paginator.pageIndex = 0;
    this.dataSource.paginator = this.paginator;
  }

  /**
   * refresh draft metrics
   * @private
   */
  private refreshMetrics(): void {
    this.roundPickValue = this.getAVGValuePerRound();
    this.keepersByTeam = this.getTopKeeperForEachTeam();
    this.bestOverallPickStr = this.getBestOverallPick();
    this.bestValuePickStr = this.getBestValuePick();
    this.findBestAndWorstDraftsForTeams();
    this.calculatePositionAggregate();
  }

  /**
   * get team name from roster id
   * @param rosterId roster id
   * return name
   */
  getTeamName(rosterId: string): string {
    for (const team of this.leagueService.leagueTeamDetails) {
      if (team.roster.rosterId.toString() === rosterId.toString()) {
        return team.owner?.teamName;
      }
    }
    return 'none';
  }

  /**
   * get owner name by roster id
   * @param rosterId roster id
   */
  getOwnerName(rosterId: number): string {
    for (const team of this.leagueService.leagueTeamDetails) {
      if (team.roster.rosterId === rosterId) {
        return team.owner?.ownerName;
      }
    }
    return 'none';
  }

  /**
   * get player by sleeper id
   * @param sleeperId sleeper id
   */
  getPlayerBySleeperId(sleeperId: string): FantasyPlayer {
    return this.playerService.getPlayerBySleeperId(sleeperId);
  }

  /**
   * update draft filter values
   */
  updateDraftFilters(): void {
    this.filteredDraftPicks = this.selectedDraft.picks.slice();
    const filterOptions = ['QB', 'RB', 'WR', 'TE'];
    for (let i = 0; i < this.filterPosGroup.length; i++) {
      if (!this.filterPosGroup[i]) {
        this.filteredDraftPicks = this.filteredDraftPicks.filter(pick => {
          if (pick.position !== filterOptions[i] && filterOptions.includes(pick.position)) {
            return pick;
          }
        });
      }
    }
    if (this.searchVal && this.searchVal.length > 0) {
      this.filteredDraftPicks = this.filteredDraftPicks.filter(player => {
        return ((player.firstName + ' ' + player.lastName).toLowerCase().indexOf(this.searchVal.toLowerCase()) >= 0
          || (player.round.toString().toLowerCase().indexOf(this.searchVal.toLowerCase()) >= 0)
          || (this.getOwnerName(player.rosterId).toLowerCase().indexOf(this.searchVal.toLowerCase()) >= 0));
      });
    }
    this.dataSource = new MatTableDataSource(this.filteredDraftPicks);
    this.paginator.pageIndex = 0;
    this.dataSource.paginator = this.paginator;
  }

  /**
   * get best overall player selected by value
   */
  getBestOverallPick(): string {
    let topPick = this.selectedDraft.picks[0];
    let fantasyPlayer = this.playerService.getPlayerBySleeperId(topPick.sleeperId);
    for (const pick of this.selectedDraft.picks.slice(1)) {
      const tempPlayer = this.playerService.getPlayerBySleeperId(pick.sleeperId);
      if (this.isSuperFlex ? fantasyPlayer?.sf_trade_value < tempPlayer?.sf_trade_value
        : fantasyPlayer?.trade_value < tempPlayer?.trade_value) {
        topPick = pick;
        fantasyPlayer = tempPlayer;
      }
    }
    return 'Pick ' + topPick.pickNumber + ': ' + fantasyPlayer.position + ' - ' + fantasyPlayer.last_name;
  }

  /**
   * get best player at value
   */
  getBestValuePick(): string {
    let topPick = this.selectedDraft.picks[0];
    let topValue = this.getPickValueRatio(topPick);
    for (const pick of this.selectedDraft.picks.slice(1)) {
      const tempValue = this.getPickValueRatio(pick);
      if (tempValue > topValue) {
        topPick = pick;
        topValue = tempValue;
      }
    }
    const fantasyPlayer = this.playerService.getPlayerBySleeperId(topPick.sleeperId);
    return 'Pick ' + topPick.pickNumber + ': ' + fantasyPlayer.position + ' - ' + fantasyPlayer.last_name;
  }

  /**
   * get value ratio in player and pick used to select the player
   * @param pick
   * @private
   */
  private getPickValueRatio(pick: LeagueCompletedPickData): number {
    const pickValue = this.getPickValue(pick.round);
    return this.isSuperFlex ? (this.playerService.getPlayerBySleeperId(pick.sleeperId)?.sf_trade_value || 0) / pickValue :
      (this.playerService.getPlayerBySleeperId(pick.sleeperId)?.trade_value || 0) / pickValue;
  }

  /**
   * get value difference in player and pick used to select the player
   * @param pick
   * @private
   */
  private getPickValueAdded(pick: LeagueCompletedPickData): number {
    const pickValue = this.getPickValue(pick.round);
    return this.isSuperFlex ? (this.playerService.getPlayerBySleeperId(pick.sleeperId)?.sf_trade_value || 0) - pickValue :
      (this.playerService.getPlayerBySleeperId(pick.sleeperId)?.trade_value || 0) - pickValue;
  }

  /**
   * get pick value for round. If rookie draft use keep trade cut, else use the round pick value array
   * @param round
   * @private
   */
  private getPickValue(round: number): number {
    return this.roundPickValue[round - 1];
  }

  /**
   * sets worst and best teams draft value added
   */
  findBestAndWorstDraftsForTeams(): void {
    const teams: { team: LeagueTeam, valueAdded: number }[] = [];
    for (const team of this.leagueService.leagueTeamDetails) {
      let valueAdded = 0;
      for (const pick of this.selectedDraft.picks) {
        if (pick.rosterId === team.roster.rosterId) {
          valueAdded += this.getPickValueAdded(pick);
        }
      }
      teams.push({team, valueAdded});
    }
    teams.sort((a, b) => {
      return b.valueAdded - a.valueAdded;
    });
    this.bestTeamDraft = teams[0];
    this.worstTeamDraft = teams[teams.length - 1];
  }

  /**
   * calculate position agg for draft
   * @private
   */
  private calculatePositionAggregate(): void {
    const labels: string[] = [];
    const data: number[] = [];
    for (const pick of this.selectedDraft.picks) {
      const player = this.leagueService.sleeperPlayers[pick.sleeperId];
      const index = labels.indexOf(player.position);
      if (index === -1) {
        labels.push(player.position);
        data.push(1);
      } else {
        data[index]++;
      }
    }
    this.pieChartLabels = labels;
    this.pieChartData = data;
    if (this.chart?.datasets?.length > 0) {
      this.chart.updateColors();
    }
  }

  /**
   * get average value of round pick
   */
  private getAVGValuePerRound(): number[] {
    const roundValue = [];
    for (let round = 0; round < this.selectedDraft.draft.rounds; round++) {
      let totalValue = 0;
      for (let pickNum = 0; pickNum < this.leagueService.selectedLeague.totalRosters; pickNum++) {
        totalValue += this.leagueService.selectedLeague.isSuperflex ?
          this.getPlayerBySleeperId(
            this.selectedDraft.picks[round * this.leagueService.selectedLeague.totalRosters + pickNum]?.sleeperId
          )?.sf_trade_value || 0 :
          this.getPlayerBySleeperId(
            this.selectedDraft.picks[round * this.leagueService.selectedLeague.totalRosters + pickNum]?.sleeperId
          )?.trade_value || 0;
      }
      roundValue.push(Math.round(totalValue / this.leagueService.selectedLeague.totalRosters));
    }
    return roundValue;
  }

  /**
   * returns dictionary of top players to redraft in keeper league
   */
  getTopKeeperForEachTeam(): {} {
    const keeperPlayersByTeam = {};
    for (const team of this.leagueService.leagueTeamDetails) {
      const pickWithValues = [];
      for (const sleeperId of team.roster.players) {
        for (const pick of this.selectedDraft.picks) {
          // if player is picked by team
          if (pick.sleeperId === sleeperId) {
            const fantasyPlayer = this.getPlayerBySleeperId(pick.sleeperId);
            // if player exists
            if (fantasyPlayer) {
              pickWithValues.push({
                player: fantasyPlayer.full_name,
                pick: `${pick.round}.${pick.pickNumber % this.leagueService.selectedLeague.totalRosters}`,
                value: this.isSuperFlex ? fantasyPlayer.sf_trade_value - this.roundPickValue[pick.round - 1]
                  : fantasyPlayer.sf_trade_value - this.roundPickValue[pick.round - 1]
              });
            }
          }
        }
      }
      pickWithValues.sort((a, b) => {
        return b.value - a.value;
      });
      keeperPlayersByTeam[team.roster.rosterId] = pickWithValues.slice(0, 5);
    }
    return keeperPlayersByTeam;
  }

  /**
   * open player comparison page
   * @param selectedPlayer selected player
   */
  openPlayerComparison(selectedPlayer: FantasyPlayer): void {
    this.playerComparisonService.addPlayerToCharts(selectedPlayer);
    this.router.navigate(['players/comparison'],
      {
        queryParams: this.leagueSwitchService.buildQueryParams()
      }
    );
  }
}
