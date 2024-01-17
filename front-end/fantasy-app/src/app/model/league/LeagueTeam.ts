import {LeagueOwnerDTO} from './LeagueOwnerDTO';
import {LeagueRosterDTO} from './LeagueRosterDTO';
import {DraftCapital} from '../assets/DraftCapital';

export class LeagueTeam {
  owner: LeagueOwnerDTO;
  roster: LeagueRosterDTO;
  upcomingDraftOrder: DraftCapital[] = [];
  futureDraftCapital: DraftCapital[] = [];

  constructor(owner: LeagueOwnerDTO, roster: LeagueRosterDTO) {
    this.owner = owner;
    this.roster = roster;
  }

  createMockTeam(id: number): LeagueTeam {
    this.owner = new LeagueOwnerDTO(id.toString(), `Team ${id}`, `Team ${id}`, null);
    this.roster = new LeagueRosterDTO();
    this.roster.ownerId = id.toString();
    this.roster.rosterId = id;
    this.owner.avatar = '../../../assets/badges/ddlogo.svg';
    return this;
  }
}
