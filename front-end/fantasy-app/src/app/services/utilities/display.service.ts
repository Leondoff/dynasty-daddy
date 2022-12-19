import {Injectable} from '@angular/core';
import {TeamRankingTier} from '../../components/model/powerRankings';

@Injectable({
  providedIn: 'root'
})
export class DisplayService {

  constructor() {
  }

  /**
   * Get tier string from number
   * @param tier string
   */
  getTierFromNumber(tier: number): string {
    return TeamRankingTier[tier].replace(/_/g, ' ');
  }
}
