export class TeamMetrics {

  constructor() {
  }

  wins: number = 0;
  waiverPosition: number = 0;
  rank: number = 0;
  ppts: number = 0;
  losses: number = 0;
  ties: number = 0;
  fptsAgainst: number = 0;
  fpts: number = 0;
  division: number = 0;

  fromSleeper(settings: any): TeamMetrics {
    this.wins = settings?.wins || 0;
    this.waiverPosition = settings?.waiver_position || 0;
    this.ppts = settings?.ppts + (settings?.ppts_decimal / 100) || 0;
    this.losses = settings?.losses || 0;
    this.fpts = settings?.fpts + (settings?.fpts_decimal / 100) || 0;
    this.fptsAgainst = settings?.fpts_against + (settings?.fpts_against_decimal / 100) || 0;
    this.division = settings?.division || 0;
    this.ties = settings?.ties || 0;
    this.rank = settings?.rank || 0;
    return this;
  }

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

  fromESPN(settings: any): TeamMetrics {
    this.fpts = Number(settings.record?.overall?.pointsFor || 0);
    this.fptsAgainst = Number(settings.record?.overall?.pointsAgainst || 0);
    this.wins = Number(settings.record?.overall?.wins || 0);
    this.losses = Number(settings.record?.overall?.losses || 0);
    this.rank = Number(settings.playoffSeed || 0);
    return this;
  }

  fromFF(settings: any): TeamMetrics {
    this.fpts = Number(settings.pointsFor?.value || 0);
    this.ppts = Number(settings.pointsFor?.value || 0);
    this.fptsAgainst = Number(settings.pointsAgainst?.value || 0);
    this.waiverPosition = Number(settings.waiverPosition || 0);
    this.wins = Number(settings.recordOverall?.wins || 0);
    this.losses = Number(settings.recordOverall?.losses || 0);
    this.rank = Number(settings.recordOverall?.rank || 0);
    return this;
  }

  fromFFPC(settings: any): TeamMetrics {
    this.division = Number(settings?.divisionId || 0);
    this.fpts = Number(settings?.points || 0);
    this.wins = Number(settings?.wins || 0);
    this.losses = Number(settings?.losses || 0);
    this.rank = Number(settings?.rank || 0);
    return this;
  }
}
