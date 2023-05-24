import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TradeService } from '../services/trade.service';
import { TradePackage } from '../model/tradePackage';
import { PlayerService } from '../../services/player.service';
import { BaseComponent } from '../base-component.abstract';
import { UntypedFormControl } from '@angular/forms';
import { ReplaySubject, Subject, timer } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { FantasyPlayer } from '../../model/assets/FantasyPlayer';
import { take, takeUntil } from 'rxjs/operators';
import { ConfigService } from '../../services/init/config.service';
import { LeagueService } from '../../services/league.service';
import { PowerRankingsService } from '../services/power-rankings.service';
import { TeamPowerRanking } from '../model/powerRankings';
import { PlayerComparisonService } from '../services/player-comparison.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LeagueSwitchService } from '../services/league-switch.service';
import { DisplayService } from '../../services/utilities/display.service';
import { LeagueTeam } from '../../model/league/LeagueTeam';
import { DraftCapital } from '../../model/assets/DraftCapital';

@Component({
  selector: 'app-trade-center',
  templateUrl: './trade-center.component.html',
  styleUrls: ['./trade-center.component.scss']
})
export class TradeCenterComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {

  /** list of players */
  protected players: FantasyPlayer[] = [];

  /** control for the selected player */
  public playerCtrl: UntypedFormControl = new UntypedFormControl();

  /** control for the MatSelect filter keyword */
  public playerFilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of players filtered by search keyword */
  public filteredTeam1Players: ReplaySubject<FantasyPlayer[]> = new ReplaySubject<FantasyPlayer[]>(1);

  /** control for the selected player */
  public player2Ctrl: UntypedFormControl = new UntypedFormControl();

  /** control for the MatSelect filter keyword */
  public player2FilterCtrl: UntypedFormControl = new UntypedFormControl();

  /** list of players filtered by search keyword */
  public filteredTeam2Players: ReplaySubject<FantasyPlayer[]> = new ReplaySubject<FantasyPlayer[]>(1);

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  /** list of players from team 1 */
  public team1PlayerList: FantasyPlayer[] = [];

  /** list of players for team 2 */
  public team2PlayerList: FantasyPlayer[] = [];

  /** list of players to drop from trade */
  public team1PlayerDropList: FantasyPlayer[] = [];

  /** list of players to drop from trade */
  public team2PlayerDropList: FantasyPlayer[] = [];

  /** list of all players involved in the trade */
  public combinedPlayerList: FantasyPlayer[] = [];

  /** is super flex toggle for trade package */
  public isSuperFlex: boolean;

  /** hide/show the advance trade calculator settings */
  public toggleAdvancedSettings: boolean = false;

  /** hide/show the recommended players to drop */
  public showDrops: boolean = false;

  /** acceptance variant number */
  public acceptanceVariance: number;

  /** player rankings object for team 1 */
  public team1Rankings: TeamPowerRanking;

  /** player rankings object for team 2 */
  public team2Rankings: TeamPowerRanking;

  /** manually selected team 1 user id */
  public selectedTeam1: string = null;

  /** manually selected team 2 user id */
  public selectedTeam2: string = null;

  /** recommended players to add to trade list */
  public recommendedPlayers: FantasyPlayer[] = [];

  /** which side of the trade is favored */
  public favoredSide: number = 0;

  /** mock power rankings for trade */
  public team1MockRankings: TeamPowerRanking;

  /** mock power rankings for trade */
  public team2MockRankings: TeamPowerRanking;

  @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;

  @ViewChild('singleSelect2', { static: true }) singleSelect2: MatSelect;

