import { Injectable } from '@angular/core';
import Gradient from 'javascript-color-gradient';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  probGradient: {} = {};

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
   * Get Probability gradient and cache it in color service
   * @returns color gradient from -100 - 100
   */
  getProbGradient(): {} {
    if (JSON.stringify(this.probGradient) === '{}') {
      const postiveArr = this.getColorGradientArray(101, '#28283c', '#3f7bfb');
      postiveArr.forEach((color, ind) => {
        this.probGradient[ind] = color;
      });
      const negativeArr = this.getColorGradientArray(101, '#28283c', '#fe8180');
      negativeArr.forEach((color, ind) => {
        if (ind != 0) {
          this.probGradient[ind * -1] = color;
        }
      });
    }
    return this.probGradient;
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

  /**
   * return color code for trade position
   * @param pos string acryonm for pos
   */
  getTradeColorForPos(pos: string): string {
    switch (pos) {
      case 'QB':
        return ComparisonColorPalette[0]
      case 'RB':
        return ComparisonColorPalette[1]
      case 'WR':
        return ComparisonColorPalette[2]
      case 'TE':
        return ComparisonColorPalette[3]
      case 'K':
        return ComparisonColorPalette[5]
      case 'DF':
        return ComparisonColorPalette[6]
      case 'DL':
        return ComparisonColorPalette[7]
      case 'LB':
        return ComparisonColorPalette[8]
      case 'DB':
        return ComparisonColorPalette[9]
      default:
        return ComparisonColorPalette[4]
    }
  }

    /**
   * return color code for draft position
   * @param pos string acryonm for pos
   */
    getDraftColorForPos(pos: string): string {
      switch (pos) {
        case 'QB':
          return DraftPosColorPallette[0]
        case 'RB':
          return DraftPosColorPallette[1]
        case 'WR':
          return DraftPosColorPallette[2]
        case 'TE':
          return DraftPosColorPallette[3]
        case 'K':
          return DraftPosColorPallette[4]
        case 'DF':
          return DraftPosColorPallette[5]
        case 'DL':
          return DraftPosColorPallette[6]
        case 'LB':
          return DraftPosColorPallette[7]
        case 'DB':
          return DraftPosColorPallette[8]
        default:
          return DraftPosColorPallette[4]
      }
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

export const TierColorPalette = [
  '#9DC700',
  '#c59700',
  '#FF5733',
  '#C70039',
  '#900C3F',
  '#581845'
]

// draft colors to match sleeper
export const DraftPosColorPallette = [
  '#ef74a1cc',
  '#8ff2cacc',
  '#56c9f8cc',
  '#feae58cc',
  '#b6b9ffcc',
  '#bf755dcc',
  '#fa9961cc',
  '#fea0cacc',
  // additional ones for tiers
  '#ff5a5fcc',  // Coral Pink
  '#ff8c42cc',  // Neon Carrot
  '#793a80cc',  // Plum
  '#00a896cc',  // Emerald
  '#b4cc80cc',  // Lime
  '#8772fccc',  // Medium Purple
  '#ff7e3ccc',  // Tangerine
  '#758bffcc',  // Sky Blue
  '#ffdf5dcc',  // Pale Gold
  '#c95e6ecc',  // Blush
  '#ffdf5dcc',  // Pale Gold
  '#ff8c42cc',  // Neon Carrot
  '#f582aecc',  // Rose
  '#94d2bdcc',  // Celadon Green
  '#ff6363cc',  // Melon
  '#5e5e5ecc',  // Dim Gray
];
