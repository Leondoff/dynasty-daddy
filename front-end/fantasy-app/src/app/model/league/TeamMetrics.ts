export class TeamMetrics {

  constructor(settings: any) {
    this.wins = settings?.wins || 0;
    this.waiverPosition = settings?.waiver_position || 0;
    this.ppts = settings?.ppts + (settings?.ppts_decimal / 100) || 0;
    this.losses = settings?.losses || 0;
    this.fpts = settings?.fpts + (settings?.fpts_decimal / 100) || 0;
    this.fptsAgainst = settings?.fpts_against + (settings?.fpts_against_decimal / 100) || 0;
    this.division = settings?.division || 0;
    this.ties = settings?.ties || 0;
    this.rank = settings?.rank || 0;
  }


  wins: number;
  waiverPosition: number;
  rank: number;
  ppts: number;
  losses: number;
  ties: number;
  fptsAgainst: number;
  fpts: number;
  division: number;

  fromMFL(settings: any): TeamMetrics {
    this.wins = Number(settings.h2hw);
    this.losses = Number(settings.h2hl);
    this.ties = Number(settings.h2ht);
    this.ppts = Number(settings.pf); // How do we want to calculate this
    this.fpts = Number(settings.pf);
    this.fptsAgainst = Number(settings.pa);
    this.rank = 0;
    return this;
  }
}
