import {FantasyPlayer} from '../../model/FantasyPlayer';
import {LeagueTeam} from '../../model/LeagueTeam';

export class TeamPowerRanking {
  constructor(team: LeagueTeam, players: PositionPowerRanking[], sfTradeValue: number, tradeValue: number, picks: PositionPowerRanking) {
    this.team = team;
    this.roster = players;
    this.sfTradeValueOverall = sfTradeValue;
    this.tradeValueOverall = tradeValue;
    this.picks = picks;
  }

  team: LeagueTeam;
  roster: PositionPowerRanking[];
  picks: PositionPowerRanking;
  starters: FantasyPlayer[] = [];
  sfTradeValueOverall: number = 0;
  tradeValueOverall: number = 0;
  overallRank: number;
  starterRank: number;
  adpValueStarter: number = 0;
  eloAdpValueStarter: number = 0;
  eloAdpValueChange: number = 0;
  eloADPValueStarterHistory: number[] = [];
  tier: number;
}

export class PositionPowerRanking {
  constructor(pos: string, sfTradeValue: number, tradeValue: number, groupList: FantasyPlayer[]) {
    this.sfTradeValue = sfTradeValue;
    this.tradeValue = tradeValue;
    this.players = groupList;
    this.position = pos;
  }

  rank: number;
  position: string;
  sfTradeValue: number;
  tradeValue: number;
  players: FantasyPlayer[];
}

export enum TeamRankingTier {
  Super_Team,
  Contender,
  Frisky,
  Fraud,
  Rebuilding,
  Trust_the_Process
}
