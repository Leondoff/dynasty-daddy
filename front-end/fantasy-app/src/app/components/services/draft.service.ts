import { Injectable } from '@angular/core';
import { FantasyPlayer } from '../../model/assets/FantasyPlayer';
import { TeamMockDraftPick } from '../model/mockDraft';
import { LeagueTeam } from '../../model/league/LeagueTeam';
import { LeagueService } from '../../services/league.service';
import { CompletedDraft } from '../../model/league/CompletedDraft';
import { DraftCapital } from '../../model/assets/DraftCapital';
import { LeagueCompletedPickDTO } from 'src/app/model/league/LeagueCompletedPickDTO';
import { PlayerService } from 'src/app/services/player.service';

@Injectable({
  providedIn: 'root'
})
export class DraftService {

  /** team picks */
  teamPicks: TeamMockDraftPick[] = [];

  /** available players */
  selectablePlayers: FantasyPlayer[] = [];

  /** currently selected draft */
  selectedDraft: CompletedDraft | string;

  /** current filter for mock draft */
  mockDraftConfig: string = 'player';

  /** state of value selected players */
  valueSelectedPlayers: FantasyPlayer[] = [];

  /** state of custom selected players */
  customSelectedPlayers: FantasyPlayer[] = [];

  /** average value of pick in round */
  roundPickValue: number[] = [];

  constructor(public leagueService: LeagueService, private playerService: PlayerService) {
  }

  /**
   * generate draft order
   * @param players list of players
   * @param isSuperFlex is draft super flex
   * @param playerType draft type, 1 == rookies only, 2 == vets only, 3 == all players
   */
  generateDraft(players: FantasyPlayer[], isSuperFlex: boolean = true, playerType: number = 3): void {
    if (playerType === 1) { // rookies only
      this.selectablePlayers = players.filter(player => {
        return player.experience === 0 && player.position !== 'PI';
      });
    } else if (playerType === 2) { // vets only
      this.selectablePlayers = players.filter(player => {
        return player.experience !== 0 && player.position !== 'PI';
      });
    } else { // all players
      this.selectablePlayers = players.filter(player => {
        return player.position !== 'PI';
      });
    }
    // sort players by value
    // TODO refactor
    this.selectablePlayers = this.playerService.sortListOfPlayers(
      this.selectablePlayers,
      this.leagueService.selectedLeague.isSuperflex
    )
    this.valueSelectedPlayers = this.selectablePlayers.slice();
  }

  /**
   * map draft objects to teams
   * @param teams fantasy teams
   */
  mapDraftObjects(teams: LeagueTeam[]): void {
    if (this.teamPicks.length === 0) {
      teams.map(team => {
        for (const pick of team.upcomingDraftOrder) {
          if (pick.year === this.leagueService.selectedLeague.season) {
            this.teamPicks.push(new TeamMockDraftPick(((pick.round - 1) * 12) + pick.pick,
              this.createPickString(pick),
              team.owner?.ownerName,
              team.owner?.teamName));
          }
        }
      });
      this.teamPicks.sort((pickA, pickB) => {
        return pickA.pick - pickB.pick;
      });
    }
  }

  /**
   * reset mock drafts to defaults
   */
  resetDraftList(): void {
    this.mockDraftConfig === 'custom' ? this.customSelectedPlayers = [] : this.valueSelectedPlayers = this.selectablePlayers.slice();
  }

  /**
   * create pick string display
   * @param pick pick details
   * @private
   * returns string
   */
  private createPickString(pick: DraftCapital): string {
    return pick.round.toString() + '.' + (pick.pick > 9 ? pick.pick.toString() : '0' + pick.pick.toString());
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
    this.valueSelectedPlayers = [];
    this.customSelectedPlayers = [];
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
    return (player ? this.playerService.getTradeValue(player, this.leagueService.selectedLeague.isSuperflex) : 0) / pickValue;
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
    return (player ? this.playerService.getTradeValue(player, this.leagueService.selectedLeague.isSuperflex) : 0) - pickValue;
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
        totalValue += player ? this.playerService.getTradeValue(player, this.leagueService.selectedLeague.isSuperflex) : 0;
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
