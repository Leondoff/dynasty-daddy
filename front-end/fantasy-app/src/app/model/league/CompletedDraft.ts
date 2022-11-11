import {LeagueRawDraftOrderDTO} from './LeagueRawDraftOrderDTO';
import {LeagueCompletedPickDTO} from './LeagueCompletedPickDTO';

export class CompletedDraft {
  constructor(draft: LeagueRawDraftOrderDTO, picks: LeagueCompletedPickDTO[]) {
    this.draft = draft;
    this.picks = picks;
  }

  draft: LeagueRawDraftOrderDTO;
  picks: LeagueCompletedPickDTO[];
}
