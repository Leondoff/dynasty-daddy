import {LeagueTeam, LeagueTeamMatchUpData} from '../../model/LeagueTeam';
import {MatchUpUI} from './matchup';

export class Division {
  constructor(divisionId: number, divisionTeams: any[]) {
    this.divisionId = divisionId;
    this.teams = divisionTeams;
  }

  divisionId: number;
  divisionName: string;
  teams: LeagueTeam[];
}

export class MatchUpProbability {
  constructor(matchup: MatchUpUI, team1Prob: number, team2Prob: number) {
    this.matchUpDetails = matchup;
    this.team1Prob = team1Prob;
    this.team2Prob = team2Prob;
  }

  matchUpDetails: MatchUpUI;
  team1Prob: number;
  team2Prob: number;
}

export class SimulatedTeamInfo {
  team: LeagueTeam;
  projWins: number;
}
