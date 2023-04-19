import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LeagueTeam } from '../../../model/league/LeagueTeam';
import { MatPaginator } from '@angular/material/paginator';
import { LeagueService } from '../../../services/league.service';
import { PlayerService } from '../../../services/player.service';
import { FantasyMarket, FantasyPlayer } from '../../../model/assets/FantasyPlayer';
import { ConfigService } from '../../../services/init/config.service';
import { ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective, Label } from 'ng2-charts';
import { PlayerComparisonService } from '../../services/player-comparison.service';
import { Router } from '@angular/router';
import { NflService } from '../../../services/utilities/nfl.service';
import { LeagueSwitchService } from '../../services/league-switch.service';
import { LeagueCompletedPickDTO } from '../../../model/league/LeagueCompletedPickDTO';
import { CompletedDraft } from '../../../model/league/CompletedDraft';
import { DraftService } from '../../services/draft.service';
import { BarChartColorPalette } from '../../../services/utilities/color.service';

@Component({
  selector: 'app-completed-draft-table',
  templateUrl: './completed-draft-table.component.html',
  styleUrls: ['./completed-draft-table.component.css']
})
export class CompletedDraftTableComponent implements OnInit, OnChanges {

  /** selected draft completed */
  @Input()
  selectedDraft: CompletedDraft;

  @Input()
  selectedMarket: FantasyMarket;

  /** columns */
  displayedColumns = this.configService.isMobile ? ['pickNumber', 'owner', 'selectedPlayer'] : ['pickNumber', 'team', 'owner', 'selectedPlayer', 'actions'];

