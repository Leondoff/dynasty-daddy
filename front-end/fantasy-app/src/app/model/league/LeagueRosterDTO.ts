/* tslint:disable:variable-name */
import {TeamMetrics} from './TeamMetrics';

export class LeagueRosterDTO {

  rosterId: number;
  ownerId: string;
  players: string[];
  taxi: string[] = [];
  reserve: string[] = [];
  teamMetrics: TeamMetrics;

  constructor() {
  }

  fromSleeper(roster_id: number, owner_id: string, players: string[], reserve: string[], taxi: string[], settings: TeamMetrics) {
    this.rosterId = roster_id;
    this.ownerId = owner_id;
    this.players = players;
    this.reserve = reserve || [];
    this.taxi = taxi || [];
    this.teamMetrics = settings;
    return this;
  }

  fromMFL(roster_id: number, owner_id: string, players: string[], reserve: string[], taxi: string[], teamMetrics?: TeamMetrics) {
    this.rosterId = roster_id;
    this.ownerId = owner_id;
    this.players = players;
    this.reserve = reserve || [];
    this.taxi = taxi || [];
    this.teamMetrics = teamMetrics || new TeamMetrics();
    return this;
  }

  fromESPN(rosterId: number, ownerId: string, playerIds: string[], teamMetrics?: TeamMetrics): LeagueRosterDTO {
    this.rosterId = rosterId;
    this.ownerId = ownerId;
    this.players = playerIds;
    this.teamMetrics = teamMetrics || new TeamMetrics();
    return this;
  }

  fromFF(rosterId: number, ownerId: string, playerIds: string[], teamMetrics?: TeamMetrics): LeagueRosterDTO {
    this.rosterId = rosterId;
    this.ownerId = ownerId;
    this.players = playerIds;
    this.teamMetrics = teamMetrics || new TeamMetrics();
    return this;
  }

}
