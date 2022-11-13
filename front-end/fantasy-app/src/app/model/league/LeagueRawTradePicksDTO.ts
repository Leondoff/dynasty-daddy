/* tslint:disable:variable-name */

export class LeagueRawTradePicksDTO {
  constructor(owner_id: number, previous_owner_id: number, roster_id: number, round: number, season: string) {
    this.ownerId = owner_id;
    this.previousOwnerId = previous_owner_id;
    this.rosterId = roster_id;
    this.round = round;
    this.season = season;
  }

  ownerId: number;
  previousOwnerId: number;
  rosterId: number;
  round: number;
  season: string;
}
