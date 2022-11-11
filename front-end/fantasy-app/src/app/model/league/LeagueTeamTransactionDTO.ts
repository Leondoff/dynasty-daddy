import {LeagueRawTradePicksDTO} from './LeagueRawTradePicksDTO';

export class LeagueTeamTransactionDTO {
  constructor(transaction: any, picks: LeagueRawTradePicksDTO[] = []) {
    this.type = transaction?.type;
    this.transactionId = transaction?.transaction_id;
    this.status = this.getTransactionStatusFromString(transaction?.status);
    this.settings = transaction?.settings;
    this.rosterIds = transaction?.roster_ids;
    this.drops = transaction?.drops;
    this.adds = transaction?.adds;
    this.draftpicks = picks;
    this.createdAt = transaction?.created;
  }

  type: string;
  transactionId: string;
  status: TransactionStatus;
  settings: {};
  rosterIds: number[];
  drops: {};
  adds: {};
  draftpicks: LeagueRawTradePicksDTO[];
  createdAt: number;

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
