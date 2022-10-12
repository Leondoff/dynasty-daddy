import {Injectable} from '@angular/core';
import {FantasyPlayer} from '../../model/FantasyPlayer';
import {TeamMockDraftPick} from '../model/mockDraft';
import {LeagueTeam} from '../../model/LeagueTeam';
import {CompletedDraft, DraftCapital} from '../../model/LeagueUser';
import {LeagueService} from '../../services/league.service';

@Injectable({
  providedIn: 'root'
})
export class MockDraftService {

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

  constructor(public leagueService: LeagueService) {
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
    this.selectablePlayers.sort((playerA, playerB) => {
      if (this.leagueService.selectedLeague.isSuperflex){
        return playerB.sf_trade_value - playerA.sf_trade_value;
      } else {
        return playerB.trade_value - playerA.trade_value;
      }
    });
    this.valueSelectedPlayers = this.selectablePlayers.slice();
  }

  /**
   * map draft objects to teams
   * @param teams fantasy teams
   */
  mapDraftObjects(teams: LeagueTeam[]): void  {
    if (this.teamPicks.length === 0) {
      teams.map(team => {
        for (const pick of team.draftCapital) {
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
}
