export class LeagueRawDraftOrderDTO {

  draftOrder: any;
  slotToRosterId: any;
  leagueId: string;
  draftId: string;
  status: string;
  type: string;
  rounds: number;
  season: string;
  playerType: number;

  constructor() {
  }

  fromSleeper(draft_id: string,
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
      return this;
    }

  fromMFL(draft: any, playerType: string, rounds: number, draftId: string, leagueId: string, status: string): LeagueRawDraftOrderDTO {
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
    this.draftId = draftId;
    this.leagueId = leagueId;
    this.status = status;
    return this;
  }

  fromESPN(draft: any, rounds: number, draftId: string, leagueId: string, status: string): LeagueRawDraftOrderDTO {
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
    this.draftId = draftId;
    this.leagueId = leagueId;
    this.status = status;
    return this;
  }

  fromFF(draft: any, rounds: number, draftId: string, leagueId: string, status: string): LeagueRawDraftOrderDTO {
    const rosterIdMap = {};
    draft.orderedSelections.forEach(pick => rosterIdMap[pick.team.id] = pick.team.id);
    this.draftOrder = rosterIdMap;
    const slotOrder = {};
    let ind = 1;
    for (const [key, value] of Object.entries(this.draftOrder)) {
      slotOrder[value as number] = ind;
      ind++;
    }
    this.slotToRosterId = slotOrder;
    // TODO how to determine this for flea flicker
    this.playerType = 0;
    this.rounds = rounds;
    this.draftId = draftId;
    this.leagueId = leagueId;
    this.status = status;
    return this;
  }
}