  constructor(
    public tradeTool: TradeService,
    public playerService: PlayerService,
    public configService: ConfigService,
    public leagueService: LeagueService,
    public powerRankingsService: PowerRankingsService,
    public playerComparisonService: PlayerComparisonService,
    public leagueSwitchService: LeagueSwitchService,
    public displayService: DisplayService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.playerService.playerValues.length === 0) {
      this.playerService.loadPlayerValuesForToday();
    } else {
      this.initializeTradeCalculator();
    }
    this.addSubscriptions(this.playerService.currentPlayerValuesLoaded$.subscribe(() => {
      this.initializeTradeCalculator();
    }),
      this.leagueSwitchService.leagueChanged$.subscribe(() => {
        this.switchLeagueTradePackage();
      }),
      this.route.queryParams.subscribe(params => {
        this.leagueSwitchService.loadFromQueryParams(params);
      })
    );
  }

  /**
   * initialization code for trade calculator
   */
  initializeTradeCalculator(): void {
    this.team1PlayerList = this.tradeTool.tradePackage?.team1Assets || [];
    this.team2PlayerList = this.tradeTool.tradePackage?.team2Assets || [];
    // weird issue with setting || true for is superflex
    if (this.tradeTool.tradePackage) {
      this.isSuperFlex = this.tradeTool.tradePackage?.isSuperFlex;
    } else {
      this.isSuperFlex = this.leagueService.selectedLeague?.isSuperflex || true;
    }
    this.acceptanceVariance = this.tradeTool.tradePackage?.acceptanceVariance || 5;

    // set initial selection
    this.playerCtrl.setValue(this.playerService.playerValues[10]);
    this.player2Ctrl.setValue(this.playerService.playerValues[10]);

    this.players = this.playerService.playerValues.slice();

    // if logged in set initial user id to team 2 user id
    if (this.leagueService.selectedLeague &&
      this.leagueService.leagueUser &&
      this.team1PlayerList.length === 0 &&
      this.team2PlayerList.length === 0) {
      this.selectedTeam2 = this.leagueService.leagueUser?.userData?.user_id;
      this.team2Rankings = this.powerRankingsService.findTeamFromRankingsByUserId(this.selectedTeam2);
    }

    // generate new trade object (this is to catch if a league member logged in mid trade)
    this.processTrade();
    // load the initial player list
    this.filteredTeam1Players.next(this.tradeTool.filterPlayersList(this.tradeTool.tradePackage?.team1UserId).slice(0, 10));
    this.filteredTeam2Players.next(this.tradeTool.filterPlayersList(this.tradeTool.tradePackage?.team2UserId).slice(0, 10));

    // listen for search field value changes
    this.playerFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterTeamPlayers(this.playerFilterCtrl, this.tradeTool.tradePackage?.team1UserId, this.filteredTeam1Players);
      });

    this.player2FilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterTeamPlayers(this.player2FilterCtrl, this.tradeTool.tradePackage?.team2UserId, this.filteredTeam2Players);
      });
  }

  ngAfterViewInit = () =>
    this.setInitialValue()

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * Sets the initial value after the filteredPlayers are loaded initially
   */
  protected setInitialValue(): any {
    this.initializeSubscriptions(this.singleSelect, this.filteredTeam1Players);
    this.initializeSubscriptions(this.singleSelect2, this.filteredTeam2Players);
  }

  /**
   * initialize selection filter subscriptions for mat search dropdowns
   * @param selectObject Mat select
   * @param filterSubscription replay subject
   * @private
   */
  private initializeSubscriptions(selectObject: MatSelect, filterSubscription: ReplaySubject<FantasyPlayer[]>): void {
    filterSubscription
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        selectObject.compareWith = (a: FantasyPlayer, b: FantasyPlayer) => a && b && a.name_id === b.name_id;
      });
  }

  /**
   * filter players for selected dropdown
   * @protected
   */
  protected filterTeamPlayers(filterCtrl: UntypedFormControl, userId: string, filterSubscription: ReplaySubject<FantasyPlayer[]>): any {
    if (!this.players) {
      return;
    }
    // get the search keyword
    let search = filterCtrl.value;
    if (!search) {
      filterSubscription.next(this.tradeTool.filterPlayersList(userId).slice(0, 10));
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the players
    filterSubscription.next(
      this.tradeTool.filterPlayersList(userId, true)
        .filter(player => ((player.full_name.toLowerCase().indexOf(search) > -1
          || player.owner?.ownerName.toLowerCase().indexOf(search) > -1
          || player.position.toLowerCase().indexOf(search) > -1))).slice(0, 10));
  }

  /**
   * process trade and updated trade package
   */
  processTrade(): void {
    const player1 = this.team1PlayerList.slice();
    const player2 = this.team2PlayerList.slice();
    const trade = new TradePackage(
      player1,
      player2,
      this.acceptanceVariance,
      this.playerService.selectedMarket
    );
    if (this.leagueService.selectedLeague) {
      trade.team1UserId = this.selectedTeam1 || this.tradeTool.tradePackage?.team1UserId;
      trade.team2UserId = this.selectedTeam2 || this.tradeTool.tradePackage?.team2UserId;
      // set player if null
      if (!trade.team1UserId && player1.length === 1) {
        trade.team1UserId = player1[0]?.owner?.userId || null;
      }
      if (!trade.team2UserId && player2.length === 1) {
        trade.team2UserId = player2[0]?.owner?.userId || null;
      }
      if (player1.length === 0 && this.selectedTeam1 !== this.team1Rankings?.team?.owner.userId) {
        trade.team1UserId = null;
        this.team1Rankings = null;
      }
      if (player2.length === 0 && this.selectedTeam2 !== this.team2Rankings?.team?.owner.userId) {
        trade.team2UserId = null;
        this.team2Rankings = null;
      }
    }
    this.tradeTool.tradePackage = this.tradeTool.determineTrade(trade, this.isSuperFlex);
    this.recommendedPlayers = this.tradeTool.findBestPlayerForValue(
      this.tradeTool.tradePackage.valueToEvenTrade * 1.03,
      this.isSuperFlex,
      this.tradeTool.tradePackage
    );
    this.favoredSide = this.tradeTool.tradePackage.getWhichSideIsFavored();
    this.generateMockPowerRankings(trade);
    this.determineDropPlayerList();
    this.refreshDisplay();
  }

  /**
   * Determines and sets drop players list for a processed trade.
   * @private
   */
  private determineDropPlayerList(): void {
    this.team1PlayerDropList = [];
    this.team2PlayerDropList = [];
    if (this.team1MockRankings && this.leagueService.selectedLeague
      && this.team1MockRankings?.team?.roster.players.length > this.leagueService.selectedLeague.rosterSize) {
      this.team1PlayerDropList = this.team1MockRankings.getRecommendedPlayersToDrop(
        this.isSuperFlex,
        this.team1MockRankings.team.roster.players.length - this.leagueService.selectedLeague.rosterSize
      );
    }
    if (this.team2MockRankings && this.leagueService.selectedLeague
      && this.team2MockRankings?.team?.roster.players.length > this.leagueService.selectedLeague.rosterSize) {
      this.team2PlayerDropList = this.team2MockRankings.getRecommendedPlayersToDrop(
        this.isSuperFlex,
        this.team2MockRankings.team.roster.players.length - this.leagueService.selectedLeague.rosterSize
      );
    }
  }

  /**
   * refreshes the power rankings and search filters when updating a trade
   * @private
   */
  private refreshDisplay(): void {
    // set team needs value
    if (this.tradeTool.tradePackage?.team1UserId && !this.team1Rankings) {
      this.team1Rankings = this.powerRankingsService.findTeamFromRankingsByUserId(this.tradeTool.tradePackage.team1UserId);
    }
    if (this.tradeTool.tradePackage?.team2UserId && !this.team2Rankings) {
      this.team2Rankings = this.powerRankingsService.findTeamFromRankingsByUserId(this.tradeTool.tradePackage.team2UserId);
    }
    this.filterTeamPlayers(this.playerFilterCtrl, this.tradeTool.tradePackage?.team1UserId, this.filteredTeam1Players);
    this.filterTeamPlayers(this.player2FilterCtrl, this.tradeTool.tradePackage?.team2UserId, this.filteredTeam2Players);
  }

  /**
   * add player to team 2 list
   * @param player selected player
   */
  addPlayerToTeam1(player: FantasyPlayer): void {
    if (player) {
      this.team1PlayerList.push(player);
      this.combinedPlayerList = this.team1PlayerList.concat(this.team2PlayerList);
      this.processTrade();
    }
  }

  /**
   * add player to team 2 list
   * @param player selected player
   */
  addPlayerToTeam2(player: FantasyPlayer): void {
    if (player) {
      this.team2PlayerList.push(player);
      this.combinedPlayerList = this.team1PlayerList.concat(this.team2PlayerList);
      this.processTrade();
    }
  }

  /**
   * remove player from team 1 list by index
   * @param index
   */
  removePlayerFromTeam1(index: number): void {
    this.team1PlayerList.splice(index, 1);
    this.combinedPlayerList = this.team1PlayerList.concat(this.team2PlayerList);
    this.processTrade();
  }

  /**
   * remove player from team 2 list by index
   * @param index number
   */
  removePlayerFromTeam2(index: number): void {
    this.team2PlayerList.splice(index, 1);
    this.combinedPlayerList = this.team1PlayerList.concat(this.team2PlayerList);
    this.processTrade();
  }

  /**
   * return trade background color
   */
  getTradeBackgroundColor(): object {
    if (this.tradeTool.tradePackage?.valueToEvenTrade
      > this.tradeTool.tradePackage?.acceptanceBufferAmount) {
      return { 'background-color': '#ff3b3b' };
    } else {
      return { 'background-color': '#434342' };
    }
  }

  /**
   * clear trade table objects
   */
  clearTradeTable(): void {
    this.team1PlayerList = [];
    this.team2PlayerList = [];
    this.team1PlayerDropList = [];
    this.team2PlayerDropList = [];
    this.combinedPlayerList = [];
    this.showDrops = false;
    this.team2Rankings = null;
    this.team1Rankings = null;
    this.team2MockRankings = null;
    this.team1MockRankings = null;
    this.tradeTool.tradePackage = null;
    this.filterTeamPlayers(this.playerFilterCtrl, this.tradeTool.tradePackage?.team1UserId, this.filteredTeam1Players);
    this.filterTeamPlayers(this.player2FilterCtrl, this.tradeTool.tradePackage?.team2UserId, this.filteredTeam2Players);
  }

  /**
   * add players to trade to even out trade.
   */
  evenOutTrade(): void {
    // prevent an infinite loop
    let index = 0;
    while (this.tradeTool.tradePackage?.valueToEvenTrade > this.tradeTool.tradePackage?.acceptanceBufferAmount || index > 10) {
      // get player to add to trade
      const playerToAddList = this.tradeTool.findBestPlayerForValue(
        this.tradeTool.tradePackage.valueToEvenTrade * 1.01,
        this.isSuperFlex,
        this.tradeTool.tradePackage,
        5
      );
      // randomly select player to add
      const playerToAdd = playerToAddList[Math.floor(Math.random() * playerToAddList.length)] || null;
      // if player null stop adding players
      if (!playerToAdd) {
        return;
      }
      // add player to the team with less value
      this.tradeTool.tradePackage.getWhichSideIsFavored() === 1 ? this.addPlayerToTeam2(playerToAdd) : this.addPlayerToTeam1(playerToAdd);
      index++;
    }
  }

  /**
   * Toggles showing recommended drops or not
   */
  toggleRecommendedDrops(): void {
    this.showDrops = !this.showDrops;
  }

  /**
   * selection made for team 2 filter
   */
  selectionMadeTeam1(): void {
    this.team1Rankings = this.powerRankingsService.findTeamFromRankingsByUserId(this.selectedTeam1);
    this.team1PlayerList = [];
    this.processTrade();
  }

  /**
   * selection made for team 2 filter
   */
  selectionMadeTeam2(): void {
    this.team2Rankings = this.powerRankingsService.findTeamFromRankingsByUserId(this.selectedTeam2);
    this.team2PlayerList = [];
    this.processTrade();
  }

  /**
   * opens trade package in player comparison service.
   */
  async openPlayerComparisonPage(): Promise<any> {
    this.playerComparisonService.selectedPlayers = [];
    this.playerComparisonService.group2SelectedPlayers = [];
    this.playerComparisonService.isGroupMode = true;
    this.team1PlayerList.map(player => {
      this.playerComparisonService.addPlayerToCharts(player, false);
    });
    this.team2PlayerList.map(player => {
      this.playerComparisonService.addPlayerToCharts(player, true);
    });
    await timer(1000).pipe(take(1)).toPromise();
    this.router.navigate(['players/comparison'],
      {
        queryParams: this.leagueSwitchService.buildQueryParams()
      }
    );
  }

  /**
   * strips out any league specific data from trade calculator when switching leagues
   * @private
   */
  private switchLeagueTradePackage(): void {
    this.team2Rankings = null;
    this.team1Rankings = null;
    if (this.tradeTool.tradePackage) {
      this.tradeTool.tradePackage.team2UserId = null;
      this.tradeTool.tradePackage.team1UserId = null;
    }
    this.filterTeamPlayers(this.playerFilterCtrl, this.tradeTool.tradePackage?.team1UserId, this.filteredTeam1Players);
    this.filterTeamPlayers(this.player2FilterCtrl, this.tradeTool.tradePackage?.team2UserId, this.filteredTeam2Players);
  }

  /**
   *  //////////////////////////////////////
   *  //  Power Rankings Comparison Logic //
   *  //////////////////////////////////////
   *  TODO This feature has functions that should be added to fantasy player object but wouldn't
   *  TODO recognize the function. Look into it once you have time.
   */


  /**
   * generates mock power rankings for comparison tool
   * @param trade TradePackage
   */
  generateMockPowerRankings(trade: TradePackage): void {
    this.team2MockRankings = null;
    this.team1MockRankings = null;
    if (trade.team1UserId && trade.team2UserId && trade.team1UserId != 'none' && trade.team2UserId != 'none') {
      const newLeague: LeagueTeam[] = (JSON.parse(JSON.stringify(this.leagueService.leagueTeamDetails)));
      const leaguePlatform = this.leagueService.selectedLeague.leaguePlatform;
      newLeague.forEach(team => {
        if (team.owner.userId === trade.team1UserId) {
          team.roster.players = team.roster.players
            .filter(playerPlatformId => !trade.team1Assets
              .map(it => this.playerService.getPlayerPlatformId(it, leaguePlatform)).includes(playerPlatformId))
            .concat(trade.team2Assets.filter(it => it.position !== 'PI').map(it => this.playerService.getPlayerPlatformId(it, leaguePlatform)));
          this.handleMockDraftCapitalChanges(team,
            trade.team1Assets.filter(asset => asset.position === 'PI'),
            trade.team2Assets.filter(asset => asset.position === 'PI'));
        }
        if (team.owner.userId === trade.team2UserId) {
          team.roster.players = team.roster.players
            .filter(playerPlatformId => !trade.team2Assets
              .map(it => this.playerService.getPlayerPlatformId(it, leaguePlatform)).includes(playerPlatformId))
            .concat(trade.team1Assets.filter(it => it.position !== 'PI').map(it => this.playerService.getPlayerPlatformId(it, leaguePlatform)));
          this.handleMockDraftCapitalChanges(team,
            trade.team2Assets.filter(asset => asset.position === 'PI'),
            trade.team1Assets.filter(asset => asset.position === 'PI'));
        }
      });
      this.powerRankingsService.generatePowerRankings(
        newLeague,
        this.playerService.playerValues,
        this.leagueService.selectedLeague.leaguePlatform,
        true
      ).subscribe(powerRankings =>
        powerRankings.forEach(team => {
          if (team.team.owner.userId === trade.team1UserId) {
            this.team1MockRankings = team;
          }
          if (team.team.owner.userId === trade.team2UserId) {
            this.team2MockRankings = team;
          }
        })
      );
    }
  }

  // TODO sort some of this code on the fantasy player object
  /**
   * wrapper function that handles draft capital for generating mock power rankings
   * @param team
   * @param picksToRemove
   * @param picksToAdd
   */
  handleMockDraftCapitalChanges(team: LeagueTeam, picksToRemove: FantasyPlayer[], picksToAdd: FantasyPlayer[]): void {
    picksToRemove.forEach(pick => {
      team.futureDraftCapital = this.removePickFromDraftCapital(team.futureDraftCapital, pick);
    });
    team.futureDraftCapital = team.futureDraftCapital.concat(...picksToAdd.map(asset => this.convertFantasyPlayerToDraftCapital(asset)));
  }

  /**
   * Processes removing a pick from a teams assets before generating new mock power rankings
   * TODO maybe abstract out determining the draft pick to spot
   * @param draftCapital list of draft capital to remove from
   * @param pick pick to remove from list
   */
  removePickFromDraftCapital(draftCapital: DraftCapital[], pick: FantasyPlayer): DraftCapital[] {
    let i = 0;
    while (i < draftCapital.length) {
      const draftCap = draftCapital[i];
      if (pick.last_name.includes(draftCap.round.toString()) && pick.first_name === draftCap.year) {
        if (draftCap.pick < this.leagueService.selectedLeague.totalRosters / 3 && pick.last_name.includes('Early')) {
          draftCapital.splice(i, 1);
          i = draftCapital.length;
        } else if (draftCap.pick < this.leagueService.selectedLeague.totalRosters / 3 * 2 && pick.last_name.includes('Mid')) {
          draftCapital.splice(i, 1);
          i = draftCapital.length;
        } else {
          draftCapital.splice(i, 1);
          i = draftCapital.length;
        }
      }
      i++;
    }
    return draftCapital;
  }

  // TODO move to fantasy player object
  /**
   * Converts fantasy player object to draft capital
   * @param pick pick to convert
   */
  convertFantasyPlayerToDraftCapital(pick: FantasyPlayer): DraftCapital {
    if (pick.position !== 'PI') {
      return null;
    }
    return new DraftCapital(
      Number(pick.last_name.charAt(pick.last_name.length - 3)),
      this.getPickNumber(pick),
      pick.first_name
    );
  }

  /**
   * Compares the mock rankings and actual rankings and returns difference
   * @param tradeSide which side of the trade
   * @param metricInd which metric index to use
   */
  public getPowerRankingsDifference(tradeSide: number, metricInd: number): number {
    // 6 == tier index to denote change in team tier
    if (metricInd === 6) {
      return tradeSide === 1 ? this.team1Rankings?.tier - this.team1MockRankings?.tier :
        this.team2Rankings?.tier - this.team2MockRankings?.tier;
    }
    // 5 == draft capital since it is stored in a separate part of the object
    if (metricInd === 5) {
      return tradeSide === 1 ? this.team1Rankings?.picks.rank - this.team1MockRankings?.picks.rank :
        this.team2Rankings?.picks.rank - this.team2MockRankings?.picks.rank;
    }
    return tradeSide === 1 ? this.team1Rankings?.roster[metricInd].rank - this.team1MockRankings?.roster[metricInd].rank :
      this.team2Rankings?.roster[metricInd].rank - this.team2MockRankings?.roster[metricInd].rank;
  }

  /**
   * returns pick number for fantasy player pick since we don't store each pick separately
   * @param pick
   */
  getPickNumber(pick: FantasyPlayer): number {
    if (pick.position !== 'PI') {
      return -1;
    }
    if (pick.last_name.includes('Mid')) {
      return 6;
    } else if (pick.last_name.includes('Early')) {
      return 2;
    } else {
      return 8;
    }
  }

  /**
   * When the fantasy market is changed
   * @param $event change market 
   */
  onMarketChange($event): void {
    this.players = this.playerService.playerValues.slice();
    this.playerService.selectedMarket = $event;
    this.team1Rankings = null;
    this.team2Rankings = null;
    this.processTrade();
  }
}
