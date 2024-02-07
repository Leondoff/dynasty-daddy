import { Injectable } from '@angular/core';
import { FantasyPlayer } from '../../model/assets/FantasyPlayer';
import { LeagueTeam } from '../../model/league/LeagueTeam';
import { LeagueService } from '../../services/league.service';
import { CompletedDraft } from '../../model/league/CompletedDraft';
import { LeaguePickDTO } from 'src/app/model/league/LeaguePickDTO';
import { PlayerService } from 'src/app/services/player.service';
import { PowerRankingsService } from './power-rankings.service';
import { LeaguePlatform } from 'src/app/model/league/FantasyPlatformDTO';
import { Observable, Subject, interval, of } from 'rxjs';
import { SleeperApiService } from 'src/app/services/api/sleeper/sleeper-api.service';
import { DisplayService } from 'src/app/services/utilities/display.service';
import { filter, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/init/config.service';
import { StatService } from 'src/app/services/utilities/stat.service';
import { LeagueRawDraftOrderDTO } from 'src/app/model/league/LeagueRawDraftOrderDTO';
import { UntypedFormControl } from '@angular/forms';
import { LeagueDTO } from 'src/app/model/league/LeagueDTO';

@Injectable({
  providedIn: 'root'
})
export class DraftService {

  /** team picks */
  teamPicks: LeaguePickDTO[] = [];

  /** available players */
  selectablePlayers: FantasyPlayer[] = [];

  /** currently selected draft */
  selectedDraft: CompletedDraft | string = 'upcoming';

  /** current filter for mock draft */
  mockDraftConfig: string = 'player';

  /** average value of pick in round */
  roundPickValue: number[] = [];

  /** Mock Draft Player Type */
  mockDraftPlayerType: MockDraftPlayerType = MockDraftPlayerType.All;

  /** Mock Draft Order */
  mockDraftOrder: DraftOrderType = DraftOrderType.Snake;

  /** number of mock draft rounds */
  mockDraftRounds: number = 22;

  /** number of teams in draft */
  mockTeamCount: number = 12;

  /** filter value used for filtering */
  filterTeam: number;

  /** update filtering draft table*/
  updateDraft$: Subject<string> = new Subject<string>();

  /** dict for postion filter dropdown */
  filteredPositions: {} = {}

  /** player search for table */
  searchVal: string = '';

  /** player age filter */
  ageFilter: number[] = [21, 40];

  /** years of NFL experience filter */
  expFilter: number[] = [0, 23];

  /** is draft superflex */
  isSuperflex: boolean = true;

  /** draft view table config */
  completedConfig: string = 'position';

  /** custom sleeper draft id */
  sleeperDraftId: string = '';

  /** from custom sleeper drafts, the players to remove */
  alreadyDraftedList: string[] = [];

  /** is order mode enabled to edit draft page */
  isOrderMode: boolean = false;

  /** override roster id for order mode */
  overrideRosterId: number = 1;

  /** is live draft paused */
  isPaused: boolean = false;

  /** mock draft players yet to be selected */
  mockPlayers: FantasyPlayer[] = [];

  /** manually select players for this team */
  selectedMockDraftTeam: number = 1;

  /** live draft events */
  pauseLiveDraft$: Subject<boolean> = new Subject<boolean>();

  /** live draft status */
  liveDraftStatus$: Subject<string> = new Subject<string>();

  /** live draft speed ms per pick */
  liveDraftSpeed: number = 500;

  /** live draft randomness tier */
  liveDraftRandomness: number = 1;

  /** fantasy draft fantasy market num */
  fantasyMarket: number;

  /** update player ADP details, passes in sleeper id */
  updatePlayerADPDetails$: Subject<string> = new Subject<string>();

  marketOptions: any[] = [
    {
      label: 'Real Draft ADPs',
      options: [
        { 'num': 100, 'value': 'Dynasty Daddy ADP' },
      ]
    }
  ];

  adpScoringFormat = new UntypedFormControl([0, 0.5, 1.0, 2.0]);

  /** form control for scoring filter dropdown */
  adpTepFormat = new UntypedFormControl([0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5]);

  /** form control for scoring filter dropdown */
  adpStartersFormat = new UntypedFormControl([6, 7, 8, 9, 10, 11, 12, 13, 14]);

  /** form control for scoring filter dropdown */
  adpLeagueTypeFormat: string = 'Dynasty';

  /** form control for scoring filter dropdown */
  adpTeamFormat = new UntypedFormControl([4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]);

  /** adp started at date filter */
  adpStartedAt: Date;

  /** is auction toggle for adp */
  isAuction: boolean = false;

  constructor(
    public leagueService: LeagueService,
    private playerService: PlayerService,
    private sleeperApiService: SleeperApiService,
    private displayService: DisplayService,
    private configService: ConfigService,
    private powerRankingsService: PowerRankingsService,
    private statService: StatService
  ) {
  }

  /**
   * generate draft order
   */
  generateDraft(): void {
    this.selectablePlayers = this.getMockDraftPlayerList();
    this.filteredPositions = {
      QB: false,
      RB: false,
      WR: false,
      TE: false
    };
    if (this.fantasyMarket === 100)
      this.updateDraft$.next('refresh');
  }

  /**
   * Get mock draft player list for system
   */
  getMockDraftPlayerList(): FantasyPlayer[] {
    let selectablePlayers = [];
    if (this.mockDraftPlayerType === MockDraftPlayerType.Rookies) { // rookies only
      selectablePlayers = this.playerService.playerValues.slice().filter(player => {
        return player.experience === 0 && player.position !== 'PI';
      });
      if (selectablePlayers.length < 20) {
        selectablePlayers = this.playerService.playerValues.slice().filter(player => {
          return player.experience === 1 && player.position !== 'PI';
        });
      }
    } else if (this.mockDraftPlayerType === MockDraftPlayerType.Vets) { // vets only
      selectablePlayers = this.playerService.playerValues.slice().filter(player => {
        return player.experience !== 0 && player.position !== 'PI';
      });
    } else { // all players
      selectablePlayers = this.playerService.playerValues.slice().filter(player => {
        return player.position !== 'PI';
      });
    }
    // sort players by value
    if (this.fantasyMarket < 100) {
      selectablePlayers = this.playerService.sortListOfPlayers(
        selectablePlayers,
        this.isSuperflex
      )
    } else {
      const adp = this.playerService.sleeperADP
      selectablePlayers = selectablePlayers
        .sort((a, b) => this.isAuction ? (adp[b.sleeper_id] || 0) - (adp[a.sleeper_id] || 0) :
          (adp[a.sleeper_id] || 500) - (adp[b.sleeper_id] || 500))
    }
    return selectablePlayers;
  }

  /**
   * clear filters from table
   */
  clearFilters(): void {
    this.alreadyDraftedList = [];
    this.filterTeam = null;
    this.filteredPositions = {
      QB: false,
      RB: false,
      WR: false,
      TE: false
    };
    this.searchVal = '';
    this.ageFilter = [21, 40];
    this.adpStartersFormat.setValue([8, 9, 10, 11, 12, 13, 14]);
    this.adpTeamFormat.setValue([8, 10, 12, 14]);
    this.adpScoringFormat.setValue([0, 0.5, 1.0]);
    this.adpTepFormat.setValue([0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5]);
    this.adpScoringFormat.setValue([0, 0.5, 1]);
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    this.adpStartedAt = date;
    this.updateDraft$.next();
  }

  /**
   * map draft objects to teams
   * @param teams fantasy teams
   */
  mapDraftObjects(teams: LeagueTeam[]): void {
    const realDrafts = this.leagueService.completedDrafts.filter(d => !d.draft.leagueId.includes('mock')).length;
    if (this.teamPicks.length > 0) return;
    if (!this.leagueService.selectedLeague) {
      for (let rd = 0; rd < this.mockDraftRounds; rd++) {
        teams.forEach((t, ind) => {
          this.teamPicks.push(new LeaguePickDTO().fromMockDraft((rd * this.mockTeamCount) + ind + 1,
            this.displayService.createPickString(rd + 1, ind + 1),
            t.owner.ownerName,
            t.owner.teamName,
            t.roster.rosterId,
            t.roster.rosterId,
            rd));
        });
      }
    } else if (this.leagueService.upcomingDrafts.length > 0 && realDrafts === 0) {
      this.teamPicks = this.leagueService.upcomingDrafts[0].picks;
      this.alreadyDraftedList = this.leagueService.upcomingDrafts[0].picks
        .filter(p => p.playerId)
        .map(p => this.playerService.getPlayerByPlayerPlatformId(p.playerId, this.leagueService.selectedLeague.leaguePlatform)?.name_id)
    } else {
      const projectedDraftOrder =
        this.powerRankingsService.powerRankings.slice().sort((a, b) => b.starterRank - a.starterRank).map(it => it.team.roster.rosterId)
      const draftYear = realDrafts > 0 ?
        (Number(this.leagueService.selectedLeague.season) + 1).toString() : this.leagueService.selectedLeague.season;
      teams.map(team => {
        for (const pick of team.futureDraftCapital) {
          if (pick.year === draftYear) {
            // fleaflicker sets league picks but other platforms do not
            const pickNum = this.leagueService.selectedLeague.leaguePlatform === LeaguePlatform.FLEAFLICKER ? pick.pick : projectedDraftOrder.indexOf(pick.originalRosterId) + 1
            this.teamPicks.push(new LeaguePickDTO().fromMockDraft(((pick.round - 1) * projectedDraftOrder.length) + pickNum,
              this.displayService.createPickString(pick.round, pickNum),
              team.owner?.ownerName,
              team.owner?.teamName,
              team.roster.rosterId,
              pick.originalRosterId || team.roster.rosterId,
              pick.round));
          }
        }
      });
      // if not current year still preload draft with picks
      if (this.teamPicks.length === 0) {
        for (let rd = 1; rd <= this.mockDraftRounds; rd++) {
          projectedDraftOrder.forEach((teamOrder, index) => {
            const team = teams.find(t => t.roster.rosterId == teamOrder);
            this.teamPicks.push(new LeaguePickDTO().fromMockDraft(((rd - 1) * projectedDraftOrder.length) + (index + 1),
              this.displayService.createPickString(rd, (index + 1)),
              team.owner?.ownerName,
              team.owner?.teamName,
              team.roster.rosterId,
              team.roster.rosterId,
              rd));
          })
        }
      }
      this.teamPicks.sort((pickA, pickB) => {
        return pickA.pickNumber - pickB.pickNumber;
      });
      // if extra rounds added that aren't defined
      const roundCount = this.teamPicks.length / teams.length;
      if (this.mockDraftRounds > roundCount) {
        const roundsToAdd = this.mockDraftRounds - roundCount;
        const draftRound = this.teamPicks.slice(-teams.length);
        for (let i = 0; i < roundsToAdd; i++) {
          draftRound.forEach(pick => {
            const pickNum = projectedDraftOrder.indexOf(pick.originalRosterId) + 1
            this.teamPicks.push(new LeaguePickDTO().fromMockDraft(((roundCount + i) * projectedDraftOrder.length) + pickNum,
              this.displayService.createPickString(roundCount + i + 1, pickNum),
              pick.pickOwner,
              pick.pickTeam,
              pick.rosterId,
              pick.rosterId,
              roundCount + i));
          });
        }
      }
    }
    this.teamPicks.sort((a, b) => a.pickNumber - b.pickNumber);
    // sort based on draft order (TODO clean up duplicate code?)
    switch (this.mockDraftOrder) {
      case DraftOrderType.Snake: {
        let tempDraft: LeaguePickDTO[] = []
        for (let i = 0; i < this.mockDraftRounds; i++) {
          const round = this.teamPicks.slice(i * teams.length, (1 + i) * teams.length)
          tempDraft = tempDraft.concat(i % 2 === 0 ? round : round.reverse())
        }
        this.teamPicks = tempDraft;
        this.teamPicks.forEach((pick, ind) => {
          pick.pickNumber = ind + 1
          pick.pickdisplay = this.displayService.createPickString(Math.trunc(ind / teams.length) + 1, ind % teams.length + 1);
        });
        break;
      }
      case DraftOrderType.RoundReversal: {
        let tempDraft: LeaguePickDTO[] = []
        for (let i = 0; i < this.mockDraftRounds; i++) {
          const round = this.teamPicks.slice(i * teams.length, (1 + i) * teams.length)
          tempDraft = tempDraft.concat((i % 2 === 0 && i < 2) || (i % 2 === 1 && i > 2) ? round : round.reverse())
        }
        this.teamPicks = tempDraft;
        this.teamPicks.forEach((pick, ind) => {
          pick.pickNumber = ind + 1
          pick.pickdisplay = this.displayService.createPickString(Math.trunc(ind / teams.length) + 1, ind % teams.length + 1);
        });
        break;
      }
      default:
        break;
    }
  }

  /**
   * reset mock drafts to defaults
   */
  getDraftOrder = () => this.teamPicks.map((_, ind) =>
    this.selectablePlayers[ind]
  );

  /**
   * reset variables when league is changed
   */
  reset(): void {
    this.teamPicks = [];
    this.selectablePlayers = [];
  }

  /**
   * resets mock draft service varibles
   * TODO create an abstract feature service that requires reset functions
   */
  resetLeague(league: LeagueDTO = null): void {
    this.selectedDraft = null;
    this.selectablePlayers = [];
    this.teamPicks = [];
    this.mockDraftConfig = 'player';
    this.isSuperflex = league.isSuperflex;
    this.adpLeagueTypeFormat = league.type == 0 ? 'Redraft' : 'Dynasty';
  }

  /**
  * generate a mock draft
  */
  createMockDraft(): void {
    this.teamPicks = [];
    this.mockPlayers = [];
    this.selectedDraft = 'upcoming';
    const teams = this.leagueService.selectedLeague ? this.leagueService.leagueTeamDetails :
      Array.from({ length: this.mockTeamCount }, (_, index) => new LeagueTeam(null, null).createMockTeam(index + 1))
    this.mapDraftObjects(teams);
  }

  /**
   * get value ratio in player and pick used to select the player
   * @param pick
   * @private
   */
  getPickValueRatio(pick: LeaguePickDTO): number {
    const pickValue = this.getPickValue(pick.round);
    const player = this.playerService.getPlayerByPlayerPlatformId(pick.playerId,
      this.leagueService.selectedLeague.leaguePlatform)
    return ((this.isSuperflex ? player?.sf_trade_value : player?.trade_value) || 0) / pickValue;
  }

  /**
   * get value difference in player and pick used to select the player
   * @param pick
   * @param isAuction default to false
   */
  getPickValueAdded(pick: LeaguePickDTO, isAuction: boolean = false): number {
    const player = this.playerService.getPlayerByPlayerPlatformId(pick.playerId,
      this.leagueService.selectedLeague?.leaguePlatform || LeaguePlatform.SLEEPER)
    const playerValue = this.isSuperflex ? (player?.sf_trade_value || 0) : (player?.trade_value || 0);
    // if auction count value for dollar spent
    if (isAuction) {
      return pick.bidAmount > 0 ? playerValue - pick.bidAmount * 5 : playerValue || 0;
    }
    const pickValue = this.getPickValue(pick.round);
    return playerValue - pickValue;
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
   * get average value of round pick
   */
  generateAVGValuePerRound(selectedDraft: CompletedDraft) {
    const roundValue = [];
    const teamCount = this.leagueService.selectedLeague?.totalRosters || this.mockTeamCount;
    for (let round = 0; round < selectedDraft.draft.rounds; round++) {
      let totalValue = 0;
      for (let pickNum = 0; pickNum < teamCount; pickNum++) {
        const player = this.playerService.getPlayerByPlayerPlatformId(
          selectedDraft.picks[round * teamCount + pickNum]?.playerId,
          this.leagueService.selectedLeague.leaguePlatform
        );
        totalValue += (this.isSuperflex ? player?.sf_trade_value : player?.trade_value) || 0;
      }
      roundValue.push(Math.round(totalValue / teamCount));
    }
    this.roundPickValue = roundValue;
  }

  /**
   * get teams with best value from draft
   * @param selectedDraft completed draft data
   * @returns 
   */
  getTeamsWithBestValueDrafts(selectedDraft: CompletedDraft): any[] {
    if (this.roundPickValue.length === 0) {
      this.generateAVGValuePerRound(selectedDraft);
    }
    const teams: { team: LeagueTeam, valueAdded: number }[] = [];
    for (const team of this.leagueService.leagueTeamDetails) {
      let valueAdded = 0;
      for (const pick of selectedDraft.picks) {
        if (pick.rosterId === team.roster.rosterId) {
          valueAdded += this.getPickValueAdded(pick, selectedDraft?.draft?.type === DraftOrderType.Auction) || 0;
        }
      }
      teams.push({ team, valueAdded });
    }
    return teams.sort((a, b) => {
      return b.valueAdded - a.valueAdded;
    });
  }

  /**
   * get players with best value picks from draft
   * @param selectedDraft completed draft
   */
  sortPlayersByBestValuePick(selectedDraft: CompletedDraft): any[] {
    const isAuction = selectedDraft?.draft?.type === DraftOrderType.Auction;
    const players: { pick: LeaguePickDTO, valueAdded: number }[] = [];
    if (this.roundPickValue.length === 0) {
      this.generateAVGValuePerRound(selectedDraft);
    }

    for (const pick of selectedDraft.picks) {
      players.push({ pick, valueAdded: this.getPickValueAdded(pick, isAuction) });
    }
    return players.sort((a, b) => {
      return b.valueAdded - a.valueAdded;
    });
  }

  /**
   * load a sleeper draft id for the draft table filtering
   */
  loadCustomSleeperLeague(): void {
    this.sleeperApiService.getSleeperCompletedDraftsByDraftId(this.sleeperDraftId, this.mockTeamCount).subscribe(res => {
      this.alreadyDraftedList = res.map(p => this.playerService.getPlayerByPlayerPlatformId(p.playerId, LeaguePlatform.SLEEPER)?.name_id);
      this.updateDraft$.next();
    });
  }

  createLiveDraftSource(): Observable<number> {
    return interval(this.liveDraftSpeed).pipe(
      takeWhile(() => this.selectablePlayers.length !== this.teamPicks.length),
      filter(() => !this.isPaused), // Add filter to continue only if not paused
      tap(() => {
        this.pickMockPlayer();
      })
    );
  }

  /**
   * handler for starting a live draft
   */
  startLiveDraft(): void {
    this.selectablePlayers = [];
    this.mockPlayers = this.getMockDraftPlayerList();
    if (this.teamPicks[0].rosterId === this.selectedMockDraftTeam)
      this.pauseEvent();
    else
      this.resumeEvent();

    const liveDraftObservable$ = this.createLiveDraftSource();

    liveDraftObservable$.pipe(
      takeUntil(this.pauseLiveDraft$)
    ).subscribe();
    this.liveDraftStatus$.next('start');
  }

  // Method to pause the event emission
  pauseEvent(): void {
    this.isPaused = true;
    if (this.configService.isMobile) this.configService.toggleToolbar$.next(true);
    this.pauseLiveDraft$.next(true);
  }

  // Method to resume the event emission
  resumeEvent(): void {
    this.isPaused = false;
    this.pauseLiveDraft$.next(false);
    if (this.configService.isMobile) this.configService.toggleToolbar$.next(false);
    if (this.teamPicks[this.selectablePlayers.length].rosterId !== this.selectedMockDraftTeam) {
      const liveDraftObservable$ = this.createLiveDraftSource();

      liveDraftObservable$.pipe(
        takeUntil(this.pauseLiveDraft$)
      ).subscribe();
    }
  }

  /**
   * mock draft automated draft pick
   */
  pickMockPlayer(): void {
    let weights = [];
    switch (this.liveDraftRandomness) {
      case 1:
        weights = [9, 2, 2, 1];
        break;
      case 2:
        weights = [8, 4, 3, 2, 2, 1, 1, 1];
        break;
      case 3:
        weights = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        break;
      default:
        weights = [1];
        break;
    }
    // Slice weights array if its length is greater than mockPlayers array
    if (weights.length > this.mockPlayers.length) {
      weights = weights.slice(0, this.mockPlayers.length);
    }
    const player = this.statService.pickWeightedRandom(this.mockPlayers, weights);
    const ind = this.mockPlayers.findIndex(p => p.name_id === player.name_id);
    this.mockPlayers.splice(ind, 1);
    this.selectablePlayers.push(player);
    this.liveDraftStatus$.next('pick');
    if (!this.teamPicks[this.selectablePlayers.length])
      this.endLiveDraft();
    if (this.teamPicks[this.selectablePlayers.length].rosterId === this.selectedMockDraftTeam)
      this.pauseEvent();
  }

  /**
   * Select a player in a live draft
   * @param picked player selected in live draft
   */
  selectPlayer(picked: FantasyPlayer): void {
    const ind = this.mockPlayers.findIndex(p => p.name_id === picked.name_id);
    const player = this.mockPlayers.splice(ind, 1)[0];
    this.selectablePlayers.push(player);
    this.liveDraftStatus$.next('pick');
    if (!this.teamPicks[this.selectablePlayers.length])
      this.endLiveDraft();
    else if (this.teamPicks[this.selectablePlayers.length].rosterId === this.selectedMockDraftTeam)
      this.pauseEvent();
    else
      this.resumeEvent();
  }

  /**
   * end live draft
   */
  endLiveDraft(): void {
    // if logged in create a new completed draft
    if (this.leagueService.selectedLeague) {
      const draftId = this.leagueService.completedDrafts.length;
      const draftOrder = {}
      this.teamPicks.slice(0, this.mockTeamCount).forEach((p, ind) =>
        draftOrder[ind] = p.originalRosterId
      );
      const draftYear = this.leagueService.completedDrafts.filter(d => !d.draft.leagueId.includes('mock')).length > 0 ?
        (Number(this.leagueService.selectedLeague.season) + 1).toString() : this.leagueService.selectedLeague.season;
      const draft = new LeagueRawDraftOrderDTO().fromSleeper(
        draftId.toString(),
        'mock_' + draftId,
        'completed',
        this.mockDraftConfig,
        {},
        draftOrder,
        draftYear,
        { 'player_type': this.mockDraftPlayerType, 'rounds': this.teamPicks.length / (this.leagueService.selectedLeague?.totalRosters || this.mockTeamCount) }
      )
      const updatedPicks = this.teamPicks;
      this.teamPicks.forEach((p, ind) => {
        if (!this.selectablePlayers[ind]) return;
        updatedPicks[ind].playerId = this.playerService.getPlayerPlatformId(
          this.selectablePlayers[ind],
          this.leagueService.selectedLeague?.leaguePlatform || LeaguePlatform.SLEEPER
        );
      }
      )
      this.leagueService.completedDrafts.push(new CompletedDraft(draft, updatedPicks));
      this.selectedDraft = this.leagueService.completedDrafts[draftId];
    }
    this.mockPlayers = [];
    this.pauseEvent();
    this.liveDraftStatus$.next('end');
  }

  /** helper to refresh draft adp */
  refreshADP(): void {
    this.playerService.updateSleeperADP(
      this.mockDraftPlayerType,
      this.isSuperflex,
      this.adpStartersFormat.value,
      this.adpTeamFormat.value,
      this.adpLeagueTypeFormat,
      this.adpScoringFormat.value,
      this.adpTepFormat.value,
      false,
      this.isAuction,
      this.adpStartedAt
    ).subscribe(_ => {
      this.generateDraft();
    });
  }
}

export enum MockDraftPlayerType {
  All,
  Rookies,
  Vets
}

export enum DraftOrderType {
  Linear,
  Snake,
  RoundReversal,
  Auction
}
