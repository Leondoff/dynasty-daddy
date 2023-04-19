export class LeagueCompletedPickDTO {

  constructor(pick: any) {
    this.round = pick?.round;
    this.draftSlot = pick?.draft_slot;
    this.playerId = pick?.player_id;
    this.isKeeper = pick?.is_keeper;
    this.rosterId = pick?.roster_id;
    this.pickNumber = pick?.pick_no;
    this.draftId = pick?.draft_id;
    this.firstName = pick?.metadata.first_name;
    this.lastName = pick?.metadata.last_name;
    this.position = pick?.metadata.position;
  }

  round: number;
  rosterId: number;
  playerId: string;
  pickNumber: number;
  isKeeper: boolean;
  draftSlot: number;
  draftId: string;
  firstName: string;
  lastName: string;
  position: string;

  fromMFL(pick, teamCount): LeagueCompletedPickDTO {
    this.playerId = pick.player;
    this.pickNumber = Number(pick.pick) + (Number(pick.round) - 1) * teamCount;
    this.rosterId = Number(pick.franchise?.substr(pick.franchise.length - 2));
    this.round = Number(pick.round);
    return this;
  }

  fromESPN(pick): LeagueCompletedPickDTO {
    this.playerId = pick.playerId.toString();
    this.pickNumber = pick.overallPickNumber;
    this.rosterId = pick.teamId;
    this.round = pick.roundId;
    return this;
  }
}
