/* tslint:disable:variable-name */
import {TeamMetrics} from './TeamMetrics';

export class LeagueRosterDTO {
  constructor(roster_id: number, owner_id: string, players: string[], reserve: string[], taxi: string[], settings: TeamMetrics) {
    this.rosterId = roster_id;
    this.ownerId = owner_id;
    this.players = players;
    this.reserve = reserve || [];
    this.taxi = taxi || [];
    this.teamMetrics = settings;
  }

  rosterId: number;
  ownerId: string;
  players: string[];
  taxi: string[] = [];
  reserve: string[] = [];
  teamMetrics: TeamMetrics;
}
