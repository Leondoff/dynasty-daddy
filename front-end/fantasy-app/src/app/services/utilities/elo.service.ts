import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EloService {

  constructor() {
  }

  /**
   * calculate probability from two ratings
   * @param rating1 rating 1
   * @param rating2 rating 2
   */
  private static eloProbability(rating1: number, rating2: number): number {
    return (
      (1.0) / (1 + Math.pow(10, ((rating1 - rating2)) / 400))
    );
  }

  /**
   * Generate updated elo for a completed users match up
   * @param team1Rating team 1 rating
   * @param team2Rating team 2 rating
   * @param kValue k value
   * @param didTeam1Win boolean if true team 1 won
   */
  eloRating(team1Rating: number, team2Rating: number, kValue: number, didTeam1Win: boolean): number[] {
    const team2Prob = EloService.eloProbability(team1Rating, team2Rating);
    const team1Prob = EloService.eloProbability(team2Rating, team1Rating);

    if (didTeam1Win === true) {
      return [team1Rating + kValue * (1 - team1Prob), team2Rating + kValue * (0 - team2Prob)];
    } else {
      return [team1Rating + kValue * (0 - team1Prob), team2Rating + kValue * (1 - team2Prob)];
    }
  }
}
