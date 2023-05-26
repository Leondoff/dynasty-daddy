import {Injectable} from '@angular/core';
import {FantasyMarket, FantasyPlayer} from '../../model/assets/FantasyPlayer';
import {TradePackage} from '../model/tradePackage';
import {TradeService} from './trade.service';

@Injectable({
  providedIn: 'root'
})
export class TradeFinderService {

  selectedTeamUserId: string;

  selectedPlayers: FantasyPlayer[] = [];

  constructor(private tradeService: TradeService) {
  }

  /**
   * Generate list of valid trade packages
   * @param players lists of players in trade finder
   * @param userId team 1 user id
   * @param isSuperFlex is superflex league
   * @param posFilterList filter position groups
   * @param limit how many results to return. DEFAULT 10
   * @return list of trade packages
   */
  generateTradeFinderResults(
    players: FantasyPlayer[],
    userId: string,
    isSuperFlex: boolean = true,
    posFilterList: boolean[],
    excludedUserIds: string[],
    fantasyMarket: FantasyMarket = FantasyMarket.KeepTradeCut,
    limit: number = 10,
  ): TradePackage[] {
    const tradePackages = [];
    for (let i = 0; i < limit; i++) {
      const newTrade = new TradePackage(players, [], 5, fantasyMarket)
        .setTeam1(userId)
        .setExcludePlayerList(this.buildExcludePlayerList(posFilterList))
        .setExcludedUserIds(excludedUserIds)
        .enableAutofill();
      const processedTrade = this.tradeService.determineTrade(newTrade, isSuperFlex);
      tradePackages.push(processedTrade);
    }
    return tradePackages;
  }

  /**
   * Builds the pos exclude list from boolean list
   * @param posList list of boolean checkboxes
   * @private
   */
  private buildExcludePlayerList(posList: boolean[]): string[] {
    const list = [];
    if (!posList[0]) {
      list.push('QB');
    }
    if (!posList[1]) {
      list.push('RB');
    }
    if (!posList[2]) {
      list.push('WR');
    }
    if (!posList[3]) {
      list.push('TE');
    }
    if (!posList[4]) {
      list.push('PI');
    }
    return list;
  }
}
