import { DraftCapital } from "../assets/DraftCapital";

export class LeaguePickDTO {

  round: number;
  rosterId: number;
  playerId: string;
  pickNumber: number;
  draftSlot: number;
  draftId: string;
  firstName: string;
  lastName: string;
  position: string;
  bidAmount: number = 0;
  originalRosterId: number;
  pickdisplay: string;
  pickOwner: string;
  pickTeam: string;

  constructor() {
  }

  fromMockDraft(num: number, display: string, ownerName: string, teamName: string, rosterId: number, originalRosterId: number): LeaguePickDTO {
    this.pickNumber = num;
    this.pickdisplay = display;
    this.pickOwner = ownerName;
    this.pickTeam = teamName;
    this.rosterId = rosterId;
    this.originalRosterId = originalRosterId;
    return this;
  }

  fromSleeper(pick: any, teamCount: number): LeaguePickDTO {
    this.round = pick?.round;
    this.draftSlot = pick?.draft_slot;
    this.playerId = pick?.player_id;
    this.rosterId = pick?.roster_id;
    this.pickNumber = pick?.pick_no;
    this.draftId = pick?.draft_id;
    this.firstName = pick?.metadata.first_name;
    this.lastName = pick?.metadata.last_name;
    this.position = pick?.metadata.position;
    this.bidAmount = Number(pick?.metadata?.amount || 0);
    this.originalRosterId = pick?.roster_id;
    this.pickdisplay = this.formatPickDisplay(teamCount);
    return this;
  }

  fromMFL(pick: any, teamCount: any, originalOwnerId: string): LeaguePickDTO {
    this.playerId = pick.player;
    this.pickNumber = Number(pick.pick) + (Number(pick.round) - 1) * teamCount;
    this.rosterId = Number(pick.franchise?.substr(pick.franchise.length - 2));
    this.round = Number(pick.round);
    this.originalRosterId =  Number(originalOwnerId?.substr(originalOwnerId.length - 2));
    return this;
  }

  fromFFPC(pick: any, teamCount: number, originalOwnerId: number): LeaguePickDTO {
    const metadata = pick?._attributes;
    this.playerId = pick?.player?.bgsPlayerID.toString();
    this.pickNumber = Number(metadata?.overall || 0);
    this.firstName = pick?.player?.firstName;
    this.lastName = pick?.player?.lastName;
    this.rosterId = Number(metadata?.teamID || 0);
    this.round = Number(metadata?.round || 0);
    this.originalRosterId = originalOwnerId;
    this.pickdisplay = this.formatPickDisplay(teamCount);
    return this;
  }

  fromESPN(pick: any, teamCount: number, originalOwnerId: number): LeaguePickDTO {
    this.playerId = pick.playerId.toString();
    this.pickNumber = pick.overallPickNumber;
    this.rosterId = pick.teamId;
    this.round = pick.roundId;
    this.originalRosterId = originalOwnerId;
    this.pickdisplay = this.formatPickDisplay(teamCount);
    return this;
  }

  fromFF(pick: any, teamCount: number, originalOwnerId: number): LeaguePickDTO {
    this.playerId = pick.player?.proPlayer?.id?.toString();
    this.pickNumber = pick?.slot?.overall;
    this.rosterId = pick?.team?.id;
    this.round = pick?.slot?.round;
    this.firstName = pick?.player?.proPlayer?.nameFirst;
    this.lastName = pick?.player?.proPlayer?.nameLast;
    this.position = pick?.player?.proPlayer?.position;
    this.originalRosterId = originalOwnerId;
    this.pickdisplay = this.formatPickDisplay(teamCount);
    return this;
  }

  fromDraftCapital(pick: DraftCapital, ownerId: number): LeaguePickDTO {
    this.playerId = "";
    this.pickNumber = pick.pick * pick.round;
    this.rosterId = ownerId;
    this.round = pick.round;
    this.draftSlot = pick.pick;
    this.originalRosterId = pick.originalRosterId;
    return this;
  }

  private formatPickDisplay = (teamCount: number) => {
    const pickNum = this.pickNumber % teamCount == 0 ? 12 : this.pickNumber % teamCount;
    return this.round.toString() + '.' + (pickNum > 9 ? pickNum.toString() : '0' + pickNum.toString())
  }
}
