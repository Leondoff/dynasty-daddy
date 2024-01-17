import { Injectable } from '@angular/core';
import { FantasyPlayer } from '../../model/assets/FantasyPlayer';
import { LeagueTeam } from '../../model/league/LeagueTeam';
import { LeagueService } from '../../services/league.service';
import { CompletedDraft } from '../../model/league/CompletedDraft';
import { LeaguePickDTO } from 'src/app/model/league/LeaguePickDTO';
import { PlayerService } from 'src/app/services/player.service';
import { PowerRankingsService } from './power-rankings.service';
import { LeaguePlatform } from 'src/app/model/league/FantasyPlatformDTO';
import { Subject } from 'rxjs';
import { SleeperApiService } from 'src/app/services/api/sleeper/sleeper-api.service';

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
  mockDraftRounds: number = 30;

  /** filter value used for filtering */
  filterTeam: number;

  /** update filtering draft table*/
  updateDraft$: Subject<boolean> = new Subject<boolean>();

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

  constructor(
    public leagueService: LeagueService,
    private playerService: PlayerService,
    private sleeperApiService: SleeperApiService,
    private powerRankingsService: PowerRankingsService
  ) {
  }

  /**
   * generate draft order
   */
  generateDraft(): void {
    if (this.mockDraftPlayerType === MockDraftPlayerType.Rookies) { // rookies only
      this.selectablePlayers = this.playerService.playerValues.slice().filter(player => {
        return player.experience === 0 && player.position !== 'PI';
      });
      if (this.selectablePlayers.length < 20) {
        this.selectablePlayers = this.playerService.playerValues.slice().filter(player => {
          return player.experience === 1 && player.position !== 'PI';
        });
      }
    } else if (this.mockDraftPlayerType === MockDraftPlayerType.Vets) { // vets only
      this.selectablePlayers = this.playerService.playerValues.slice().filter(player => {
        return player.experience !== 0 && player.position !== 'PI';
      });
    } else { // all players
      this.selectablePlayers = this.playerService.playerValues.slice().filter(player => {
        return player.position !== 'PI';
      });
    }
    // sort players by value
    this.selectablePlayers = this.playerService.sortListOfPlayers(
      this.selectablePlayers,
      this.isSuperflex
    )
    this.filteredPositions = {
      QB: false,
      RB: false,
      WR: false,
      TE: false
    };
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
    this.ageFilter = [21, 40]
    this.updateDraft$.next(false);
  }

  /**
   * map draft objects to teams
   * @param teams fantasy teams
   */
  mapDraftObjects(teams: LeagueTeam[]): void {
    if (this.teamPicks.length > 0) return;
    if (!this.leagueService.selectedLeague) {
      for (let rd = 0; rd < this.mockDraftRounds; rd++) {
        teams.forEach((t, ind) => {
          this.teamPicks.push(new LeaguePickDTO().fromMockDraft((rd * 12) + ind + 1,
            this.createPickString(rd + 1, ind + 1),
            t.owner.ownerName,
            t.owner.teamName,
            t.roster.rosterId,
            t.roster.rosterId));
        });
      }
    } else if (teams[0]?.upcomingDraftOrder.length !== 0 || this.leagueService.upcomingDrafts.length > 0) {
      if (teams[0]?.upcomingDraftOrder.length !== 0) {
        teams.map(team => {
          for (const pick of team.upcomingDraftOrder) {
            if (pick.year === this.leagueService.selectedLeague.season) {
              this.teamPicks.push(new LeaguePickDTO().fromMockDraft(((pick.round - 1) * teams.length) + pick.pick,
                this.createPickString(pick.round, pick.pick),
                team.owner?.ownerName,
                team.owner?.teamName,
                team.roster.rosterId,
                pick.originalRosterId || team.roster.rosterId));
            }
          }
        });
      } else {
        // const draft = this.leagueService.upcomingDrafts[0].draft;
        this.teamPicks = this.leagueService.upcomingDrafts[0].picks;
        this.alreadyDraftedList = this.leagueService.upcomingDrafts[0].picks
          .filter(p => p.playerId)
          .map(p => this.playerService.getPlayerByPlayerPlatformId(p.playerId, this.leagueService.selectedLeague.leaguePlatform)?.name_id)
      }
    } else {
      const projectedDraftOrder =
        this.powerRankingsService.powerRankings.slice().sort((a, b) => b.starterRank - a.starterRank).map(it => it.team.roster.rosterId)
      teams.map(team => {
        for (const pick of team.futureDraftCapital) {
          if (pick.year === this.leagueService.selectedLeague.season) {
            // fleaflicker sets league picks but other platforms do not
            const pickNum = this.leagueService.selectedLeague.leaguePlatform === LeaguePlatform.FLEAFLICKER ? pick.pick : projectedDraftOrder.indexOf(pick.originalRosterId) + 1
            this.teamPicks.push(new LeaguePickDTO().fromMockDraft(((pick.round - 1) * projectedDraftOrder.length) + pickNum,
              this.createPickString(pick.round, pickNum),
              team.owner?.ownerName,
              team.owner?.teamName,
              team.roster.rosterId,
              pick.originalRosterId || team.roster.rosterId));
          }
        }
      });
      // if not current year still preload draft with picks
      if (this.teamPicks.length === 0) {
        for (let rd = 1; rd <= 5; rd++) {
          projectedDraftOrder.forEach((teamOrder, index) => {
            const team = teams.find(t => t.roster.rosterId == teamOrder);
            this.teamPicks.push(new LeaguePickDTO().fromMockDraft(((rd - 1) * projectedDraftOrder.length) + (index + 1),
              this.createPickString(rd, (index + 1)),
              team.owner?.ownerName,
              team.owner?.teamName,
              team.roster.rosterId,
              team.roster.rosterId));
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
              this.createPickString(roundCount + i + 1, pickNum),
              pick.pickOwner,
              pick.pickTeam,
              pick.rosterId,
              pick.rosterId));
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
          pick.pickdisplay = this.createPickString(Math.trunc(ind / teams.length) + 1, ind % teams.length + 1);
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
          pick.pickdisplay = this.createPickString(Math.trunc(ind / teams.length) + 1, ind % teams.length + 1);
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
   * create pick string display
   * @param pick pick details
   * @private
   * returns string
   */
  private createPickString(round: number, pick: number): string {
    return round.toString() + '.' + (pick > 9 ? pick.toString() : '0' + pick.toString());
  }

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
  resetLeague(): void {
    this.selectedDraft = null;
    this.selectablePlayers = [];
    this.teamPicks = [];
    this.mockDraftConfig = 'player';
  }

  /**
  * generate a mock draft
  */
  createMockDraft(): void {
    this.teamPicks = [];
    this.selectedDraft = 'upcoming';
    const teams = this.leagueService.selectedLeague ? this.leagueService.leagueTeamDetails :
      Array.from({ length: 12 }, (_, index) => new LeagueTeam(null, null).createMockTeam(index + 1))
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
      this.leagueService.selectedLeague.leaguePlatform)
    const playerValue = this.isSuperflex ? (player?.sf_trade_value || 0) : (player?.trade_value || 0);
    // if auction count value for dollar spent
    if (isAuction) {
      return pick.bidAmount !== 0 ? playerValue / pick.bidAmount : 0;
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
    for (let round = 0; round < selectedDraft.draft.rounds; round++) {
      let totalValue = 0;
      for (let pickNum = 0; pickNum < this.leagueService.selectedLeague.totalRosters; pickNum++) {
        const player = this.playerService.getPlayerByPlayerPlatformId(
          selectedDraft.picks[round * this.leagueService.selectedLeague.totalRosters + pickNum]?.playerId,
          this.leagueService.selectedLeague.leaguePlatform
        );
        totalValue += (this.isSuperflex ? player?.sf_trade_value : player?.trade_value) || 0;
      }
      roundValue.push(Math.round(totalValue / this.leagueService.selectedLeague.totalRosters));
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
    this.sleeperApiService.getSleeperCompletedDraftsByDraftId(this.sleeperDraftId, 12).subscribe(res => {
      this.alreadyDraftedList = res.map(p => this.playerService.getPlayerByPlayerPlatformId(p.playerId, LeaguePlatform.SLEEPER)?.name_id);
      this.updateDraft$.next();
    });
  }
}

export enum MockDraftPlayerType {
  Rookies,
  Vets,
  All
}

export enum DraftOrderType {
  Linear,
  Snake,
  RoundReversal,
  Auction
}
