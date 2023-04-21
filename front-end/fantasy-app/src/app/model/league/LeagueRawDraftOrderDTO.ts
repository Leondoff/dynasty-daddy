/* tslint:disable:variable-name */

export class LeagueRawDraftOrderDTO {
  constructor(draft_id: string,
              league_id: string,
              status: string,
              type: string,
              draft_order: any,
              slot_to_roster_id: any,
              year: string,
              settings: any) {
    this.draftId = draft_id;
    this.leagueId = league_id;
    this.status = status;
    this.type = type;
    this.draftOrder = draft_order;
    this.slotToRosterId = slot_to_roster_id;
    this.rounds = settings?.rounds;
    this.season = year;
    this.playerType = settings?.player_type;
  }

  draftOrder: any;
  slotToRosterId: any;
  leagueId: string;
  draftId: string;
  status: string;
  type: string;
  rounds: number;
  season: string;
  playerType: number;

  fromMFL(draft: any, playerType: string, rounds: number): LeagueRawDraftOrderDTO {
    const teamDraftOrderIds = draft?.round1DraftOrder.split(',').filter(it => it !== '') || [];
    const rosterIdMap = {};
    teamDraftOrderIds.forEach(team => rosterIdMap[team] = Number(team.substr(team.length - 2)));
    this.draftOrder = rosterIdMap;
    const slotOrder = {};
    let ind = 1;
    for (const [key, value] of Object.entries(this.draftOrder)) {
      slotOrder[value as number] = ind;
      ind++;
    }
    this.slotToRosterId = slotOrder;
    this.playerType = playerType === 'Rookie' ? 0 : 1;
    this.rounds = rounds;
    return this;
  }

  fromESPN(draft: any, rounds: number): LeagueRawDraftOrderDTO {
    const rosterIdMap = {};
    for (const pick of draft.picks) {
      rosterIdMap[pick.teamId] = pick.roundPickNumber;
    }
    this.draftOrder = rosterIdMap;
    const slotOrder = {};
    let ind = 1;
    for (const [key, value] of Object.entries(this.draftOrder)) {
      slotOrder[value as number] = ind;
      ind++;
    }
    this.slotToRosterId = slotOrder;
    this.playerType = 1;
    this.rounds = rounds;
    return this;
  }
}
