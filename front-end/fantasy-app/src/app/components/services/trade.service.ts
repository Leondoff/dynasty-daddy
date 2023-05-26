import { Injectable } from '@angular/core';
import { StudPlayerResponse, TradePackage } from '../model/tradePackage';
import { FantasyMarket, FantasyPlayer } from '../../model/assets/FantasyPlayer';
import { PlayerService } from '../../services/player.service';
import { LeagueService } from '../../services/league.service';
import { LeagueType } from 'src/app/model/league/LeagueDTO';

@Injectable({
  providedIn: 'root'
})
export class TradeService {

  tradePackage: TradePackage = null;

  constructor(
    private playerService: PlayerService,
    private leagueService: LeagueService
  ) {
  }

  /**
   * generate trade package based on input trade package
   * uses builder pattern
   * @param undeterminedTradePackage unfinished trade package
   * @param isSuperFlex is superflex league
   */
  determineTrade(undeterminedTradePackage: TradePackage, isSuperFlex: boolean): TradePackage {
    let processedTrade = this.updateTradePackageValues(undeterminedTradePackage, isSuperFlex);
    // used for multi-value edge case
    const initialValueToEvenTrade = processedTrade.valueToEvenTrade;
    // trade finder processing for finding fair trade
    if (processedTrade.autoFillTrade) {
      while (processedTrade.valueToEvenTrade > processedTrade.acceptanceBufferAmount && processedTrade.getWhichSideIsFavored() === 1) {
        // get players to even trade
        const playersToEven = this.findBestPlayerForValue(
          processedTrade.valueToEvenTrade,
          isSuperFlex,
          processedTrade,
          processedTrade.team2UserId ? 5 : 30
        );
        // pick random player from list set trade for
        const playerToAdd = playersToEven[Math.round(Math.random() * playersToEven.length)];
        // if player is undefined then return trade
        if (!playerToAdd) {
          return processedTrade;
        }
        // if team 2 is null set user id of trade partner
        if (!processedTrade.team2UserId) {
          processedTrade.setTeam2(playerToAdd.owner?.userId);
        }
        processedTrade = this.updateTradePackageValues(processedTrade.addTeam2Assets(playerToAdd), isSuperFlex);
        // handles edge case where team selects multiple players and the value needed to even is on the user not the other team
        if (processedTrade.getWhichSideIsFavored() === 2) {
          // clear out trade and update the value to even trade
          processedTrade.clearTradeSide(2).setValueToEvenTrade(initialValueToEvenTrade - processedTrade.valueToEvenTrade);
        }
      }
    }
    return processedTrade;
  }

  /**
   * Helper function for updating trade package evaluations
   * @param tradePackage TradePackage to update
   * @param isSuperFlex is super flex
   * @returns 
   */
  private updateTradePackageValues(tradePackage: TradePackage, isSuperFlex: boolean): TradePackage {
    // update trade evaluations
    if (tradePackage.fantasyMarket === FantasyMarket.KeepTradeCut) {
      return this.determineValueAdjustment(tradePackage, isSuperFlex)
    } else {
      tradePackage = tradePackage.setIsSuperFlex(isSuperFlex).calculateAssetValues().calculateValueToEvenTrade();
      return tradePackage.setAcceptanceBuffer((tradePackage.team1AssetsValue + tradePackage.team2AssetsValue) * (tradePackage.acceptanceVariance / 100));
    }
  }

