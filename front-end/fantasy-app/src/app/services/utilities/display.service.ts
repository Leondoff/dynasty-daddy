import { Injectable } from '@angular/core';
import { LeaguePlatform } from 'src/app/model/league/FantasyPlatformDTO';
import { TeamRankingTier } from '../../components/model/powerRankings';
import { LeagueScoringFormat } from 'src/app/model/league/LeagueDTO';

/** League Platform logo URLS */
export const PlatformLogos = {
  SLEEPER_LOGO: 'https://play-lh.googleusercontent.com/Ox2yWLWnOTu8x2ZWVQuuf0VqK_27kEqDMnI91fO6-1HHkvZ24wTYCZRbVZfRdx3DXn4=w480-h960-rw',
  MFL_LOGO: 'http://myfantasyleague.com/images/mfl_logo/updates/new_mfl_logo_80x80.gif',
  FLEAFLICKER_LOGO: 'https://d1h60c43tcq0zx.cloudfront.net/static/images/icons/apple-touch-icon-f3d0ad2586e334ad16152ed2ea83733c.png',
  ESPN_LOGO: 'https://espnpressroom.com/us/files/2018/03/App-Icon-iOS-mic-flag-cut-to-shape.png',
  FFPC_LOGO: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/28/c1/ba/28c1baf1-b1b1-f3c1-e5fe-185b41eff3b9/AppIcon-1x_U007emarketing-0-7-85-220.png/492x0w.webp',
}

export const PlatformNames = {
  SLEEPER: 'Sleeper',
  MFL: 'MFL',
  FLEAFLICKER: 'Fleaflicker',
  ESPN: 'ESPN',
  FFPC: 'FFPC',
}

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
      case LeaguePlatform.FLEAFLICKER:
        return PlatformNames.FLEAFLICKER;
      case LeaguePlatform.ESPN:
        return PlatformNames.ESPN;
      case LeaguePlatform.MFL:
        return PlatformNames.MFL;
      case LeaguePlatform.FFPC:
        return PlatformNames.FFPC;
      default:
        return PlatformNames.SLEEPER;
    }
  }

  /**
   * get image string for platform
   * @param platform
   */
  getImageForPlatform(platform: LeaguePlatform): string {
    switch (platform) {
      case LeaguePlatform.ESPN:
        return PlatformLogos.ESPN_LOGO;
      case LeaguePlatform.FFPC:
        return PlatformLogos.FFPC_LOGO;
      case LeaguePlatform.FLEAFLICKER:
        return PlatformLogos.FLEAFLICKER_LOGO;
      case LeaguePlatform.MFL:
        return PlatformLogos.MFL_LOGO;
      default:
        return PlatformLogos.SLEEPER_LOGO;
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
