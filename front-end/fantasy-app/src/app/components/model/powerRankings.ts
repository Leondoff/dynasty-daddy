import {FantasyPlayer} from '../../model/assets/FantasyPlayer';
import {LeagueTeam} from '../../model/league/LeagueTeam';

export class TeamPowerRanking {
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

  constructor(team: LeagueTeam, players: PositionPowerRanking[], sfTradeValue: number, tradeValue: number, picks: PositionPowerRanking) {
    this.team = team;
    this.roster = players;
    this.sfTradeValueOverall = sfTradeValue;
    this.tradeValueOverall = tradeValue;
    this.picks = picks;
  }

  /**
   * For the team, return the lowest valued players from the team
   * @param isSuperFlex is superflex league
   * @param playersToReturn players to return
   */
  public getRecommendedPlayersToDrop(isSuperFlex: boolean, playersToReturn: number): FantasyPlayer[] {
    const allPlayers = [];
    this.roster.forEach(player => {
      allPlayers.push(...player.players.filter(
        p => !this.team?.roster.taxi.includes(p.sleeper_id) && !this.team?.roster.reserve.includes(p.sleeper_id)
      ));
    });
    return allPlayers.sort((a, b) => b.sf_trade_value - a.sf_trade_value).slice(-1 * playersToReturn)
  }
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
  starterValue: number = 0;
  starterRank: number;
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

export enum PositionGroup {
  QB,
  RB,
  WR,
  TE
}