  /**
   * determine value adjustment from trade
   * @param tradePackage
   * @param isSuperFlex
   */
  determineValueAdjustment(tradePackage: TradePackage, isSuperFlex: boolean): TradePackage {
    // trade value of team sides
    tradePackage.setIsSuperFlex(isSuperFlex).calculateAssetValues();
    // total value of trade
    const totalTradeValue = tradePackage.team1AssetsValue + tradePackage.team2AssetsValue;
    // determine STUD pick
    const studPlayerResponse = this.determineValuePlayer(tradePackage.team1Assets, tradePackage.team2Assets, isSuperFlex);
    const studPlayer = studPlayerResponse?.studPlayer;
    const studPlayerValue = isSuperFlex ? studPlayer?.sf_trade_value : studPlayer?.trade_value;
    // TODO change when adding multi team support
    tradePackage.setValueAdjustmentSide(tradePackage.team2Assets.includes(studPlayer) ? 2 : 1);
    // calculate value adjustment
    const valAdj = Math.round(studPlayerValue / totalTradeValue *
      (tradePackage.valueAdjustmentSide === 1 ? tradePackage.team2AssetsValue : tradePackage.team1AssetsValue));
    // set all values from calculations in trade package object
    tradePackage
      .setValueAdjustment(Math.round(valAdj * (studPlayerResponse?.adjustmentMultiplier || 1) || 0))
      .calculateValueToEvenTrade()
      .setAcceptanceBuffer((totalTradeValue + tradePackage.valueAdjustment) * (tradePackage.acceptanceVariance / 100))
      .setIsSuperFlex(isSuperFlex);
    return tradePackage;
  }

  /**
   * Determines the value adjustment player. This is based on sorting by each team by value.
   * Then we make sure a player of equivalent value (5% range) isn't on the other team.
   * (i.e. Pat Mahomes and Josh Allen are basically equivalent in value so we don't need an adjustment)
   * TODO clean up redundant code
   * @param team1 team 1 players
   * @param team2 team 2 players
   * @param isSuperFlex boolean
   * @private
   */
  private determineValuePlayer(team1: FantasyPlayer[], team2: FantasyPlayer[], isSuperFlex: boolean): StudPlayerResponse {
    let valueAdjustmentMultiplier = 1;
    const filteredTeam1Players: FantasyPlayer[] = team1.slice().sort((a, b) =>
      isSuperFlex ? b.sf_trade_value - a.sf_trade_value : b.trade_value - a.trade_value);
    const filteredTeam2Players: FantasyPlayer[] = team2.slice().sort((a, b) =>
      isSuperFlex ? b.sf_trade_value - a.sf_trade_value : b.trade_value - a.trade_value);
    // loop through trade package and remove "equal" value players
    while (filteredTeam1Players.length > 0 && filteredTeam2Players.length > 0) {
      const team1Stud = filteredTeam1Players[0];
      const team2Stud = filteredTeam2Players[0];
      if (this.playerService.comparePlayersValue(team1Stud, team2Stud, isSuperFlex)) {
        // team 1 stud is more valuable
        // check if team 2 stud is within 5% of stud
        if (
          isSuperFlex ?
            team1Stud.sf_trade_value * 0.95 <= team2Stud.sf_trade_value
            : team1Stud.trade_value * 0.95 <= team2Stud.trade_value
        ) {
          // remove two players
          filteredTeam2Players.splice(0, 1);
          filteredTeam1Players.splice(0, 1);
        } else {
          valueAdjustmentMultiplier = this.getValueAdjustmentMultiplier(team1Stud, team2, isSuperFlex);
          // return value stud
          return new StudPlayerResponse(team1Stud, valueAdjustmentMultiplier);
        }
      } else {
        // team 2 stud is more valuable
        // check if team 2 stud is within 5% of stud
        if (
          isSuperFlex ?
            team2Stud.sf_trade_value * 0.95 <= team1Stud.sf_trade_value
            : team2Stud.trade_value * 0.95 <= team1Stud.trade_value
        ) {
          // remove two players
          filteredTeam2Players.splice(0, 1);
          filteredTeam1Players.splice(0, 1);
        } else {
          valueAdjustmentMultiplier = this.getValueAdjustmentMultiplier(team2Stud, team1, isSuperFlex);
          // return value stud
          return new StudPlayerResponse(team2Stud, valueAdjustmentMultiplier);
        }
      }
    }
    // if player still exists return that player
    if (filteredTeam1Players.length > 0) {
      return new StudPlayerResponse(filteredTeam1Players[0]);
    }
    if (filteredTeam2Players.length > 0) {
      return new StudPlayerResponse(filteredTeam1Players[0]);
    }
    return null;
  }

