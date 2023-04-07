import { Injectable } from '@angular/core';
import { FantasyPlayer } from '../../model/assets/FantasyPlayer';
import { TeamMockDraftPick } from '../model/mockDraft';
import { LeagueTeam } from '../../model/league/LeagueTeam';
import { LeagueService } from '../../services/league.service';
import { CompletedDraft } from '../../model/league/CompletedDraft';
import { LeagueCompletedPickDTO } from 'src/app/model/league/LeagueCompletedPickDTO';
import { PlayerService } from 'src/app/services/player.service';
import { PowerRankingsService } from './power-rankings.service';

@Injectable({
  providedIn: 'root'
})
export class DraftService {

  /** team picks */
  teamPicks: TeamMockDraftPick[] = [];

  /** available players */
  selectablePlayers: FantasyPlayer[] = [];

  /** selected players in the mock draft */
  mockDraftSelectedPlayers: FantasyPlayer[] = [];

  /** currently selected draft */
  selectedDraft: CompletedDraft | string;

  /** current filter for mock draft */
  mockDraftConfig: string = 'player';

  /** average value of pick in round */
  roundPickValue: number[] = [];

  /** Mock Draft Player Type */
  mockDraftPlayerType: MockDraftPlayerType = MockDraftPlayerType.Rookies;

  /** Mock Draft Order */
  mockDraftOrder: MockDraftOrder = MockDraftOrder.Linear;

  mockDraftRounds: number;

  constructor(public leagueService: LeagueService, private playerService: PlayerService, private powerRankingsService: PowerRankingsService) {
  }

  /**
   * generate draft order
   */
  generateDraft(): void {
    if (this.mockDraftPlayerType === MockDraftPlayerType.Rookies) { // rookies only
      this.selectablePlayers = this.playerService.playerValues.slice().filter(player => {
        return player.experience === 0 && player.position !== 'PI';
      });
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
      this.leagueService.selectedLeague.isSuperflex
    )
  }

  /**
   * map draft objects to teams
   * @param teams fantasy teams
   */
  mapDraftObjects(teams: LeagueTeam[]): void {
    if (this.teamPicks.length === 0) {
      if (teams[0].upcomingDraftOrder.length !== 0) {
        teams.map(team => {
          for (const pick of team.upcomingDraftOrder) {
            if (pick.year === this.leagueService.selectedLeague.season) {
              this.teamPicks.push(new TeamMockDraftPick(((pick.round - 1) * teams.length) + pick.pick,
                this.createDraftCenterPickString(pick.round, pick.pick, teams.length),
                team.owner?.ownerName,
                team.owner?.teamName, 
                team.roster.rosterId,
                pick.originalRosterId));
            }
          }
        });
      } else {
        const projectedDraftOrder = this.powerRankingsService.powerRankings.slice().sort((a, b) => b.starterRank - a.starterRank).map(it => it.team.roster.rosterId)
        teams.map(team => {
          for (const pick of team.futureDraftCapital) {
            if (pick.year === this.leagueService.selectedLeague.season) {
              const pickNum = projectedDraftOrder.indexOf(pick.originalRosterId) + 1
              this.teamPicks.push(new TeamMockDraftPick(((pick.round - 1) * projectedDraftOrder.length) + pickNum,
                this.createPickString(pick.round, pickNum),
                team.owner?.ownerName,
                team.owner?.teamName,
                team.roster.rosterId,
                pick.originalRosterId));
            }
          }
        });
        this.teamPicks.sort((pickA, pickB) => {
          return pickA.pick - pickB.pick;
        });
        // if extra rounds added that aren't defined
        const roundCount = this.teamPicks.length / teams.length;
        if (this.mockDraftRounds > roundCount) {
          const roundsToAdd = this.mockDraftRounds - roundCount;
          const draftRound = this.teamPicks.slice(-teams.length);
          for (let i = 0; i < roundsToAdd; i++) {
            draftRound.forEach(pick => {
              const pickNum = projectedDraftOrder.indexOf(pick.originalRosterId) + 1
              this.teamPicks.push(new TeamMockDraftPick(((roundCount + i) * projectedDraftOrder.length) + pickNum,
                this.createPickString(roundCount + i + 1, pickNum),
                pick.pickOwner,
                pick.pickTeam,
                pick.rosterId,
                pick.rosterId));
            });
          }
        }
      }
      // sort based on draft order (TODO clean up duplicate code?)
      switch (this.mockDraftOrder) {
        case MockDraftOrder.Snake: {
          let tempDraft: TeamMockDraftPick[] = []
          for (let i = 0; i < this.mockDraftRounds; i++) {
            const round = this.teamPicks.slice(i * teams.length, (1 + i) * teams.length)
            tempDraft = tempDraft.concat(i % 2 === 0 ? round : round.reverse())
          }
          this.teamPicks = tempDraft;
          this.teamPicks.forEach((pick, ind) => {
            pick.pick = ind + 1
            pick.pickdisplay = this.createPickString(Math.trunc(ind / teams.length) + 1, ind % teams.length + 1);
          });
          break;
        }
        case MockDraftOrder.RoundReversal: {
          let tempDraft: TeamMockDraftPick[] = []
          for (let i = 0; i < this.mockDraftRounds; i++) {
            const round = this.teamPicks.slice(i * teams.length, (1 + i) * teams.length)
            tempDraft = tempDraft.concat((i % 2 === 0 && i < 2) || (i % 2 === 1 && i > 2) ? round : round.reverse())
          }
          this.teamPicks = tempDraft;
          this.teamPicks.forEach((pick, ind) => {
            pick.pick = ind + 1
            pick.pickdisplay = this.createPickString(Math.trunc(ind / teams.length) + 1, ind % teams.length + 1);
          });
          break;
        }
        default:
          break;
      }
    }
  }

