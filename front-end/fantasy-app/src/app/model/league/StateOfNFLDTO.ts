
export class StateOfNFLDTO {
  constructor(season: any) {
    this.week = season.week;
    this.season = season.season;
    this.previousSeason = season.previous_season;
    this.seasonType = season.season_type;
  }

  week: number;
  season: string;
  previousSeason: string;
  seasonType: string;
  completedWeek: number;
}
