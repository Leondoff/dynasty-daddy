import { Injectable } from '@angular/core';
import { LeaguePlatform } from 'src/app/model/league/FantasyPlatformDTO';
import { TeamRankingTier } from '../../components/model/powerRankings';
import { LeagueScoringFormat } from 'src/app/model/league/LeagueDTO';

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

  /**
   * Formats date string for display
   * @param date date string to format
   */
  formatDateForDisplay = (date: string) => new Date(date).toString().slice(4, 15);

  /**
   * Randomize list
   * @param array list to randomize
   * @returns 
   */
  shuffle(array: any[]): any[] {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

    /**
  * get league scoring format in string format but for display
  */
    getDisplayNameLeagueScoringFormat(scoringFormat: LeagueScoringFormat): string {
      switch (scoringFormat) {
        case LeagueScoringFormat.PPR:
          return 'PPR';
        case LeagueScoringFormat.STANDARD:
          return 'Standard';
        case LeagueScoringFormat.HALF_PPR:
          return 'Half PPR';
        default:
          return '-';
      }
    }
}
