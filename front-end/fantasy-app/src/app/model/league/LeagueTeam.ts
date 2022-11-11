import {LeagueOwnerDTO} from './LeagueOwnerDTO';
import {LeagueRosterDTO} from './LeagueRosterDTO';
import {DraftCapital} from '../assets/DraftCapital';

export class LeagueTeam {
  constructor(owner: LeagueOwnerDTO, roster: LeagueRosterDTO) {
    this.owner = owner;
    this.roster = roster;
  }

  owner: LeagueOwnerDTO;
  roster: LeagueRosterDTO;
  draftCapital: DraftCapital[] = [];
  futureDraftCapital: DraftCapital[] = [];
}