  /**
   * reset mock drafts to defaults
   */
  resetDraftList(): void {
    switch (this.mockDraftConfig) {
      case 'player':
        this.mockDraftSelectedPlayers = [];
        this.teamPicks.forEach((_, ind) => {
          this.mockDraftSelectedPlayers.push(this.selectablePlayers[ind]);
        });
        break;
      case 'team':
        this.mockDraftSelectedPlayers = [];
        const teamNeedsMap = {}
        this.powerRankingsService.powerRankings.forEach(team => {
          teamNeedsMap[team.team.roster.rosterId] =
            this.powerRankingsService.getTeamNeedsFromRosterId(team.team.roster.rosterId)
        });
        this.teamPicks.forEach((pick, ind) => {
          const playerValueMap = {}
          const playerOptions = this.selectablePlayers.slice()
            .filter(p => !this.mockDraftSelectedPlayers.includes(p))
            .slice(0, 6);
          playerOptions.forEach(p => {
            const playerNeed = teamNeedsMap[pick.rosterId].findIndex(teamNeed => teamNeed === p.position)
            if (playerNeed >= 0) {
              const needsBoost = (teamNeedsMap[pick.rosterId].length - playerNeed) * .1 + 1
              playerValueMap[p.name_id] = (this.leagueService.selectedLeague.isSuperflex ? p.sf_trade_value : p.trade_value) * needsBoost
            }
          })
          playerOptions.sort((a, b) => playerValueMap[b.name_id] - playerValueMap[a.name_id])
          this.mockDraftSelectedPlayers.push(playerOptions[0]);
        });
        break;
      default:
        this.mockDraftSelectedPlayers = [];
        break;
    }
  }

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
   * create date cener pick string display
   * @param pick pick detailss
   * @private
   * returns string
   */
    private createDraftCenterPickString(round: number, pick: number, teams: number): string {
      const overall = ((round - 1) * teams) + pick
      return round.toString() + '.' + (pick > 9 ? pick.toString() : '0' + pick.toString()) + ` (${overall})`;
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
   * 
   *  Completed Draft Functions
   * 
   * 
   */


  /**
   * get value ratio in player and pick used to select the player
   * @param pick
   * @private
   */
  getPickValueRatio(pick: LeagueCompletedPickDTO): number {
    const pickValue = this.getPickValue(pick.round);
    const player = this.playerService.getPlayerByPlayerPlatformId(pick.playerId,
      this.leagueService.selectedLeague.leaguePlatform)
    return ((this.leagueService.selectedLeague.isSuperflex ? player?.sf_trade_value : player?.trade_value) || 0) / pickValue;
  }

  /**
   * get value difference in player and pick used to select the player
   * @param pick
   * @private
   */
  getPickValueAdded(pick: LeagueCompletedPickDTO): number {
    const pickValue = this.getPickValue(pick.round);
    const player = this.playerService.getPlayerByPlayerPlatformId(pick.playerId,
      this.leagueService.selectedLeague.leaguePlatform)
    return ((this.leagueService.selectedLeague.isSuperflex ? player?.sf_trade_value : player?.trade_value) || 0) - pickValue;
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
        totalValue += (this.leagueService.selectedLeague.isSuperflex ? player?.sf_trade_value : player?.trade_value) || 0;
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
          valueAdded += this.getPickValueAdded(pick);
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
   * @returns 
   */
  sortPlayersByBestValuePick(selectedDraft: CompletedDraft): any[] {
    if (this.roundPickValue.length === 0) {
      this.generateAVGValuePerRound(selectedDraft);
    }

    const players: { pick: LeagueCompletedPickDTO, valueAdded: number }[] = [];
    for (const pick of selectedDraft.picks) {
      players.push({ pick, valueAdded: this.getPickValueAdded(pick) });
    }
    return players.sort((a, b) => {
      return b.valueAdded - a.valueAdded;
    });
  }
}

export enum MockDraftPlayerType {
  Rookies,
  Vets,
  All
}

export enum MockDraftOrder {
  Linear,
  Snake,
  RoundReversal
}
