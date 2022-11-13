/* tslint:disable:variable-name */
import {LeaguePlatform} from './FantasyPlatformDTO';

export class LeagueDTO {
  constructor(b: boolean,
              name: string,
              league_id: string,
              total_rosters: number,
              roster_positions: string[],
              previous_league_id: string,
              status: string,
              season: string,
              metadata: any,
              settings: any,
              leaguePlatform: LeaguePlatform) {
    this.isSuperflex = b;
    this.name = name;
    this.leagueId = league_id;
    this.totalRosters = total_rosters;
    this.rosterPositions = roster_positions;
    this.rosterSize = roster_positions.length + (settings?.reserve_slots || 0) + (settings?.taxi_slots || 0);
    this.prevLeagueId = previous_league_id;
    this.status = status;
    this.divisions = settings?.divisions;
    for (let i = 0; i < this.divisions; i++) {
      this.divisionNames.push( metadata ? metadata[`division_${i + 1}`] : `Division ${i + 1}`);
    }
    this.playoffTeams = settings?.playoff_teams;
    this.startWeek = settings?.start_week;
    this.playoffStartWeek = settings?.playoff_week_start;
    this.draftRounds = settings?.draft_rounds;
    this.season = season;
    this.type = settings?.type;
    this.playoffRoundType = settings?.playoff_round_type;
    this.medianWins = settings?.league_average_match === 1;
    this.leaguePlatform = leaguePlatform;
  }

  isSuperflex: boolean = true;
  name: string;
  leagueId: string;
  totalRosters: number;
  rosterPositions: string[] = [];
  rosterSize: number = 0;
  prevLeagueId: string;
  divisionNames: string[] = [];
  divisions: number;
  status: string;
  playoffTeams: number;
  startWeek: number;
  playoffStartWeek: number;
  leagueMatchUps: {};
  leagueTransactions: {};
  draftRounds: number;
  season: string;
  playoffRoundType: number;
  medianWins: boolean;
  type: LeagueType = LeagueType.DYNASTY;
  leaguePlatform: LeaguePlatform = LeaguePlatform.SLEEPER;
  metadata: any = null;
}

export enum LeagueType {
  REDRAFT = 0,
  KEEPER = 1,
  DYNASTY = 2,
  OTHER = 3
}
