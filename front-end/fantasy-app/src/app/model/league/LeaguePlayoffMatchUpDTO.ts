export class LeaguePlayoffMatchUpDTO {
  constructor(game: any) {
    this.round = game?.r;
    this.matchUpId = game?.m;
    this.team1 = game?.t1;
    this.team2 = game?.t2;
    this.win = game?.w;
    this.loss = game?.l;
  }

  round: number;
  matchUpId: number;
  team1: number;
  team2: number;
  win: number;
  loss: number;

  fromMFL(game: any, playoffStartWeek: number): LeaguePlayoffMatchUpDTO {
    this.round = Number(game.startWeek) - playoffStartWeek + 1;
    this.matchUpId = Number(game.id);
    return this;
  }
}
