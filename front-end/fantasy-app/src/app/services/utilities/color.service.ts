import {Injectable} from '@angular/core';
import Gradient from 'javascript-color-gradient';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  /**
   * returns array of hexs in a gradient between two colors
   * @param length number of colors
   * @param color1 color at min
   * @param color2 color at max
   */
  getColorGradientArray(length: number, color1: string, color2: string): [] {
    const colorGradient = new Gradient();
    colorGradient.setMidpoint(length);
    colorGradient.setColorGradient(color1, color2);
    return colorGradient.getColors();
  }

  /**
   * gets point color for data point
   * @param isTeam is player on team
   */
  getPointBackgroundColor(highlightFreeAgent: boolean, highlightYourTeam: boolean, isTeam: boolean, isFreeAgent: boolean): string {
    return isTeam && highlightYourTeam ? '#17becf' : (highlightFreeAgent && isFreeAgent ? '#ff4f4f' : '#a6a6a6');
  }

  /**
   * get point border color for data point
   * @param isTeam is player on team
   */
  getPointBorderColor(highlightFreeAgent: boolean, highlightYourTeam: boolean, isTeam: boolean, isFreeAgent: boolean): string {
    return isTeam && highlightYourTeam ? '#a0e6f1' : (highlightFreeAgent && isFreeAgent ? '#faa1a1' : '#ffffff');
  }
}

export const ComparisonColorPalette = [
  '#03D8F3',
  '#F30360',
  '#9603F3',
  '#290CFF',
  '#FF019A',
  '#FFC300',
  '#C70039',
  '#FF5733',
  '#9DC700',
  '#00C72B',
  '#00C78F',
  '#009CC7',
]

export const BarChartColorPalette = [
  '#581845',
  '#900C3F',
  '#C70039',
  '#FF5733',
  '#FFC300',
  '#9DC700',
  '#00C72B',
]