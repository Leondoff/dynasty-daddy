import { LeagueRawTradePicksDTO } from './LeagueRawTradePicksDTO';

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

  fromESPN(transaction: any): LeagueTeamTransactionDTO {
    this.type = this.getTypeFromString(transaction?.type);
    this.transactionId = transaction?.id;
    this.status = this.getTransactionStatusFromString(transaction?.status);
    this.createdAt = transaction?.processDate || transaction?.proposedDate;
    this.drops = {};
    this.adds = {};
    if (this.type != 'trade') {
      this.rosterIds = [transaction?.teamId];
      transaction.items.forEach(p => {
        p.type == 'ADD' ?
          this.adds[p.playerId] = transaction?.teamId :
          this.drops[p.playerId] = transaction?.teamId
      })
    } else {
      this.rosterIds = [...new Set(transaction.items.map(obj => obj.toTeamId))] as number[];
      transaction.items.forEach(p => {
        this.adds[p.playerId] = transaction?.toTeamId;        
      })
    }
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

  getTypeFromString(type: string): string {
    switch(type) {
      case 'TRADE_ACCEPT':
        return 'trade';
      case 'FREEAGENT':
        return 'free_agent';
      default:
        return 'waiver';
    }
  }
}

export enum TransactionStatus {
  COMPLETED,
  IN_PROGRESS,
  FAILED
}
