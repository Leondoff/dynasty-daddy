import {Injectable} from '@angular/core';
import {TransactionPlayer, TransactionUI} from '../model/transaction';
import {LeagueTeam} from '../../model/league/LeagueTeam';
import {LeagueService} from '../../services/league.service';
import {NflService} from '../../services/utilities/nfl.service';
import {PlayerService} from '../../services/player.service';
import {LeagueTeamTransactionDTO, TransactionStatus} from '../../model/league/LeagueTeamTransactionDTO';
import {LeagueRawTradePicksDTO} from '../../model/league/LeagueRawTradePicksDTO';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  /** aggregate values for transactions */
  transactionAggregate = {};

  constructor(private leagueService: LeagueService, private nflService: NflService, private playerService: PlayerService) {
  }

  /**
   * generate team transaction history from fantasy team object
   * @param selectedTeam
   */
  generateTeamTransactionHistory(selectedTeam: LeagueTeam): TransactionUI[] {
    const teamActivity = [];
    if (JSON.stringify(this.leagueService.selectedLeague.leagueTransactions) !== '{}') {
      for (let i = this.leagueService.selectedLeague.startWeek || 1;
           i <= Object.keys(this.leagueService.selectedLeague?.leagueTransactions).length;
           i++) {
        for (const transaction of this.leagueService.selectedLeague?.leagueTransactions[i] as LeagueTeamTransactionDTO[]) {
          if (transaction.rosterIds.includes(selectedTeam.roster.rosterId) && transaction.status === TransactionStatus.COMPLETED) {
            teamActivity.push(this.formatTransactionUI(transaction, selectedTeam));
          }
        }
      }
      for (const activity of teamActivity) {
        activity.netValue = this.calculateNetValue(activity);
        activity.headerDisplay = this.getTransactionHeaderDisplay(activity, selectedTeam.roster.rosterId);
      }
      teamActivity.sort((a, b) => {
        return b.createdAt - a.createdAt;
      });
    }
    return teamActivity;
  }

  /**
   * format transaction into transactionUI object for display
   * @param transaction
   * @param selectedTeam
   * @private
   */
  private formatTransactionUI(transaction: LeagueTeamTransactionDTO, selectedTeam: LeagueTeam): TransactionUI {
    const adds = [];
    for (const playerPlatformId in transaction.adds) {
      if (transaction.adds[playerPlatformId] === selectedTeam.roster.rosterId) {
        adds.push(this.getPlayerDetails(playerPlatformId, selectedTeam.roster.rosterId));
      }
    }
    const drops = [];
    for (const playerPlatformId in transaction.drops) {
      if (transaction.drops[playerPlatformId] === selectedTeam.roster.rosterId) {
        drops.push(this.getPlayerDetails(playerPlatformId, selectedTeam.roster.rosterId));
      }
    }
    for (const draftPick of transaction.draftpicks) {
      if (draftPick.ownerId === selectedTeam.roster.rosterId) {
        adds.push(this.processTransactionPicks(draftPick, selectedTeam.roster.rosterId));
      } else if (draftPick.previousOwnerId === selectedTeam.roster.rosterId) {
        drops.push(this.processTransactionPicks(draftPick, selectedTeam.roster.rosterId));
      }
    }
    return new TransactionUI(transaction, adds, drops);
  }

  /**
   * get player details from player platform id
   * @param playerPlatformId
   * @param rosterId
   * @private
   */
  private getPlayerDetails(playerPlatformId: string, rosterId: number): TransactionPlayer {
    const player = this.playerService.getPlayerByPlayerPlatformId(playerPlatformId, this.leagueService.selectedLeague.leaguePlatform);
    if (player) {
      return {
        playerName: player.full_name, value: this.leagueService.selectedLeague.isSuperflex ?
          player.sf_trade_value : player.trade_value, rosterId
      };
    } else {
      return {playerName: this.leagueService.platformPlayersMap[playerPlatformId]?.full_name, value: 0, rosterId};
    }
  }

  /**
   * get pick details from draft pick
   * @param draftPick draft
   * @param rosterId team roster id
   * @private
   */
  private processTransactionPicks(draftPick: LeagueRawTradePicksDTO, rosterId: number): TransactionPlayer {
    const pick = this.playerService.getEstimatePickValueBy(draftPick.round, draftPick.season);
    if (pick) {
      return {
        playerName: pick.full_name, value: this.leagueService.selectedLeague.isSuperflex ?
          pick.sf_trade_value : pick.trade_value, rosterId
      };
    } else {
      const notFoundPick = this.playerService.getEstimatePickValueBy
      (draftPick.round,
        (Number(this.nflService.stateOfNFL.season) + 2).toString()
      );
      const placementSuffix = draftPick.round === 1 ? 'st' : draftPick.round === 2 ? 'nd' : 'th';
      return {
        playerName: draftPick.season + ' ' + draftPick.round + placementSuffix,
        value: this.leagueService.selectedLeague.isSuperflex ?
          notFoundPick?.sf_trade_value || 0 : notFoundPick.trade_value || 0,
        rosterId
      };
    }

  }

  /**
   * calculate net value of transaction
   * @param transactionUI
   * @private
   */
  private calculateNetValue(transaction: TransactionUI): number {
    let netValue = 0;
    for (const add of transaction.adds) {
      netValue += add.value;
    }
    for (const drop of transaction.drops) {
      netValue -= drop.value;
    }
    return netValue;
  }

  /**
   * create display header for transaction
   * @param transaction
   * @param selectedRosterId
   * @private
   */
  private getTransactionHeaderDisplay(transaction: TransactionUI, selectedRosterId: number): string {
    switch (transaction.type) {
      case 'trade': {
        const teams = [];
        for (const rosterId of transaction.rosterIds) {
          for (const team of this.leagueService.leagueTeamDetails) {
            if (team.roster.rosterId === rosterId && selectedRosterId !== team.roster.rosterId) {
              teams.push(team.owner?.teamName);
              break;
            }
          }
        }
        return 'Trade with ' + teams.toString();
      }
      default: {
        return 'Free Agent Signing';
      }
    }
  }

  /**
   * returns number of trades in transactions
   * @param teamActivity
   */
  getTradeTotal(teamActivity: TransactionUI[]): number {
    let tradeCount = 0;
    for (const activity of teamActivity) {
      if (activity.type === 'trade') {
        tradeCount++;
      }
    }
    return tradeCount;
  }

  /**
   * returns net value returned from transactions
   * @param teamActivity
   */
  getNetValueAdded(teamActivity: TransactionUI[]): number {
    let netValue = 0;
    for (const activity of teamActivity) {
      netValue += activity.netValue;
    }
    return netValue;
  }

  /**
   * generate transaction aggregate for teams
   * @param endWeek
   */
  generateTransactionAggregate(endWeek: number): void {
    if (this.leagueService.selectedLeague.leagueTransactions) {
      this.transactionAggregate = {};
      for (let rosterId = 1; rosterId <= this.leagueService.selectedLeague.totalRosters; rosterId++) {
        this.transactionAggregate[rosterId] = {actions: 0, trades: 0};
      }
      for (let i = this.leagueService.selectedLeague.startWeek; i <= endWeek; i++) {
        if (this.leagueService.selectedLeague.leagueTransactions[i]) {
          this.leagueService.selectedLeague.leagueTransactions[i]?.map(transaction => {
            transaction?.rosterIds.map(team => {
              transaction.type === 'trade' ? this.transactionAggregate[team].trades++ : this.transactionAggregate[team].actions++;
            });
          });
        }
      }
    }
  }

  /** reset aggregate */
  reset(): void {
    this.transactionAggregate = {};
  }
}
