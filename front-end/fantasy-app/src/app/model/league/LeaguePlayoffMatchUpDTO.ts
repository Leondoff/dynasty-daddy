import { LeagueTeamMatchUpDTO } from "./LeagueTeamMatchUpDTO";

export class LeaguePlayoffMatchUpDTO {
  constructor(game: any) {
    this.round = game?.r;
    this.matchupId = game?.m;
    this.team1 = game?.t1;
    this.team2 = game?.t2;
    this.win = game?.w;
    this.loss = game?.l;
  }

  round: number;
  matchupId: number;
  team1: number;
  team2: number;
  win: number;
  loss: number;

  fromMFL(game: any, playoffStartWeek: number): LeaguePlayoffMatchUpDTO {
    this.round = Number(game.startWeek) - playoffStartWeek + 1;
    this.matchupId = Number(game.id);
    return this;
  }

  createMockPlayoffMatchUp(team1: number, team2: number, matchUpId: number, round: number): LeaguePlayoffMatchUpDTO {
    this.round = round;
    this.matchupId = matchUpId;
    this.team1 = team1;
    this.team2 = team2;
    return this;
  }

  fromLeagueMatchUp(team1MatchUp: LeagueTeamMatchUpDTO, team2MatchUp: LeagueTeamMatchUpDTO, round: number, isCompleted: boolean): LeaguePlayoffMatchUpDTO {
    this.round = round;
    this.team1 = team1MatchUp.rosterId;
    this.team2 = team2MatchUp.rosterId;
    if (isCompleted) {
      this.win = team1MatchUp.points > team2MatchUp.points ? team1MatchUp.rosterId : team2MatchUp.rosterId;
      this.loss = team1MatchUp.points > team2MatchUp.points ? team2MatchUp.rosterId : team1MatchUp.rosterId;
    }
    this.matchupId = team1MatchUp.matchupId;
    return this;
  }
}
