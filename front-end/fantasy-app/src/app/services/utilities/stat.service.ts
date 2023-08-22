import {Injectable} from '@angular/core';
import { max, min } from 'simple-statistics';

@Injectable({
  providedIn: 'root'
})
export class StatService {

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
    const team2Prob = StatService.eloProbability(team1Rating, team2Rating);
    const team1Prob = StatService.eloProbability(team2Rating, team1Rating);

    if (didTeam1Win === true) {
      return [team1Rating + kValue * (1 - team1Prob), team2Rating + kValue * (0 - team2Prob)];
    } else {
      return [team1Rating + kValue * (0 - team1Prob), team2Rating + kValue * (1 - team2Prob)];
    }
  }

  /**
   * Bucket sort algorithm
   * @param valueDict Dictionary of entity id and value to sort by (ex:)
   * @param hardcodedWidth optional field for hardcoded bin count
   */
  bucketSort<T>(arr: T[], field: keyof T | string, hardcodedWidth?: number): T[][] {
    // Handle support for getting nested field values
    let getField: (item: T) => any;
    
    if (typeof field === 'string') {
        getField = (item: T) => {
            const fieldParts = field.split('.');
            let value = item;
            for (const part of fieldParts) {
                value = value[part];
            }
            return value;
        };
    } else {
        getField = (item: T) => item[field];
    }

    const groups = [];
    const valueList = arr.map(item => getField(item)) as number[];
    // get min rating
    const minRating = min(valueList);
    // get max rating
    const maxRating = max(valueList);
    // determine number of bins
    const binCount = hardcodedWidth || Math.ceil(Math.sqrt(valueList.length));
    // calculate the bin width
    const binWidth = Math.round((maxRating - minRating) / binCount * 100) / 100;
    // set up loop with floor & ceiling
    let binFloor = minRating;
    let binCeiling = minRating + binWidth;
    // loop through teams and determine each group
    for (let groupInd = 0; groupInd < binCount; groupInd++) {
      const newGroup = [];
      // handle edge cases for rounding issues
      const binFloorAdj = groupInd == 0 ? binFloor - binWidth : binFloor;
      const binCeilingAdj = groupInd + 1 == binCount ? binCeiling + binWidth : binCeiling;
      for (const item of arr) {
        if (getField(item) as number >= binFloorAdj && getField(item) as number <= binCeilingAdj) {
          newGroup.push(item);
        }
      };
      // after checking each team push group and set up next group
      groups.push(newGroup);
      binFloor = binCeiling;
      binCeiling += binWidth;
    }
    return groups.reverse();
  }
}
