import {LeagueTeam} from './LeagueTeam';
import {LeaguePlayoffMatchUpDTO} from './LeaguePlayoffMatchUpDTO';
import {LeagueRawDraftOrderDTO} from './LeagueRawDraftOrderDTO';
import {FantasyPlatformDTO, LeaguePlatform} from './FantasyPlatformDTO';
import {CompletedDraft} from './CompletedDraft';
import {LeagueDTO} from './LeagueDTO';


export class LeagueWrapper {

  /** league user data */
  leagueUser: FantasyPlatformDTO;

  /** selected league data */
  selectedLeague: LeagueDTO;

  /** selected year */
  selectedYear: string;

  /** selected league team data */
  leagueTeamDetails: LeagueTeam[];

  /** upcoming draft data */
  upcomingDrafts: LeagueRawDraftOrderDTO[] = [];

  /** completed draft data */
  completedDrafts: CompletedDraft[] = [];

  /** what league platform is loaded in the application */
  leaguePlatform: LeaguePlatform = LeaguePlatform.SLEEPER;

  playoffMatchUps: LeaguePlayoffMatchUpDTO[] = [];

  constructor(selectedLeague: LeagueDTO) {
    this.selectedLeague = selectedLeague;
  }

}
