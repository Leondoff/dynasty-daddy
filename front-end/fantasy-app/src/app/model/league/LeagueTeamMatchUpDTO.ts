export class LeagueTeamMatchUpDTO {
  constructor() {
  }

  starterPoints: number[];
  starters: string[];
  rosterId: number;
  points: number;
  players: string[];
  matchupId: number;
  customPoints: number;

  // setRosterId = (rosterId: number) => this.rosterId = rosterId;

  // setPoints = (points: number) => this.points = points;

  // setMatchUpId = (matchUpId: number) => this.matchupId = matchUpId;

  createMatchUpObject(matchupId: number, points: number, rosterId: number): LeagueTeamMatchUpDTO {
    this.matchupId = matchupId;
    this.points = points;
    this.rosterId = rosterId;  
    return this;  
  }

  createMatchUpFromSleeper(matchup: any): LeagueTeamMatchUpDTO {
    this.starterPoints = matchup?.starters_points;
    this.starters = matchup?.starters;
    this.rosterId = matchup?.roster_id;
    this.points = matchup?.points;
    this.players = matchup?.players;
    this.matchupId = matchup?.matchup_id;
    this.customPoints = matchup?.custom_points;
    return this;
  }
}
