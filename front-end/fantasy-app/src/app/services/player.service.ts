/* tslint:disable:object-literal-key-quotes */
import { Injectable } from '@angular/core';
import { FantasyMarket, FantasyPlayer, FantasyPlayerDataPoint } from '../model/assets/FantasyPlayer';
import { FantasyPlayerApiService } from './api/fantasy-player-api.service';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { LeagueTeam } from '../model/league/LeagueTeam';
import { SleeperApiService } from './api/sleeper/sleeper-api.service';
import { map } from 'rxjs/operators';
import { NflService } from './utilities/nfl.service';
import { mean, standardDeviation, variance } from 'simple-statistics';
import { PlayerInsights } from '../components/model/playerInsights';
import { LeaguePlatform } from '../model/league/FantasyPlatformDTO';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  /** player values for today */
  playerValues: FantasyPlayer[] = [];

  /** player values for today with no filtering */
  unfilteredPlayerValues: FantasyPlayer[] = [];

  /** player yearly stats dict from sleeper */
  playerStats = {};

  /** past week dict from sleeper. 18 weeks */
  pastSeasonWeeklyStats = {};

  /** past week dict from sleeper for projections. 18 weeks */
  pastSeasonWeeklyProjections = {};

  /** player stats year */
  playerStatsYear: string = '';

  /** league leaders for stat categories */
  leagueLeaders = {
    pts_half_ppr: { value: 0, sleeperId: '' },
    pts_ppr: { value: 0, sleeperId: '' },
    pts_std: { value: 0, sleeperId: '' },
    rec: { value: 0, sleeperId: '' },
    pass_yd: { value: 0, sleeperId: '' },
    pass_td: { value: 0, sleeperId: '' },
    rush_att: { value: 0, sleeperId: '' },
    rush_td: { value: 0, sleeperId: '' },
    rush_yd: { value: 0, sleeperId: '' },
    rec_yd: { value: 0, sleeperId: '' },
    pass_cmp: { value: 0, sleeperId: '' },
    fum_lost: { value: 0, sleeperId: '' },
    pass_int: { value: 0, sleeperId: '' },
    rec_td: { value: 0, sleeperId: '' },
    rec_tgt: { value: 0, sleeperId: '' }
  };

  /** subject for loading player values */
  currentPlayerValuesLoaded$: Subject<void> = new Subject<void>();

  /** subject for updating new player values */
  playerValuesUpdated$: Subject<void> = new Subject<void>();

  /** currently selected market fantasy market */
  selectedMarket: FantasyMarket = FantasyMarket.KeepTradeCut;

  constructor(private fantasyPlayerApiService: FantasyPlayerApiService,
    private sleeperApiService: SleeperApiService,
    private nflService: NflService) {
  }

  /**
   * loads all player data upon entering site
   */
  loadPlayerValuesForToday(): void {
    // TODO Improve how this works
    if (this.playerValues.length > 0) return;
    this.fantasyPlayerApiService.getPlayerValuesForToday().subscribe((currentPlayers) => {
      this.unfilteredPlayerValues = currentPlayers;
      this.playerValues = currentPlayers.filter(player => {
        if (player.position === 'PI') {
          return Number(player.first_name) >= new Date().getFullYear() && player.sf_trade_value > 0;
        } else {
          return player;
        }
      });
      this.loadPlayerStatsForSeason$().subscribe((playerStatsResponse) => {
        this.currentPlayerValuesLoaded$.next();
      }, sleeperError => {
        console.error(`Could Not Load Player Points from sleeper - ${sleeperError}`);
      });
      return of(this.playerValues);
    }, error => {
      console.error(`Could Not Load Player Values - ${error}`);
      return of(null);
    });
  }

  /**
   * Update player values with new market values
   * @param newMarket new market values to fetch
   * @returns 
   */
  loadPlayerValuesForFantasyMarket$(newMarket: FantasyMarket): Observable<any> {
    return this.fantasyPlayerApiService.getPlayerValueForFantasyMarket(newMarket).pipe(map((playerValueMap) => {
      this.unfilteredPlayerValues.map(player => {
        const playerValues = playerValueMap[player.name_id]
        player.trade_value = playerValues?.trade_value;
        player.sf_trade_value = playerValues?.sf_trade_value;
        player.all_time_high = playerValues?.all_time_high;
        player.all_time_high_sf = playerValues?.all_time_high_sf;
        player.all_time_low = playerValues?.all_time_low;
        player.all_time_low_sf = playerValues?.all_time_low_sf;
        player.three_month_high = playerValues?.three_month_high;
        player.three_month_high_sf = playerValues?.three_month_high_sf;
        player.three_month_low = playerValues?.three_month_low;
        player.three_month_low_sf = playerValues?.three_month_low_sf;
        player.sf_change = playerValues?.sf_change;
        player.standard_change = playerValues?.standard_change;
        player.sf_position_rank = playerValues?.sf_position_rank;
        player.position_rank = playerValues?.position_rank;
        player.last_month_value = playerValues?.last_month_value || 0;
        player.last_month_value_sf = playerValues?.last_month_value_sf || 0;
        return player;
      });
      this.playerValues = this.unfilteredPlayerValues.filter(player => {
        if (player.position === 'PI') {
          return Number(player.first_name) >= new Date().getFullYear() && player.sf_trade_value > 0;
        } else {
          return player;
        }
      });
      this.playerValuesUpdated$.next();
      return of(newMarket);
    }));
  }

  /**
   * load player stats and projection for season
   * @private
   */
  private loadPlayerStatsForSeason$(): Observable<any> {
    return this.nflService.initStateOfNfl$().pipe(map((season) => {
      if (this.playerStatsYear !== '') {
        return of(this.playerStats);
      }
      this.playerStatsYear = this.nflService.getYearForStats();
      const observe = [];
      observe.push(this.sleeperApiService.getSleeperStatsForYear(this.playerStatsYear).pipe(map((response: any) => {
        this.playerStats = response;
        // get league leaders
        // tslint:disable-next-line:forin
        for (const key in this.playerStats) {
          for (const field in this.leagueLeaders) {
            if (!key.includes('TEAM') && this.playerStats[key]?.[field]
              && this.leagueLeaders[field].value < this.playerStats[key]?.[field]) {
              this.leagueLeaders[field].value = this.playerStats[key]?.[field];
              this.leagueLeaders[field].sleeperId = key;
            }
          }
        }
        return of(this.playerStats);
      })));
      let currentWeekInd = this.nflService.stateOfNFL.seasonType !== 'post' ? this.nflService.stateOfNFL.completedWeek : 18;
      const currentYearInd = this.nflService.getYearForStats();
      for (let weekNum = 1; weekNum < 19; weekNum++) {
        if (currentWeekInd === 0) currentWeekInd = currentWeekInd < 2021 ? 17 : 18;
        observe.push(this.sleeperApiService.getSleeperStatsForWeek(
          currentYearInd,
          currentWeekInd).pipe(map((weeklyStats) => {
            this.pastSeasonWeeklyStats[weekNum] = weeklyStats;
            return of(weeklyStats);
          })));

        observe.push(this.sleeperApiService.getSleeperProjectionsForWeek(
          currentYearInd,
          currentWeekInd).pipe(map((weeklyStats) => {
            this.pastSeasonWeeklyProjections[weekNum] = weeklyStats;
            return of(weeklyStats);
          })));
        currentWeekInd--;
      }
      forkJoin(observe).subscribe(() => {
        return of(this.pastSeasonWeeklyStats);
      }
      );
      return of(this.pastSeasonWeeklyStats);
    }));
  }

  /**
   * assign players to fantasy teams
   * @param team
   * @param leaguePlatform
   */
  generateRoster(team: LeagueTeam, leaguePlatform: LeaguePlatform = LeaguePlatform.SLEEPER): FantasyPlayer[] {
    const roster = [];
    if (!team.roster.players) {
      return [];
    }
    for (const platformPlayerId of team.roster?.players) {
      for (const player of this.playerValues) {
        if (platformPlayerId === this.getPlayerPlatformId(player, leaguePlatform)) {
          player.owner = team.owner;
          roster.push(player);
          break;
        }
      }
    }
    return roster;
  }

  /**
   * get player based on league player id
   * @param id player id
   * @param leaguePlatform league platform to find id from. Default: Sleeper
   */
  getPlayerByPlayerPlatformId(id: string, leaguePlatform: LeaguePlatform = LeaguePlatform.SLEEPER): FantasyPlayer {
    for (const player of this.playerValues) {
      switch (leaguePlatform) {
        case LeaguePlatform.MFL: {
          if (id === player.mfl_id) return player;
          break;
        }
        case LeaguePlatform.FLEAFLICKER: {
          if (id === player.ff_id) return player;
          break;
        }
        case LeaguePlatform.ESPN: {
          if (id === player.espn_id) return player;
          break;
        }
        default: {
          if (id === player.sleeper_id) return player;
          break;
        }
      }
    }
    return null;
  }

  /**
   * reset players owners when changing leagues
   */
  resetOwners(): void {
    for (const player of this.playerValues) {
      player.owner = null;
    }
  }

  /**
   * get full team name from acc
   * @param acc
   */
  getFullTeamNameFromACC(acc: string): string {
    return this.nflService.teamAccToFullName[acc];
  }

  /**
   * returns players current value based name id
   * @param id
   */
  getPlayerByNameId(id: string): FantasyPlayer {
    for (const player of this.playerValues) {
      if (id === player.name_id) {
        return player;
      }
    }
    return null;
  }

  /**
   * get week label for table
   * @param index
   */
  getWeekByIndex(index: number): string {
    index--;
    if (this.nflService.stateOfNFL) {
      let weekNum = this.nflService.getCompletedWeekForSeason(this.nflService.stateOfNFL.season) - index;
      let year = Number(this.nflService.stateOfNFL.season);
      if (weekNum < 1) {
        year--;
        weekNum = (year < 2021 ? 17 : 18) - Math.abs(weekNum);
        if (weekNum < 1) {
          year--;
          weekNum = (year < 2021 ? 17 : 18) - Math.abs(weekNum);
        }
      }
      return 'Week ' + weekNum + ' ' + year;
    }
  }

  /**
   * return mid round pick for given year and round
   * @param round
   * @param season
   */
  getEstimatePickValueBy(round: number, season: string): FantasyPlayer {
    for (const player of this.playerValues) {
      if (player.first_name === season) {
        if (round === 1 && player.full_name.includes('Mid 1st')) {
          return player;
        } else if (round === 2 && player.full_name.includes('Mid 2nd')) {
          return player;
        } else if (round === 3 && player.full_name.includes('Mid 3rd')) {
          return player;
        } else if (round === 4 && player.full_name.includes('Mid 4th')) {
          return player;
        }
      }
    }
    return null;
  }

  /**
   * return index of player in player values
   * @param nameId
   * @param playerList
   */
  getRankOfPlayerByNameId(nameId: string, playerList: FantasyPlayer[] = this.playerValues): number {
    for (let i = 0; i < playerList.length; i++) {
      if (nameId === playerList[i].name_id) {
        return i;
      }
    }
    // if not in list return last
    return playerList.length;
  }

  /**
   * get Adjacent players by value
   * @param nameId name of player to get adj to
   * @param posFilter what pos to filter on, if empty include all
   * @param isSuperflex is value superflex or standard, default to true
   * @param fantasyMarket Enum of what fantasy market to use
   */
  getAdjacentPlayersByNameId(nameId: string, posFilter: string = '', isSuperflex: boolean = true, fantasyMarket: FantasyMarket = this.selectedMarket): { rank: number, player: FantasyPlayer }[] {
    const cleanedPlayerList = this.cleanOldPlayerData(this.playerValues);
    cleanedPlayerList.sort((a, b) => {
      return isSuperflex ? b.sf_trade_value - a.sf_trade_value : b.trade_value - a.trade_value;
    });
    const players = this.getAdjacentPlayersFromList(nameId, cleanedPlayerList, posFilter);
    return players.sort((a, b) => {
      return a.rank - b.rank
    });
  }

  /**
   * get Adjacent players by ADP
   * @param nameId name of player to get adj to
   * @param posFilter what pos to filter on, if empty include all
   */
  getAdjacentADPPlayersByNameId(nameId: string, posFilter: string = ''): FantasyPlayer[] {
    const cleanedPlayerList = this.cleanOldPlayerData(this.playerValues).filter(it => it.position === posFilter && it.avg_adp !== 0);
    cleanedPlayerList.sort((a, b) => {
      return a.avg_adp - b.avg_adp;
    });
    return this.getAdjacentPlayersFromList(nameId, cleanedPlayerList).map(it => it.player).sort((a, b) => {
      return a.avg_adp - b.avg_adp;
    });
  }

  /**
   * Returns adjacent players based on name id and cleaned list passed in
   * @param nameId player name id
   * @param cleanedPlayerList cleaned list of players to get adjacents from
   * @param posFilter position to filter from
   * @private
   */
  private getAdjacentPlayersFromList(nameId: string, cleanedPlayerList: FantasyPlayer[], posFilter: string = ''): { rank: number, player: FantasyPlayer }[] {
    const players = [];
    const playerRank = this.getRankOfPlayerByNameId(nameId, cleanedPlayerList);
    for (let upInd = playerRank - 1; upInd >= 0 && players.length < 4; upInd--) {
      if (posFilter.length === 0 || cleanedPlayerList[upInd].position === posFilter) {
        players.push({ rank: upInd, player: cleanedPlayerList[upInd] });
      }
    }
    for (let downInd = playerRank; downInd < cleanedPlayerList.length && players.length < 9; downInd++) {
      if (posFilter.length === 0 || cleanedPlayerList[downInd].position === posFilter) {
        players.push({ rank: downInd, player: cleanedPlayerList[downInd] });
      }
    }
    return players;
  }

  /**
   * returns draft picks values for year
   * @param season season defaults to next season
   */
  getDraftPicksForYear(season: string = (Number(this.nflService.stateOfNFL.season) + 1).toString()): FantasyPlayer[] {
    return this.playerValues.filter(pick => {
      if (pick.position === 'PI' && pick.full_name.includes(season)) {
        return pick;
      }
    });
  }

  /**
   * returns current value of player with a week buffer
   * @param player fantasy player
   * @param isSuperFlex boolean
   */
  getCurrentPlayerValue(player: FantasyPlayer, isSuperFlex: boolean): number {
    const now = new Date();
    const lastWeekMs = now.getTime() - 1000 * 60 * 60 * 24 * 7;
    if (player.position !== 'PI' && new Date(player.date).setHours(0, 0, 0, 0) < new Date(lastWeekMs).setHours(0, 0, 0, 0)) {
      return 0;
    } else {
      return isSuperFlex ? player.sf_trade_value : player.trade_value;
    }
  }

  /**
   * calculate the player insights for a player
   * @param player
   * @param isSuperFlex
   */
  getPlayerInsights(player: FantasyPlayer, isSuperFlex: boolean = true): PlayerInsights {
    const dataSet = [];
    let high = 0;
    let low = 100;
    for (let weekNum = 1; weekNum < 19; weekNum++) {
      // push datapoint if exists for insights
      if (this.pastSeasonWeeklyStats[weekNum][player.sleeper_id] !== undefined
        && this.pastSeasonWeeklyStats[weekNum][player.sleeper_id].pts_half_ppr !== undefined) {
        // update high if weekly high
        if (this.pastSeasonWeeklyStats[weekNum][player.sleeper_id]?.pts_half_ppr > high) {
          high = this.pastSeasonWeeklyStats[weekNum][player.sleeper_id]?.pts_half_ppr;
        }
        // updated low if weekly low
        if (this.pastSeasonWeeklyStats[weekNum][player.sleeper_id]?.pts_half_ppr < low) {
          low = this.pastSeasonWeeklyStats[weekNum][player.sleeper_id]?.pts_half_ppr;
        }
        dataSet.push(this.pastSeasonWeeklyStats[weekNum][player.sleeper_id].pts_half_ppr);
      }
    }
    try {
      // calculate mean from data set
      const ptsMean = mean(dataSet);
      // calculate variance from data set
      const varPoint = variance(dataSet);
      // calculate standard deviation from data set
      const stdDev = standardDeviation(dataSet);
      // calculate point per value ratio
      const valuePointRatio = (isSuperFlex ? player.sf_trade_value : player.trade_value) / ptsMean;
      return {
        gamesPlayed: dataSet.length,
        mean: Math.round(ptsMean * 100) / 100,
        high,
        low,
        variance: Math.round(varPoint * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
        valuePerPointRatio: Math.round(valuePointRatio * 100) / 100
      };
    } catch (e: any) {
      console.warn('Could not generate player insight. ', e);
    }
  }

  /**
   * returns a list of player values excluding old draft picks and players
   * @param inputPlayers list of players and picks
   */
  cleanOldPlayerData(inputPlayers: FantasyPlayer[] = this.playerValues.slice()): FantasyPlayer[] {
    return inputPlayers.filter((player) => {
      if (player.position === 'PI') {
        return this.getCurrentPlayerValue(player, true) !== 0;
      } else {
        // return player if they have had a data point in the past 6 months
        const cutOffThreshold = new Date().getTime() - 1000 * 60 * 60 * 24 * 180;
        return new Date(player.most_recent_data_point).setHours(0, 0, 0, 0)
          >= new Date(cutOffThreshold).setHours(0, 0, 0, 0);
      }
    });
  }

  /**
   * return true if player1 is more valuable than player2
   * @param player1 player
   * @param player2 player
   * @param isSuperflex boolean
   */
  comparePlayersValue(player1: FantasyPlayer, player2: FantasyPlayer, isSuperflex: boolean = true): boolean {
    return isSuperflex ? player1.sf_trade_value > player2.sf_trade_value : player1.trade_value > player2.trade_value;
  }

  /**
   * returns the current index in the player values array
   * @param player1 player
   * @param isSuperflex boolean
   */
  getPlayersValueIndex(player1: FantasyPlayer, isSuperflex: boolean = true): number {
    const sortedList = isSuperflex ? this.playerValues.slice() :
      this.playerValues.sort((a, b) => b.trade_value - a.trade_value);
    return sortedList.findIndex(player => player.name_id === player1.name_id);
  }

  /**
   * returns a list of sorted players
   * @param players unsorted players list
   * @param isSuperFlex is league super flex
   * @param marketType enum fantasy market to sort on
   */
  sortListOfPlayers(players: FantasyPlayer[], isSuperFlex: boolean = true, marketType: FantasyMarket = this.selectedMarket): FantasyPlayer[] {
    return players.sort((playerA, playerB) => {
      return isSuperFlex ? playerB.sf_trade_value - playerA.sf_trade_value : playerB.trade_value - playerA.trade_value;
    });
  }

  /**
   * Returns an id for the player and fantasy platform passed in
   * @param player player to find
   * @param leaguePlatform fantasy platform id to find
   * @returns 
   */
  getPlayerPlatformId(player: FantasyPlayer, leaguePlatform: LeaguePlatform): string {
    switch (leaguePlatform) {
      case LeaguePlatform.MFL:
        return player.mfl_id;
      case LeaguePlatform.FLEAFLICKER:
        return player.ff_id;
      case LeaguePlatform.ESPN:
        return player.espn_id;
      default:
        return player.sleeper_id;
    }
  }

  /**
   * get player points by format from map of player stats
   * @param sleeperId player to find
   * @param formatString scoring format string
   */
  getPlayerPointsByFormat(sleeperId: string, formatString: string): number {
    return this.playerStats[sleeperId]?.[formatString];
  }

  /**
   * Get the player value from a datapoint
   * @param player player datapoint
   * @param isSuperflex boolean
   * @param marketType fantasy market type
   * @returns 
   */
  getValueFromDataPoint(player: FantasyPlayerDataPoint,
    isSuperflex: boolean = true,
    marketType: FantasyMarket = this.selectedMarket
  ): number {
    if (!player) return 0;
    switch (marketType) {
      case FantasyMarket.FantasyCalc:
        return !isSuperflex ? player.fc_trade_value : player.fc_sf_trade_value;
      case FantasyMarket.DynastyProcess:
        return !isSuperflex ? player.dp_trade_value : player.dp_sf_trade_value;
      default:
        return !isSuperflex ? player.trade_value : player.sf_trade_value;
    }
  }

  /**
   * fetch player values for all supported fantasy market
   * @returns array of dicts with player values
   */
  fetchTradeValuesForAllMarket(): Observable<{}[]> {
    const marketObservables = []
    for (let market = 0; market < 3; market++) {
      marketObservables.push(this.fantasyPlayerApiService.getPlayerValueForFantasyMarket(market as FantasyMarket))
    }
    return forkJoin(marketObservables);
  }
}
