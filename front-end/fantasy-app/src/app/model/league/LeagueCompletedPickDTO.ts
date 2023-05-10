export class LeagueCompletedPickDTO {

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

  constructor() {
  }

  fromSleeper(pick: any): LeagueCompletedPickDTO {
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
    return this;
  }

  fromMFL(pick: any, teamCount: any): LeagueCompletedPickDTO {
    this.playerId = pick.player;
    this.pickNumber = Number(pick.pick) + (Number(pick.round) - 1) * teamCount;
    this.rosterId = Number(pick.franchise?.substr(pick.franchise.length - 2));
    this.round = Number(pick.round);
    return this;
  }

  fromESPN(pick: any): LeagueCompletedPickDTO {
    this.playerId = pick.playerId.toString();
    this.pickNumber = pick.overallPickNumber;
    this.rosterId = pick.teamId;
    this.round = pick.roundId;
    return this;
  }

  fromFF(pick: any): LeagueCompletedPickDTO {
    this.playerId = pick.player?.proPlayer?.id?.toString();
    this.pickNumber = pick?.slot?.overall;
    this.rosterId = pick?.team?.id;
    this.round = pick?.slot?.round;
    this.firstName = pick?.player?.proPlayer?.nameFirst;
    this.lastName = pick?.player?.proPlayer?.nameLast;
    this.position = pick?.player?.proPlayer?.position;
    return this;
  }
}
