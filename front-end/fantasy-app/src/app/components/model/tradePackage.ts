import {FantasyMarket, FantasyPlayer} from '../../model/assets/FantasyPlayer';

export class TradePackage {
  team1UserId: string = null;
  team1Assets: FantasyPlayer[] = [];
  team1AssetsValue: number = 0;
  team2UserId: string = null;
  team2Assets: FantasyPlayer[] = [];
  team2AssetsValue: number = 0;
  valueAdjustment: number = 0;
  // if applies to team 1's side this would be 1 or team 2 this would be 2
  // I left this as a number to support the option for 3 team trades in the future
  valueAdjustmentSide: number = 0;
  valueToEvenTrade: number = 0;
  acceptanceVariance: number = 5;
  acceptanceBufferAmount: number = 1000;
  isSuperFlex: boolean = true;
  autoFillTrade: boolean = false;
  fantasyMarket: FantasyMarket = FantasyMarket.KeepTradeCut;
  excludePosGroup: string[] = [];
  excludedUserIds: string[] = [];

  constructor(team1Assets: FantasyPlayer[], team2Assets: FantasyPlayer[], acceptanceVariance: number = 5, fantasyMarket: FantasyMarket = FantasyMarket.KeepTradeCut) {
    this.team1Assets = team1Assets;
    this.team2Assets = team2Assets;
    this.acceptanceVariance = acceptanceVariance;
    this.fantasyMarket = fantasyMarket;
  }

  setTeam1(userId: string): TradePackage {
    this.team1UserId = userId;
    return this;
  }

  setTeam2(userId: string): TradePackage {
    this.team2UserId = userId;
    return this;
  }

  addTeam2Assets(player: FantasyPlayer): TradePackage {
    this.team2Assets.push(player);
    return this;
  }

  enableAutofill(): TradePackage {
    this.autoFillTrade = true;
    return this;
  }

  setIsSuperFlex(isSuperFlex: boolean): TradePackage {
    this.isSuperFlex = isSuperFlex;
    return this;
  }

  setExcludePlayerList(excludeList: string[]): TradePackage {
    this.excludePosGroup = excludeList;
    return this;
  }

  setExcludedUserIds(excludedUserIds: string[]): TradePackage {
    this.excludedUserIds = excludedUserIds;
    return this;
  }

  setValueToEvenTrade(valueToEvenTrade: number): TradePackage {
    this.valueToEvenTrade = valueToEvenTrade;
    return this;
  }

  calculateValueToEvenTrade = () =>
     this.setValueToEvenTrade(this.valueAdjustmentSide === 1 ?
      Math.abs((this.team1AssetsValue + this.valueAdjustment) - this.team2AssetsValue) || 0 :
      Math.abs((this.team2AssetsValue + this.valueAdjustment) - this.team1AssetsValue) || 0)

  setTradeAssets(team1TradeAssets: FantasyPlayer[], team2TradeAssets: FantasyPlayer[]): TradePackage {
    this.team1Assets = team1TradeAssets;
    this.team2Assets = team2TradeAssets;
    return this.calculateAssetValues();
  }

  calculateAssetValues(): TradePackage {
    this.team1AssetsValue = this.getTotalValueOfPlayersFromList(this.team1Assets, this.isSuperFlex);
    this.team2AssetsValue = this.getTotalValueOfPlayersFromList(this.team2Assets, this.isSuperFlex);
    return this;
  }

  setAcceptanceBuffer(acceptanceBuffer: number): TradePackage {
    this.acceptanceBufferAmount = acceptanceBuffer;
    return this;
  }

  setValueAdjustment(valueAdjustment: number): TradePackage {
    this.valueAdjustment = valueAdjustment;
    return this;
  }

  setValueAdjustmentSide(valueAdjustmentSide: number): TradePackage {
    this.valueAdjustmentSide = valueAdjustmentSide;
    return this;
  }

  clearTradeSide(side: number): TradePackage {
    if (side === 1) {
      this.team1Assets = [];
      this.team1UserId = null;
      this.team1AssetsValue = 0;
    } else {
      this.team2Assets = [];
      this.team2UserId = null;
      this.team2AssetsValue = 0;
    }
    return this;
  }

  getTradeValueBySide(teamNumber: number): number {
    if (teamNumber === 1) {
      return this.team1AssetsValue + (
        this.valueAdjustmentSide === 1
          ? this.valueAdjustment : 0);
    } else {
      return this.team2AssetsValue + (
        this.valueAdjustmentSide === 2
          ? this.valueAdjustment : 0);
    }
  }

  /**
   * get which side of trade is favored
   */
  getWhichSideIsFavored(): number {
    // close enough to be a fair trade
    if (this.valueToEvenTrade < this.acceptanceBufferAmount) {
      return 0;
    }
    const team1 = this.getTradeValueBySide(1);
    const team2 = this.getTradeValueBySide(2);
    return team1 > team2 ? 1 : 2;
  }

  /**
   * accepts a list of players and returns the total trade value of list
   */
  private getTotalValueOfPlayersFromList(players: FantasyPlayer[], isSuperFlex: boolean = true): number {
    let totalValue = 0;
    players?.map(player => {
      totalValue += !isSuperFlex ? player.trade_value : player.sf_trade_value;
    });
    return totalValue;
  }
}

export class StudPlayerResponse {
  studPlayer: FantasyPlayer = null;
  adjustmentMultiplier: number = 1;

  constructor(player: FantasyPlayer, value: number = 1) {
    this.studPlayer = player;
    this.adjustmentMultiplier = value;
  }
}
