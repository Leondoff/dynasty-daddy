export class LeagueTeamMatchUpDTO {
  constructor(matchup: any) {
    this.starterPoints = matchup?.starters_points;
    this.starters = matchup?.starters;
    this.rosterId = matchup?.roster_id;
    this.points = matchup?.points;
    this.players = matchup?.players;
    this.matchupId = matchup?.matchup_id;
    this.customPoints = matchup?.custom_points;
  }

  starterPoints: number[];
  starters: string[];
  rosterId: number;
  points: number;
  players: string[];
  matchupId: number;
  customPoints: number;
}