  /** mat paginator */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  /** chart set up */
  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  /** pie chart values */
  public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'left',
    },
    plugins: {
      colorschemes: {
        scheme: BarChartColorPalette,
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
  dataSource: MatTableDataSource<LeagueCompletedPickDTO> = new MatTableDataSource<LeagueCompletedPickDTO>();

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

  /** cache of draft display fields */
  draftCache = {};

  /** filtered draft list */
  filteredDraftPicks: LeagueCompletedPickDTO[] = [];

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
    public draftService: DraftService,
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
    this.cacheDraft();
  }

  ngOnChanges(): void {
    this.isSuperFlex = this.leagueService.selectedLeague.isSuperflex;
    this.dataSource = new MatTableDataSource(this.selectedDraft.picks);
    this.refreshMetrics();
    this.paginator.pageIndex = 0;
    this.dataSource.paginator = this.paginator;
    this.cacheDraft();
  }

  cacheDraft(): void {
    this.draftCache = {}
    this.selectedDraft.picks.forEach(pick => {
      this.draftCache[pick.pickNumber] = {
        owner: this.getOwnerName(pick.rosterId),
        team: this.getTeamName(pick.rosterId),
        player: this.configService.isMobile ?
          (pick?.position || this.leagueService.platformPlayersMap[pick.playerId]?.position || '??') + ' ' + (pick?.lastName || this.leagueService.platformPlayersMap[pick.playerId]?.full_name || 'Unknown') :
          (pick?.position || this.leagueService.platformPlayersMap[pick.playerId]?.position || '??') + ' ' + (pick?.firstName ? (pick?.firstName + ' ' + pick?.lastName) : this.leagueService.platformPlayersMap[pick.playerId]?.full_name || 'Unknown'),
        value: this.getPlayerByPlayerPlatformId(pick.playerId) ? (this.isSuperFlex ? this.getPlayerByPlayerPlatformId(pick.playerId).sf_trade_value : this.getPlayerByPlayerPlatformId(pick.playerId).trade_value) : 'None',
        nameId: this.getPlayerByPlayerPlatformId(pick.playerId)?.name_id
      }
    });
  }

  /**
   * refresh draft metrics
   * @private
   */
  private refreshMetrics(): void {
    this.draftService.generateAVGValuePerRound(this.selectedDraft);
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
  getTeamName(rosterId: number | string): string {
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
   * update draft filter values
   */
  updateDraftFilters(): void {
    this.filteredDraftPicks = this.selectedDraft.picks.slice();
    const filterOptions = ['QB', 'RB', 'WR', 'TE'];
    for (let i = 0; i < this.filterPosGroup.length; i++) {
      if (!this.filterPosGroup[i]) {
        this.filteredDraftPicks = this.filteredDraftPicks.filter(pick => {
          const pos = pick.position || this.leagueService.platformPlayersMap[pick.playerId].position;
          if (pos !== filterOptions[i] && filterOptions.includes(pos)) {
            return pick;
          }
        });
      }
    }
    if (this.searchVal && this.searchVal.length > 0) {
      this.filteredDraftPicks = this.filteredDraftPicks.filter(player => {
        const name = player.firstName ? player.firstName + ' ' + player.lastName
          : this.leagueService.platformPlayersMap[player.playerId].full_name;
        return (name.toLowerCase().indexOf(this.searchVal.toLowerCase()) >= 0
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
    let fantasyPlayer = this.playerService.getPlayerByPlayerPlatformId(topPick.playerId, this.leagueService.selectedLeague.leaguePlatform);
    for (const pick of this.selectedDraft.picks.slice(1)) {
      const tempPlayer = this.playerService.getPlayerByPlayerPlatformId(pick.playerId, this.leagueService.selectedLeague.leaguePlatform);
      if (((this.isSuperFlex ? fantasyPlayer?.sf_trade_value : fantasyPlayer?.trade_value) || 0) < ((this.isSuperFlex ? tempPlayer?.sf_trade_value : tempPlayer?.trade_value) || 0)) {
        topPick = pick;
        fantasyPlayer = tempPlayer;
      }
    }
    return 'Pick ' + topPick.pickNumber + ': ' + (fantasyPlayer?.position || '?') + ' - ' + fantasyPlayer.last_name;
  }

  /**
   * get best player at value
   */
  getBestValuePick(): string {
    let topPick = this.selectedDraft.picks[0];
    let topValue = this.draftService.getPickValueRatio(topPick);
    for (const pick of this.selectedDraft.picks.slice(1)) {
      const tempValue = this.draftService.getPickValueRatio(pick);
      if (tempValue > topValue) {
        topPick = pick;
        topValue = tempValue;
      }
    }
    const fantasyPlayer = this.playerService.getPlayerByPlayerPlatformId(
      topPick.playerId,
      this.leagueService.selectedLeague.leaguePlatform
    );
    return 'Pick ' + topPick.pickNumber + ': ' + (fantasyPlayer?.position || '?') + ' - ' + fantasyPlayer.last_name;
  }

  /**
   * sets worst and best teams draft value added
   */
  findBestAndWorstDraftsForTeams(): void {
    const teams = this.draftService.getTeamsWithBestValueDrafts(this.selectedDraft);
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
      const player = this.leagueService.platformPlayersMap[pick.playerId];
      if (!player) continue;
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
   * returns dictionary of top players to redraft in keeper league
   */
  getTopKeeperForEachTeam(): {} {
    const keeperPlayersByTeam = {};
    for (const team of this.leagueService.leagueTeamDetails) {
      const pickWithValues = [];
      for (const playerPlatformId of team.roster.players) {
        for (const pick of this.selectedDraft.picks) {
          // if player is picked by team
          if (pick.playerId === playerPlatformId) {
            const fantasyPlayer = this.playerService.getPlayerByPlayerPlatformId(
              pick.playerId,
              this.leagueService.selectedLeague.leaguePlatform
            );
            // if player exists
            if (fantasyPlayer) {
              pickWithValues.push({
                player: fantasyPlayer.full_name,
                pick: `${pick.round}.${pick.pickNumber % this.leagueService.selectedLeague.totalRosters}`,
                value: (this.isSuperFlex ? fantasyPlayer.sf_trade_value : fantasyPlayer.trade_value) - this.draftService.roundPickValue[pick.round - 1]
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

  /**
   * Returns player from player platform id
   * @param playerPlatformId string
   */
  getPlayerByPlayerPlatformId(playerPlatformId: string): FantasyPlayer {
    return this.playerService.getPlayerByPlayerPlatformId(playerPlatformId, this.leagueService.selectedLeague.leaguePlatform);
  }
}
