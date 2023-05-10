import {LeagueRawTradePicksDTO} from './LeagueRawTradePicksDTO';

export class LeagueTeamTransactionDTO {

  type: string;
  transactionId: string;
  status: TransactionStatus;
  settings: {};
  rosterIds: number[] = [];
  drops: {} = {};
  adds: {} = {};
  draftpicks: LeagueRawTradePicksDTO[] = [];
  createdAt: number;

  constructor() {
  }

  fromSleeper(transaction: any, picks: LeagueRawTradePicksDTO[] = []): LeagueTeamTransactionDTO {
    this.type = transaction?.type;
    this.transactionId = transaction?.transaction_id;
    this.status = this.getTransactionStatusFromString(transaction?.status);
    this.settings = transaction?.settings;
    this.rosterIds = transaction?.roster_ids;
    this.drops = transaction?.drops || {};
    this.adds = transaction?.adds || {};
    this.draftpicks = picks;
    this.createdAt = transaction?.created;
    return this;
  }

  getTransactionStatusFromString(status: string): TransactionStatus {
    switch (status) {
      case 'in_progress':
        return TransactionStatus.IN_PROGRESS;
      case 'failed':
        return TransactionStatus.FAILED;
      default:
        return TransactionStatus.COMPLETED;
    }
  }
}

export enum TransactionStatus {
  COMPLETED,
  IN_PROGRESS,
  FAILED
}
