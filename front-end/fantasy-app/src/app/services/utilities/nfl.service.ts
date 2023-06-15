import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {SleeperApiService} from '../api/sleeper/sleeper-api.service';
import {StateOfNFLDTO} from '../../model/league/StateOfNFLDTO';

@Injectable({
  providedIn: 'root'
})
export class NflService {

  /** state of nfl from sleeper */
  stateOfNFL: StateOfNFLDTO;

  /** full team name based on acc */
  public teamAccToFullName = {
    CAR: 'Carolina Panthers',
    NOS: 'New Orleans Saints',
    TBB: 'Tampa Bay Buccaneers',
    ATL: 'Atlanta Falcons',
    LAR: 'Los Angeles Rams',
    SEA: 'Seattle Seahawks',
    SFO: 'San Francisco 49ers',
    ARI: 'Arizona Cardinals',
    DAL: 'Dallas Cowboys',
    NYG: 'New York Giants',
    PHI: 'Philadelphia Eagles',
    WAS: 'Washington Commanders',
    GBP: 'Green Bay Packers',
    MIN: 'Minnesota Vikings',
    DET: 'Detroit Lions',
    CHI: 'Chicago Bears',
    KCC: 'Kansas City Chiefs',
    LVR: 'Las Vegas Raiders',
    LAC: 'Los Angeles Chargers',
    DEN: 'Denver Broncos',
    HOU: 'Houston Texans',
    TEN: 'Tennessee Titans',
    IND: 'Indianapolis Colts',
    JAC: 'Jacksonville Jaguars',
    CLE: 'Cleveland Browns',
    PIT: 'Pittsburgh Steelers',
    BAL: 'Baltimore Ravens',
    CIN: 'Cincinnati Bengals',
    BUF: 'Buffalo Bills',
    MIA: 'Miami Dolphins',
    NYJ: 'New York Jets',
    NEP: 'New England Patriots',
    FA: 'Free Agent'
  };

  constructor(private sleeperApiService: SleeperApiService) {
  }

  /**
   * save state of nfl to service for other services to reference
   */
  public initStateOfNfl$(): Observable<StateOfNFLDTO> {
    this.stateOfNFL = null;
    return this.sleeperApiService.getSleeperStateOfNFL().pipe(map((season) => {
      this.stateOfNFL = season;
      this.stateOfNFL.completedWeek = season.seasonType !== 'pre' && season.week > 0 ? season.week - 1 : 0;
      // weird api issue with sleeper fix
      // TODO come up with a better way to manage the state of league vs state of nfl
      if (new Date().getFullYear() > Number(season.season) && this.stateOfNFL.completedWeek >= 18) {
        this.stateOfNFL.seasonType = 'post';
      }
      if ((season.seasonType === 'star' || season.seasonType === 'off')) {
        // if its after april completed week = 0
        if (new Date().getMonth() >= 1) {
          this.stateOfNFL.completedWeek = 0;
        } else {
          this.stateOfNFL.completedWeek = 18;
        }
      }
      return this.stateOfNFL;
    }));
  }

  /**
   * handles edge case when switching between seasons in playoffs
   */
  getYearForStats(): string {
    switch (this.stateOfNFL.seasonType) {
      case 'off':
        return (new Date().getFullYear() - 1).toString();
      case 'pre':
        return this.stateOfNFL.previousSeason;
      default:
        return this.stateOfNFL.season;
    }
  }

  /**
   * returns the completed week for a season
   * @param season season of selected league
   */
  getCompletedWeekForSeason(season: string): number {
    const seasonNum = Number(season);
    if (new Date().getFullYear() > seasonNum + 1 || (new Date().getFullYear() === seasonNum + 1 && new Date().getMonth() <= 7)) {
      return seasonNum < 2021 ? 17 : 18;
    }
    return this.stateOfNFL.completedWeek;
  }

  /**
   * returns the current week for a season
   * @param season season of selected league
   */
  getCurrentWeekForSeason(season: string): number {
    const seasonNum = Number(season);
    const currentDate = new Date();
    if (currentDate.getFullYear() > seasonNum + 1 || (currentDate.getFullYear() === seasonNum + 1 && currentDate.getMonth() <= 7)) {
      return seasonNum < 2021 ? 17 : 18;
    }
    return this.stateOfNFL.completedWeek + 1;
  }
}
