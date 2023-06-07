/* tslint:disable:variable-name */
import { LeaguePlatform } from './FantasyPlatformDTO';

export class LeagueDTO {
  
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
  scoringFormat: LeagueScoringFormat = LeagueScoringFormat.HALF_PPR;
  metadata: any = {};

  constructor() {

  }

  fromSleeper(isSuperflex: boolean,
    name: string,
    league_id: string,
    total_rosters: number,
    roster_positions: string[],
    previous_league_id: string,
    status: string,
    season: string,
    metadata: any,
    settings: any,
    scoring_settings: any,
    leaguePlatform: LeaguePlatform): LeagueDTO {
    this.isSuperflex = isSuperflex;
    this.name = name;
    this.leagueId = league_id;
    this.totalRosters = total_rosters;
    this.rosterPositions = roster_positions;
    this.rosterSize = (roster_positions?.length || 0) + (settings?.reserve_slots || 0) + (settings?.taxi_slots || 0);
    this.prevLeagueId = previous_league_id;
    this.status = status;
    this.divisions = settings?.divisions;
    for (let i = 0; i < this.divisions; i++) {
      this.divisionNames.push(metadata ? metadata[`division_${i + 1}`] : `Division ${i + 1}`);
    }
    this.playoffTeams = settings?.playoff_teams;
    this.startWeek = settings?.start_week;
    this.playoffStartWeek = settings?.playoff_week_start === 0 ? 15 : settings?.playoff_week_start;
    this.draftRounds = settings?.draft_rounds;
    this.season = season;
    this.type = settings?.type;
    this.playoffRoundType = settings?.playoff_round_type;
    this.medianWins = settings?.league_average_match === 1;
    this.leaguePlatform = leaguePlatform;
    if (scoring_settings) {
      switch (scoring_settings.rec) {
        case 1:
          this.scoringFormat = LeagueScoringFormat.PPR;
          break;
        case 0:
          this.scoringFormat = LeagueScoringFormat.STANDARD;
          break;
        default:
          this.scoringFormat = LeagueScoringFormat.HALF_PPR;
          break;
      }
    }
    return this;
  }

  fromMFL(isSuperflex: boolean,
    name: string,
    league_id: string,
    total_rosters: number,
    roster_positions: string[],
    previous_league_id: string,
    status: string,
    season: string,
    leagueInfo: any): LeagueDTO {
    this.isSuperflex = isSuperflex;
    this.name = name;
    this.leagueId = league_id;
    this.totalRosters = total_rosters;
    this.rosterPositions = roster_positions;
    this.rosterSize = (Number(leagueInfo?.rosterSize) || 30) + (Number(leagueInfo?.injuredReserve) || 0) + (Number(leagueInfo?.taxiSquad) || 0);
    this.prevLeagueId = previous_league_id;
    this.status = status;
    this.season = season;
    this.startWeek = Number(leagueInfo.startWeek);
    this.playoffStartWeek = Number(leagueInfo.lastRegularSeasonWeek) + 1;
    this.draftRounds = leagueInfo.draftPlayerPool === 'Rookie' ? 5 : 12;
    this.metadata = {
      rosters: leagueInfo.franchises.franchise,
      draftPoolType: leagueInfo.draftPlayerPool,
      loadRosters: leagueInfo.loadRosters || 'live_draft'
    };
    this.leaguePlatform = LeaguePlatform.MFL;
    // TODO These values we do not have a way to determine currently
    this.scoringFormat = LeagueScoringFormat.HALF_PPR;
    this.medianWins = false; // TODO figure out how that is determined
    this.playoffRoundType = 1;
    this.playoffTeams = 6;
    return this;
  }

  fromFF(isSuperflex: boolean,
    name: string,
    league_id: string,
    total_rosters: number,
    roster_positions: string[],
    previous_league_id: string,
    status: string,
    season: string,
    rosterSize: number,
    leagueInfo: any): LeagueDTO {
    this.isSuperflex = isSuperflex;
    this.name = name;
    this.leagueId = league_id;
    this.totalRosters = total_rosters;
    this.rosterPositions = roster_positions;
    this.rosterSize = (Number(leagueInfo?.rosterSize) || 30) + (Number(leagueInfo?.injuredReserve) || 0) + (Number(leagueInfo?.taxiSquad) || 0);
    this.prevLeagueId = previous_league_id;
    this.status = status;
    this.season = season;
    this.rosterSize = rosterSize;
    this.leaguePlatform = LeaguePlatform.FLEAFLICKER;
    this.startWeek = Number(leagueInfo.startWeek) || 1;
    this.type = leagueInfo.league?.maxKeepers > 0 ? LeagueType.DYNASTY : LeagueType.REDRAFT;
    this.draftRounds = 5; // TODO figure out the right way
    this.medianWins = false; // TODO figure out how that is determined
    this.metadata = {
      rosters: leagueInfo.divisions
    };
    return this;
  }

  fromESPN(isSuperflex: boolean,
    name: string,
    league_id: string,
    total_rosters: number,
    roster_positions: string[],
    previous_league_id: string,
    status: string,
    season: string,
    rosterSize: number,
    leagueInfo: any): LeagueDTO {
    this.isSuperflex = isSuperflex;
    this.name = name;
    this.leagueId = league_id;
    this.totalRosters = total_rosters;
    this.rosterPositions = roster_positions;
    this.prevLeagueId = previous_league_id;
    this.status = status;
    this.season = season;
    this.rosterSize = rosterSize;
    this.startWeek = Number(leagueInfo.status?.firstScoringPeriod) || 1;
    this.type = (leagueInfo.settings?.keeperCount > 0 || leagueInfo.settings?.keeperCountFuture > 0) ? LeagueType.DYNASTY : LeagueType.REDRAFT;
    this.draftRounds = (leagueInfo.draftDetail?.picks?.length / leagueInfo.settings?.size) || 5;
    this.medianWins = false; // TODO figure out how that is determined
    this.playoffStartWeek = leagueInfo?.settings?.scheduleSettings?.matchupPeriodCount || 14;
    this.playoffTeams = leagueInfo?.settings?.scheduleSettings?.playoffTeamCount || 6;
    this.playoffRoundType = leagueInfo?.settings?.scheduleSettings?.playoffMatchupPeriodLength || 1;
    this.metadata = {
      rosters: leagueInfo.teams,
      schedule: leagueInfo.schedule,
      owners: leagueInfo.members,
      draft: leagueInfo.draftDetail
    };
    this.leaguePlatform = LeaguePlatform.ESPN;
    return this;
  }

  /**
   * Set the division and division length for a league
   * @param divisions string array of division names
   * @returns 
   */
  setDivisions(divisions: string[]): LeagueDTO {
    this.divisions = divisions.length;
    this.divisionNames = divisions;
    return this;
  }

  /**
   * get league scoring format in string format to pull data from map
   */
  getLeagueScoringFormat(): string {
    switch (this.scoringFormat) {
      case LeagueScoringFormat.PPR:
        return 'pts_ppr';
      case LeagueScoringFormat.STANDARD:
        return 'pts_std';
      default:
        return 'pts_half_ppr';
    }
  }
}

export enum LeagueType {
  REDRAFT = 0,
  KEEPER = 1,
  DYNASTY = 2,
  OTHER = 3
}

export enum LeagueScoringFormat {
  PPR,
  HALF_PPR,
  STANDARD,
  OTHER
}
