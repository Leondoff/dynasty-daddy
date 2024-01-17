import {LeagueRawDraftOrderDTO} from './LeagueRawDraftOrderDTO';
import {LeaguePickDTO} from './LeaguePickDTO';

export class CompletedDraft {
  constructor(draft: LeagueRawDraftOrderDTO, picks: LeaguePickDTO[]) {
    this.draft = draft;
    this.picks = picks;
  }

  draft: LeagueRawDraftOrderDTO;
  picks: LeaguePickDTO[];
}
