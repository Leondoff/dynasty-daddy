import { Injectable } from "@angular/core";
import { LeagueTeam } from "src/app/model/league/LeagueTeam";
import { LeagueService } from "src/app/services/league.service";
import { NflService } from "src/app/services/utilities/nfl.service";
import { TransactionUI } from "../model/transaction";
import { TransactionsService } from "./transactions.service";

@Injectable({
  providedIn: 'root'
})
export class WrappedService {

  frameNumber: number;

  /** map of stats to generate and display */
  transactionsDict = {};

  constructor(private leagueService: LeagueService, private transactionsService: TransactionsService, private nflService: NflService) { }

  /**
   * Set up transaction dictionary with metrics to show
   */
  calculateTransactionStatistics(): void {
    if (JSON.stringify(this.transactionsService.transactionAggregate) === '{}') {
      this.transactionsService.generateTransactionAggregate(this.nflService.getCompletedWeekForSeason(this.leagueService.selectedLeague.season));
    }
    let totalTrans = [];
    for (let i = 1; i <= this.leagueService.selectedLeague.totalRosters; i++) {
      let trans = 0;
      trans += this.transactionsService.transactionAggregate[i]?.actions || 0;
      trans += this.transactionsService.transactionAggregate[i]?.trades || 0;
      totalTrans.push(trans);
    }
    this.transactionsDict['total'] = totalTrans.reduce((partialSum, a) => partialSum + a, 0);;
    this.transactionsDict['max'] = Math.max(...totalTrans);
    this.transactionsDict['max_id'] = totalTrans.findIndex(e => e === this.transactionsDict['max']) + 1;
    this.transactionsDict['min'] = Math.min(...totalTrans);
    this.transactionsDict['min_id'] = totalTrans.findIndex(e => e === this.transactionsDict['min']) + 1;
    const trades: TransactionUI[] = [];
    const waivers: TransactionUI[] = [];
    for (let i = 1; i <= this.leagueService.selectedLeague.totalRosters; i++) {
      const teamTrans = this.transactionsService.generateTeamTransactionHistory(this.leagueService.getTeamByRosterId(i));
      teamTrans.forEach(tran => {
        if (tran.type === 'trade') {
          trades.push(tran);
        }
        if ((tran.type === 'waiver' || tran.type === 'free_agent') && tran.adds[0] && tran.adds[0].playerName !== undefined) {
          waivers.push(tran);
        }
      });
    }
    this.transactionsDict['trades'] = trades.sort((a, b) => (b.adds.reduce((p, x) => p + x.value, 0) + b.drops.reduce((p, x) => p + x.value, 0)) - (a.adds.reduce((p, x) => p + x.value, 0) + a.drops.reduce((p, x) => p + x.value, 0))).filter((a, i) => i % 2 === 1);
    this.transactionsDict['waivers'] = waivers.sort((a, b) => Math.abs(b.adds[0].value) - Math.abs(a.adds[0].value));
  }

  /**
   * sorts a list of teams by the team playoff odds to get winner
   * @param teams league teams
   * @param teamPlayoffOdds playoff odds map
   * @returns 
   */
  sortBySeasonWinner(teams: LeagueTeam[], teamPlayoffOdds: {}): LeagueTeam[] {
    return teams.slice().sort((a, b) => teamPlayoffOdds[b.roster.rosterId].timesWinChampionship - teamPlayoffOdds[a.roster.rosterId].timesWinChampionship ||
      teamPlayoffOdds[b.roster.rosterId].timesMakeChampionship - teamPlayoffOdds[a.roster.rosterId].timesMakeChampionship ||
      teamPlayoffOdds[b.roster.rosterId].timesMakeConfRd - teamPlayoffOdds[a.roster.rosterId].timesMakeConfRd
    );
  }
}