  /**
   * find best player based on passed in value
   * @param maxValue max value of player to return
   * @param isSuperFlex is superflex or not
   * @param tradePackage trade package object of trade to evaluate
   * @param listLength list of players to return
   */
  findBestPlayerForValue(
    maxValue: number,
    isSuperFlex: boolean = true,
    tradePackage: TradePackage = this.tradePackage,
    listLength: number = 5): FantasyPlayer[] {
    // find user id of weaker side of trade
    const userIdFilter = tradePackage.getWhichSideIsFavored() === 1 ? tradePackage.team2UserId : tradePackage.team1UserId;
    // filter list by user id then filter by value last filter by if player is in current trade
    let sortedList = this.filterPlayersList(userIdFilter)
      .filter(player => (isSuperFlex ? player.sf_trade_value : player.trade_value) <= maxValue)
      .filter(player => !tradePackage?.team1Assets.includes(player) && !tradePackage?.team2Assets.includes(player))
      .filter(player => !tradePackage.excludePosGroup.includes(player.position))
      .filter(player => !tradePackage.excludedUserIds.includes(player?.owner?.userId));
    if (tradePackage.autoFillTrade) {
      sortedList = sortedList.filter(player => (player.position === 'PI'
        || player.owner !== null && player.owner.userId !== tradePackage.team1UserId));
    }
    // sort list by largest value
    return sortedList.sort((a, b) => isSuperFlex ? b.sf_trade_value - a.sf_trade_value : b.trade_value - a.trade_value).slice(0, listLength);
  }

  /**
   * Filters list of all players by team.
   * Used for filtering which players show up in searches
   * @param userId string
   * @param includeAllPicks bool include early mid and late picks
   * @private
   */
  filterPlayersList(userId: string = null, includeAllPicks: boolean = false): FantasyPlayer[] {
    let playerList = this.playerService.playerValues
    // for non dynasty filter out picks
    if (this.leagueService.selectedLeague && this.leagueService.selectedLeague.type !== 2) {
      playerList = this.playerService.playerValues.filter(player => player.position !== 'PI');
    }
    if (userId && userId != 'none') {
      // filter players by team
      const teamPlayerList = playerList.filter(it => it.owner?.userId === userId);
      // get draft capital for team in filter
      const team = this.leagueService.getTeamByUserId(userId);
      if (team && this.leagueService.selectedLeague.type === LeagueType.DYNASTY) {
        const picks = this.leagueService.getDraftCapitalToNameId(team.futureDraftCapital);
        picks.map(pick => {
          const pickPlayer = this.playerService.getPlayerByNameId(pick);
          if (pickPlayer) {
            teamPlayerList.push(pickPlayer);
            if(includeAllPicks && pick.includes("mid")) {
              teamPlayerList.push(this.playerService.getPlayerByNameId(pick.replace("mid", "early")));
              teamPlayerList.push(this.playerService.getPlayerByNameId(pick.replace("mid", "late")));
            }
          }
        });
      }
      return teamPlayerList.sort((a, b) => b.sf_trade_value - a.sf_trade_value);
    } else {
      return playerList;
    }
  }

  /**
   * returns a multiplier for modifying the value adjustment
   * @param stud stud player in trade
   * @param otherTeam assets
   * @param isSuperFlex is super flex
   * @private
   */
  private getValueAdjustmentMultiplier(stud: FantasyPlayer, otherTeam: FantasyPlayer[], isSuperFlex: boolean): number {
    let valueModifier = 1;
    const studPosition = this.playerService.getPlayersValueIndex(stud, isSuperFlex);
    otherTeam.forEach(player => {
      if (isSuperFlex ?
        stud.sf_trade_value * 0.95 > player.sf_trade_value
        : stud.trade_value * 0.95 > player.trade_value) {
        if (Math.abs(studPosition
          - this.playerService.getPlayersValueIndex(player, isSuperFlex)) <= (studPosition < 10 ? 5 : 20)) {
          valueModifier -= 0.2;
        }
      }

    });
    return valueModifier;
  }

  /**
   * reset the trade package
   */
  reset(): void {
    this.tradePackage = null;
  }
}
