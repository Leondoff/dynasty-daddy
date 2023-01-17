import {LeagueTeamTransactionDTO, TransactionStatus} from '../../model/league/LeagueTeamTransactionDTO';

export class TransactionUI {
  constructor(transaction: LeagueTeamTransactionDTO, adds: any[], drops: any[]) {
    this.type = transaction.type;
    this.adds = adds;
    this.drops = drops;
    this.createdAt = transaction.createdAt;
    this.picks = transaction.draftpicks;
    this.status = transaction.status;
    this.rosterIds = transaction.rosterIds;
  }

  type: string;
  status: TransactionStatus;
  adds: TransactionPlayer[];
  drops: TransactionPlayer[];
  netValue: number;
  fcNetValue: number;
  picks: any[];
  createdAt: number;
  rosterIds: number[];
  headerDisplay: string;
}

export class TransactionPlayer {
  playerName: string;
  value: number;
  fcValue: number;
  rosterId: number;
}
