import { DraftOrderType } from "src/app/components/services/draft.service";

export class LeagueRawDraftOrderDTO {

  draftOrder: any;
  slotToRosterId: any;
  leagueId: string;
  draftId: string;
  status: string;
  type: DraftOrderType = DraftOrderType.Linear;
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
    this.draftOrder = draft_order;
    this.slotToRosterId = slot_to_roster_id;
    this.rounds = settings?.rounds;
    this.season = year;
    this.playerType = settings?.player_type;
    switch (type) {
      case 'snake':
        if (settings.reversal_round === 3) {
          this.type = DraftOrderType.RoundReversal;
        } else {
          this.type = DraftOrderType.Snake;
        }
        break;
      case 'auction': {
        this.type = DraftOrderType.Auction;
        break; 
      }
      default:
        this.type = DraftOrderType.Linear;
    }
    return this;
  }

  fromMFL(draft: any, playerType: string, rounds: number, draftId: string, leagueId: string, status: string): LeagueRawDraftOrderDTO {
    const teamDraftOrderIds = draft?.round1DraftOrder?.split(',').filter(it => it !== '') || [];
    const rosterIdMap = {};
    teamDraftOrderIds.forEach(team => rosterIdMap[team] = Number(team.substr(team.length - 2)));
    this.draftOrder = rosterIdMap;
    const slotOrder = {};
    teamDraftOrderIds.forEach((team, ind) => {
      slotOrder[ind + 1] = rosterIdMap[team]
    });
    this.slotToRosterId = slotOrder;
    this.playerType = playerType === 'Rookie' ? 0 : 1;
    this.rounds = rounds;
    this.draftId = draftId;
    this.leagueId = leagueId;
    this.status = status;
    switch (draft.draftType) {
      case 'SFIRSTRANDOM':
        this.type = DraftOrderType.Snake;
        break;
      default:
        this.type = DraftOrderType.Linear;
    }
    return this;
  }

  fromESPN(draft: any, rounds: number, draftId: string, leagueId: string, slotOrder: {}): LeagueRawDraftOrderDTO {
    this.slotToRosterId = slotOrder;
    this.playerType = 1;
    this.rounds = rounds;
    this.draftId = draftId;
    this.leagueId = leagueId;
    this.type = DraftOrderType.Snake;
    this.status = draft.drafted ? 'completed' : 'in_progress';
    return this;
  }

  fromFF(draft: any, rounds: number, draftId: string, leagueId: string, status: string, slotOrder: {}): LeagueRawDraftOrderDTO {
    this.slotToRosterId = slotOrder;
    // TODO how to determine this for flea flicker
    if (draft.orderedSelections &&
      (draft.orderedSelections?.length > 100 ||
        !draft.orderedSelections[0]?.player?.proPlayer?.isRookie)
    ) {
      this.playerType = 1;
      this.type = DraftOrderType.Snake;
    } else {
      this.playerType = 0;
      this.type = DraftOrderType.Linear;
    }
    this.rounds = rounds;
    this.draftId = draftId;
    this.leagueId = leagueId;
    this.status = status;
    return this;
  }

  fromFFPC(picks: any, rounds: number, draftId: string, leagueId: string, status: string, slotOrder: {}): LeagueRawDraftOrderDTO {
    this.slotToRosterId = slotOrder;
    if (picks?.length > 100) {
      this.playerType = 1;
      this.type = DraftOrderType.Snake;
    } else {
      this.playerType = 0;
      this.type = DraftOrderType.Linear;
    }
    this.rounds = rounds;
    this.draftId = draftId;
    this.leagueId = leagueId;
    this.status = status;
    return this;
  }
}
