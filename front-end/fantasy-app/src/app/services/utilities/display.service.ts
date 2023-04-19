import {Injectable} from '@angular/core';
import { LeaguePlatform } from 'src/app/model/league/FantasyPlatformDTO';
import {TeamRankingTier} from '../../components/model/powerRankings';

@Injectable({
  providedIn: 'root'
})
export class DisplayService {

  leagueTypes = ['Redraft', 'Keeper', 'Dynasty', 'Other'];

  constructor() {
  }

  /**
   * Get tier string from number
   * @param tier string
   */
  getTierFromNumber(tier: number): string {
    return TeamRankingTier[tier]?.replace(/_/g, ' ') || '-';
  }

  /**
   * Returns a string for the platform enum
   * @param leaguePlatform league platform enum
   * @returns 
   */
  getDisplayNameForPlatform(leaguePlatform: LeaguePlatform): string {
    switch (leaguePlatform) {
      case LeaguePlatform.FLEAFLICKER: {
        return 'Fleaflicker';
      }
      case LeaguePlatform.ESPN: {
        return 'ESPN';
      }
      case LeaguePlatform.MFL: {
        return 'MFL';
      }
      default:
        return 'Sleeper';
    }
  }

  /**
   * Get string for league type
   * @param leagueType league type number
   * @returns 
   */
  getLeagueTypeFromTypeNumber(leagueType: number): string {
    return this.leagueTypes[leagueType];
  }
}
