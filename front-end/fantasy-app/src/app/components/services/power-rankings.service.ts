import { Injectable } from '@angular/core';
import { LeagueTeam } from '../../model/league/LeagueTeam';
import { FantasyMarket, FantasyPlayer } from '../../model/assets/FantasyPlayer';
import { PositionPowerRanking, TeamPowerRanking } from '../model/powerRankings';
import { LeagueService } from '../../services/league.service';
import { PlayerService } from '../../services/player.service';
import { Observable, of } from 'rxjs';
import { max, min } from 'simple-statistics';
import { MatchupService } from './matchup.service';
import { NflService } from '../../services/utilities/nfl.service';
import { EloService } from '../../services/utilities/elo.service';
import { LeagueType } from '../../model/league/LeagueDTO';
import { LeaguePlatform } from '../../model/league/FantasyPlatformDTO';
import { PowerRankingOrder } from '../power-rankings/power-rankings-chart/power-rankings-chart.component';

@Injectable({
  providedIn: 'root'
})
export class PowerRankingsService {

  constructor(private leagueService: LeagueService,
    public playerService: PlayerService,
    private matchupService: MatchupService,
    private eloService: EloService,
    private nflService: NflService
  ) {
  }

  /** team power rankings */
  powerRankings: TeamPowerRanking[] = [];

  /** supported position groups to power rank */
  positionGroups: string[] = ['QB', 'RB', 'WR', 'TE'];

  /** rankings metric options */
  rankingMetricsOptions: {}[] =
    [
      { 'value': 0, 'display': 'KeepTradeCut' },
      { 'value': 1, 'display': 'FantasyCalc' },
      { 'value': 2, 'display': 'ADP' }
    ]

  /** power rankings table filter options */
  powerRankingChartOption: PowerRankingOrder = PowerRankingOrder.OVERALL;

  /** rankings options */
  rankingMarket: PowerRankingMarket = PowerRankingMarket.KeepTradeCut;

  /**
   * Sorts team power rankings array by starter value
   */
  static sortOnStarterValue(teams: TeamPowerRanking[]): TeamPowerRanking[] {
    return teams.sort((teamA, teamB) => {
      return teamB.adpValueStarter - teamA.adpValueStarter;
    });
  }

  /**
   * determines which player has the higher value
   * @param player1
   * @param player2
   * @private
   */
  private static getBetterPlayer(player1: FantasyPlayer, player2: FantasyPlayer): FantasyPlayer {
    // flex te's aren't as valuable
    const teModifier = 3;
    if (player1 && player2) {
      const player1ADP = player1.position === 'TE' ? player1.avg_adp * teModifier : player1.avg_adp;
      const player2ADP = player2.position === 'TE' ? player2.avg_adp * teModifier : player2.avg_adp;
      if (player1ADP < player2ADP) {
        return player1.avg_adp === 0 ? player2 : player1;
      } else {
        return player2.avg_adp === 0 ? player1 : player2;
      }
    } else if (player1) {
      return player1;
    } else {
      return player2;
    }
  }

  mapPowerRankings(
    teams: LeagueTeam[],
    players: FantasyPlayer[],
    leaguePlatform: LeaguePlatform = LeaguePlatform.SLEEPER
  ): Observable<TeamPowerRanking[]> {
    if (this.powerRankings.length === 0) {
      this.generatePowerRankings(teams, players, leaguePlatform).subscribe(processedTeams => {
        this.powerRankings = processedTeams;
      });
    }
    return of(this.powerRankings);
  }

  /**
   * maps players to player platform id's on rosters
   * @param teams
   * @param players
   * @param leaguePlatform
   * @param isMockRankings boolean for trade calculator mock
   */
  generatePowerRankings(
    teams: LeagueTeam[],
    players: FantasyPlayer[],
    leaguePlatform: LeaguePlatform,
    isMockRankings: boolean = false
  ): Observable<TeamPowerRanking[]> {
    const newPowerRankings: TeamPowerRanking[] = [];
    try {
      teams?.map((team) => {
        const roster = [];
        let sfTradeValueTotal = 0;
        let tradeValueTotal = 0;
        let fcSfTradeValueTotal = 0;
        let fcTradeValueTotal = 0;
        // TODO refactor this section both comparisons are redundant
        for (const playerPlatformId of team?.roster?.players) {
          for (const player of players) {
            if (playerPlatformId === this.playerService.getPlayerPlatformId(player, leaguePlatform)) {
              roster.push(player);
              sfTradeValueTotal += player.sf_trade_value;
              tradeValueTotal += player.trade_value;
              fcSfTradeValueTotal += player.fc_sf_trade_value;
              fcTradeValueTotal += player.fc_trade_value;
              break;
            }
          }
        }
        const positionRoster: PositionPowerRanking[] = [];
        for (const group of this.positionGroups) {
          let sfTradeValue = 0;
          let tradeValue = 0;
          let fcSfTradeValue = 0;
          let fcTradeValue = 0;
          let groupList: FantasyPlayer[] = [];
          groupList = roster.filter(player => {
            if (player.position === group) {
              sfTradeValue += player.sf_trade_value;
              tradeValue += player.trade_value;
              fcSfTradeValue += player.fc_sf_trade_value;
              fcTradeValue += player.fc_trade_value;
              return player;
            }
          });
          positionRoster.push(new PositionPowerRanking(group, sfTradeValue, tradeValue, groupList, fcSfTradeValue, fcTradeValue));
        }
        const pickValues = players.filter(player => {
          return player.position === 'PI';
        });
        const picks: FantasyPlayer[] = [];
        let sfPickTradeValue = 0;
        let pickTradeValue = 0;
        let fcSfPickTradeValue = 0;
        let fcPickTradeValue = 0;
        if (this.leagueService.selectedLeague.type === LeagueType.DYNASTY) {
          team.futureDraftCapital.map(pick => {
            for (const pickValue of pickValues) {
              // TODO refactor this
              if (pickValue.last_name.includes(pick.round.toString()) && pickValue.first_name === pick.year) {
                if (pick.pick < 5 && pickValue.last_name.includes('Early')) {
                  sfPickTradeValue += pickValue.sf_trade_value;
                  pickTradeValue += pickValue.trade_value;
                  sfTradeValueTotal += pickValue.sf_trade_value;
                  tradeValueTotal += pickValue.trade_value;
                  fcSfPickTradeValue += pickValue.fc_sf_trade_value;
                  fcPickTradeValue += pickValue.fc_trade_value;
                  fcSfTradeValueTotal += pickValue.fc_sf_trade_value;
                  fcTradeValueTotal += pickValue.fc_trade_value;
                  picks.push(pickValue);
                  break;
                } else if (pick.pick > 8 && pickValue.last_name.includes('Late')) {
                  sfPickTradeValue += pickValue.sf_trade_value;
                  pickTradeValue += pickValue.trade_value;
                  sfTradeValueTotal += pickValue.sf_trade_value;
                  tradeValueTotal += pickValue.trade_value;
                  fcSfPickTradeValue += pickValue.fc_sf_trade_value;
                  fcPickTradeValue += pickValue.fc_trade_value;
                  fcSfTradeValueTotal += pickValue.fc_sf_trade_value;
                  fcTradeValueTotal += pickValue.fc_trade_value;
                  picks.push(pickValue);
                  break;
                } else if (pick.pick > 4 && pick.pick < 9 && pickValue.last_name.includes('Mid')) {
                  sfPickTradeValue += pickValue.sf_trade_value;
                  pickTradeValue += pickValue.trade_value;
                  sfTradeValueTotal += pickValue.sf_trade_value;
                  tradeValueTotal += pickValue.trade_value;
                  fcSfPickTradeValue += pickValue.fc_sf_trade_value;
                  fcPickTradeValue += pickValue.fc_trade_value;
                  fcSfTradeValueTotal += pickValue.fc_sf_trade_value;
                  fcTradeValueTotal += pickValue.fc_trade_value;
                  picks.push(pickValue);
                  break;
                }
              }
            }
          }
          );
        }
        const rankedPicks = new PositionPowerRanking('PI', sfPickTradeValue, pickTradeValue, picks, fcSfPickTradeValue, fcPickTradeValue);
        newPowerRankings.push(new TeamPowerRanking(team, positionRoster, sfTradeValueTotal, tradeValueTotal, rankedPicks, fcSfTradeValueTotal, fcTradeValueTotal));
      });
      this.rankTeams(newPowerRankings, this.leagueService.selectedLeague.isSuperflex);
    } catch (e: any) {
      console.error('Error Mapping League Data: ', e);
    }
    return of(newPowerRankings);
  }

  /**
   * sort position groups based on value
   * @param teams
   * @param isSuperflex
   */
  sortRosterByValue(teams: TeamPowerRanking[], isSuperflex: boolean): TeamPowerRanking[] {
    teams.map(team => {
      for (const group of team.roster) {
        group.players.sort((a, b) => {
          return this.playerService.getTradeValue(b, isSuperflex, this.playerService.selectedMarket) -
            this.playerService.getTradeValue(a, isSuperflex, this.playerService.selectedMarket);
        });
      }
      team.picks.players.sort((a, b) => {
        return this.playerService.getTradeValue(b, isSuperflex, this.playerService.selectedMarket) -
          this.playerService.getTradeValue(a, isSuperflex, this.playerService.selectedMarket);
      });
    });
    return teams;
  }

  /**
   * calculates and ranks teams based on trade value
   * @param teams
   * @param isSuperflex
   * @param isMockRankings
   */
  rankTeams(teams: TeamPowerRanking[], isSuperflex: boolean, isMockRankings: boolean = false): void {
    // Sort position groups and picks desc
    teams = this.sortRosterByValue(teams, isSuperflex);
    // Rank position groups
    this.positionGroups.forEach((value, index) => {
      this.rankingMetricsOptions.slice(0, 2).forEach((metric) => {
        teams.sort((teamA, teamB) => {
          return this.getPosGroupValue(teamB.roster[index], '', metric['value']) - this.getPosGroupValue(teamA.roster[index], '', metric['value']);
        });
        teams.forEach((team, teamIndex) => {
          switch (metric['value']) {
            case PowerRankingMarket.FantasyCalc:
              team.roster[index].fcRank = teamIndex + 1;
              break;
            default:
              team.roster[index].rank = teamIndex + 1;
          }
        });
      });
    });
    // Rank picks
    this.rankingMetricsOptions.slice(0, 2).forEach((metric) => {
      teams.sort((teamA, teamB) => {
        return this.getPosGroupValue(teamB.picks, '', metric['value']) - this.getPosGroupValue(teamA.picks, '', metric['value']);
      });
      teams.forEach((team, teamIndex) => {
        switch (metric['value']) {
          case PowerRankingMarket.FantasyCalc:
            team.picks.fcRank = teamIndex + 1;
            break;
          default:
            team.picks.rank = teamIndex + 1;
        }
      });
    });
    // calculate best starting lineup
    this.calculateADPValue(teams);
    // calculate elo adjusted ADP starter rank if matchups loaded properly
    if (this.matchupService.leagueMatchUpUI.length !== 0 && !isMockRankings) {
      teams = this.calculateEloAdjustedADPValue(teams);
    }
    // Rank starting lineups
    teams = PowerRankingsService.sortOnStarterValue(teams);
    teams.forEach((team, index) => {
      team.starterRank = index + 1;
    });
    // rank overall points
    this.rankingMetricsOptions.slice(0, 2).forEach((metric) => {
      teams.sort((teamA, teamB) => {
        switch (metric['value']) {
          case PowerRankingMarket.FantasyCalc:
            return !this.leagueService.selectedLeague.isSuperflex ? teamB.fcTradeValueOverall - teamA.fcTradeValueOverall: teamB.fcSfTradeValueOverall - teamA.fcSfTradeValueOverall;     
          default:
            return !this.leagueService.selectedLeague.isSuperflex ? teamB.tradeValueOverall - teamA.tradeValueOverall: teamB.sfTradeValueOverall - teamA.sfTradeValueOverall;    
        }
      });
      teams.forEach((team, teamIndex) => {
        switch (metric['value']) {
          case PowerRankingMarket.FantasyCalc:
            team.fcOverallRank = teamIndex + 1;
            break;
          default:
            team.overallRank = teamIndex + 1;
        }
      });
    });
    this.setTeamTiers(teams, isSuperflex);
  }

  /**
   * Handles calculating ADP starter rank for all rosters
   */
  calculateADPValue(teams: TeamPowerRanking[]): void {
    const positionGroupCount: number[] = [];
    for (const pos of this.positionGroups) {
      positionGroupCount.push(this.getCountForPosition(pos));
    }
    positionGroupCount.push(this.getCountForPosition('FLEX'));
    positionGroupCount.push(this.getCountForPosition('SUPER_FLEX'));
    let worstTeamStarterValue: number = 0;
    teams.map(team => {
      let teamRosterCount: number[] = positionGroupCount.slice();
      if (teamRosterCount[0] > 0) // qb
      {
        const adpSortedQBs = this.sortPlayersByADP(team.roster[0].players);
        team.starters.push(...this.getHealthyPlayersFromList(adpSortedQBs, teamRosterCount[0]));
      }
      if (teamRosterCount[1] > 0) // rb
      {
        const adpSortedRBs = this.sortPlayersByADP(team.roster[1].players);
        team.starters.push(...this.getHealthyPlayersFromList(adpSortedRBs, teamRosterCount[1]));
      }
      if (teamRosterCount[2] > 0) // wr
      {
        const adpSortedWRs = this.sortPlayersByADP(team.roster[2].players);
        team.starters.push(...this.getHealthyPlayersFromList(adpSortedWRs, teamRosterCount[2]));
      }
      if (teamRosterCount[3] > 0) // te
      {
        const adpSortedTEs = this.sortPlayersByADP(team.roster[3].players);
        team.starters.push(...this.getHealthyPlayersFromList(adpSortedTEs, teamRosterCount[3]));
      }
      if (teamRosterCount[4] > 0) // flex
      {
        teamRosterCount = this.getBestAvailableFlex(teamRosterCount[4], teamRosterCount, team);
      }
      if (teamRosterCount[5] > 0) // sflex
      {
        const adpSortedQBs = this.sortPlayersByADP(team.roster[0].players);
        const superFlexQB = this.getHealthyPlayersFromList(adpSortedQBs, 1, team.starters);
        if (superFlexQB.length > 0) {
          team.starters.push(...superFlexQB);
          teamRosterCount[0]++;
        } else {
          teamRosterCount = this.getBestAvailableFlex(teamRosterCount[5], teamRosterCount, team);
        }
      }
      for (const starter of team.starters) {
        team.adpValueStarter = Math.round(team.adpValueStarter + (starter.avg_adp || 100));
        worstTeamStarterValue = Math.max(worstTeamStarterValue, team.adpValueStarter);
      }
    });
    teams.map(team => {
      team.adpValueStarter = (worstTeamStarterValue * 2) - team.adpValueStarter + 500;
      team.eloAdpValueStarter = team.adpValueStarter;
    });
  }

  /**
   * Sort a list of players by Average ADP
   * @param players
   */
  sortPlayersByADP(players: FantasyPlayer[]): FantasyPlayer[] {
    return players.slice().sort((a, b) => (a.avg_adp || 100) - (b.avg_adp || 100));
  }

  /**
   * Calculate each teams elo adjusted adp stater rating
   * @param teams teams to calculate elo for
   * @param endWeek current week to evaluate elo to
   */
  calculateEloAdjustedADPValue(
    teams: TeamPowerRanking[] = this.powerRankings,
    endWeek: number = this.nflService.getCompletedWeekForSeason(this.leagueService?.selectedLeague?.season)
  ): TeamPowerRanking[] {
    // handles 0 case
    if (endWeek <= this.leagueService.selectedLeague.startWeek - 1) {
      teams.forEach((team) => {
        team.eloAdpValueStarter = team.adpValueStarter;
        team.eloAdpValueChange = 0;
      });
      return teams;
    }
    // TODO find a better way to verify the match ups are mapped
    // map roster ids to indexes and reset elo
    const rosterIdMap = {};
    // start week modifier for leagues that didn't start week 1
    const startWeekMod = this.leagueService.selectedLeague.startWeek - 1;
    teams.forEach((team, ind) => {
      rosterIdMap[team.team.roster.rosterId] = ind;
      team.eloAdpValueStarter = team.eloADPValueStarterHistory.length > 0 ?
        team.eloADPValueStarterHistory[endWeek - startWeekMod] : team.adpValueStarter;
      team.eloAdpValueChange = team.eloADPValueStarterHistory.length > 0 ?
        (team.eloADPValueStarterHistory[endWeek - startWeekMod]) -
        (team.eloADPValueStarterHistory[endWeek - startWeekMod - 1] || team.adpValueStarter) : 0;
    });
    // if already calculated then use cache
    return teams[0].eloADPValueStarterHistory.length > 0 ? teams :
      this.initializeEloADPValueStarterHistory(teams, endWeek, rosterIdMap);
  }

  /**
   * Generates elo history map in object if it does not already exist
   * @param teams teams to generate map for
   * @param endWeek week to stop at
   * @param rosterIdMap map of match up to team
   * @private
   */
  private initializeEloADPValueStarterHistory(teams: TeamPowerRanking[], endWeek: number, rosterIdMap: {}): TeamPowerRanking[] {
    teams.forEach(team => {
      team.eloADPValueStarterHistory.push(team.eloAdpValueStarter);
    });
    for (let i = 0; i < endWeek - (this.leagueService.selectedLeague.startWeek - 1); i++) {
      // process this weeks match ups and set new elo
      this.matchupService.leagueMatchUpUI[i]?.forEach(matchUp => {
        const kValue = Math.max(10, Math.min(40, Math.round(Math.abs(matchUp.team1Points - matchUp.team2Points))));
        const newRatings = this.eloService.eloRating(
          teams[rosterIdMap[matchUp.team1RosterId]].eloAdpValueStarter,
          teams[rosterIdMap[matchUp.team2RosterId]].eloAdpValueStarter,
          kValue,
          matchUp.team1Points > matchUp.team2Points
        );
        // calculate change in elo
        teams[rosterIdMap[matchUp.team1RosterId]].eloAdpValueChange =
          Math.round(newRatings[0]) - teams[rosterIdMap[matchUp.team1RosterId]].eloAdpValueStarter;
        teams[rosterIdMap[matchUp.team2RosterId]].eloAdpValueChange =
          Math.round(newRatings[1]) - teams[rosterIdMap[matchUp.team2RosterId]].eloAdpValueStarter;
        // set new elo values
        teams[rosterIdMap[matchUp.team1RosterId]].eloAdpValueStarter = Math.round(newRatings[0]);
        teams[rosterIdMap[matchUp.team2RosterId]].eloAdpValueStarter = Math.round(newRatings[1]);
        teams[rosterIdMap[matchUp.team1RosterId]].eloADPValueStarterHistory.push(Math.round(newRatings[0]));
        teams[rosterIdMap[matchUp.team2RosterId]].eloADPValueStarterHistory.push(Math.round(newRatings[1]));
      });
      // handles bye weeks in playoffs
      teams.forEach(team => {
        if (team.eloADPValueStarterHistory.length === i + 1) {
          team.eloAdpValueChange = 0;
          team.eloADPValueStarterHistory.push(team.eloAdpValueStarter);
        }
      });
    }
    return teams;
  }

  /**
   * Determine what the tier bins are and assign teams a tier
   * @param teams
   * @param isSuperflex is league superflex
   * @private
   */
  private setTeamTiers(teams: TeamPowerRanking[], isSuperflex: boolean): void {
    const groups = [];
    // create a map of all starter rankings for teams
    const ratings = teams.map(team => {
      return team.adpValueStarter;
    });
    // get min rating
    const minRating = min(ratings);
    // get max rating
    const maxRating = max(ratings);
    // determine number of bins
    const binCount = Math.ceil(Math.sqrt(ratings.length));
    // calculate the bin width
    const binWidth = (maxRating - minRating) / binCount;
    // set up loop with floor & ceiling
    let binFloor = minRating;
    let binCeiling = minRating + binWidth;
    // loop through teams and determine each group
    for (let groupInd = 0; groupInd < binCount; groupInd++) {
      const newGroup = [];
      teams.forEach((team) => {
        if (team?.adpValueStarter >= binFloor && team?.adpValueStarter < binCeiling) {
          newGroup?.push(team);
        }
      });
      // after checking each team push group and set up next group
      groups.push(newGroup);
      binFloor = binCeiling;
      binCeiling += binWidth + 1;
    }

    // assign tier based on grouping
    groups.reverse().map((group, ind) => {
      // set super team if criteria is met
      if (group.length === 1 && ind === 0) {
        group[0].tier = ind;
        // set trust the process if criteria is met
      } else if (group.length === 1 && ind === groups.length - 1) {
        group[0].tier = 5;
      } else {
        group.map((team) => {
          team.tier = ind + 1;
        });
      }
    }
    );
  }

  /**
   * return list of healthy players from list
   * @param players list of players to choose from
   * @param numberOfPlayer number of players to choose
   * @param excludedPlayers players to exclude from search
   * @param excludedStatus injury status to exclude from active
   * @private
   */
  private getHealthyPlayersFromList(
    players: FantasyPlayer[],
    numberOfPlayer: number,
    excludedPlayers: FantasyPlayer[] = [],
    excludedStatus: string[] = ['PUP', 'IR', 'Sus', 'COV']
  ): FantasyPlayer[] {
    const activePlayers = [];
    players.map(player => {
      if (!excludedStatus.includes(player.injury_status) && activePlayers.length < numberOfPlayer && !excludedPlayers.includes(player)) {
        activePlayers.push(player);
      }
    });
    return activePlayers;
  }

  /**
   * determines the best available flex option for team by adp
   * @param spots
   * @param teamRosterCount
   * @param team
   * @private
   */
  private getBestAvailableFlex(spots: number, teamRosterCount: number[], team: TeamPowerRanking): number[] {
    // create clone for tracking flex
    const processedPlayers = teamRosterCount.slice();

    // selected player count
    let selectedCount = 0;

    // loop and get best flex option
    for (let i = 0; selectedCount < spots; i++) {
      const topRb = this.sortPlayersByADP(team.roster[1]?.players)[processedPlayers[1]];
      const topWr = this.sortPlayersByADP(team.roster[2]?.players)[processedPlayers[2]];
      const topTe = this.sortPlayersByADP(team.roster[3]?.players)[processedPlayers[3]];
      const flexPlayer = PowerRankingsService.getBetterPlayer(topTe, PowerRankingsService.getBetterPlayer(topRb, topWr));
      // if no player is found return
      if (!flexPlayer) {
        return teamRosterCount;
      }
      processedPlayers[this.positionGroups.indexOf(flexPlayer.position)]++;
      const activeFlex = this.getHealthyPlayersFromList([flexPlayer], 1, team.starters);
      if (activeFlex.length > 0) {
        team.starters.push(flexPlayer);
        teamRosterCount[this.positionGroups.indexOf(flexPlayer.position)]++;
        selectedCount++;
      }
    }
    return teamRosterCount;
  }

  /**
   * calculates the number of starter positions by position in league
   * @param position
   * @private
   */
  private getCountForPosition(position: string): number {
    return this.leagueService.selectedLeague.rosterPositions.filter(x => x === position).length;
  }

  /**
   * resets power rankings
   */
  reset(): void {
    this.powerRankings = [];
  }

  /**
   * gets rankings by team
   * @param rosterId selected roster id
   */
  findTeamFromRankingsByRosterId(rosterId: number): TeamPowerRanking {
    for (const team of this.powerRankings) {
      if (team.team.roster.rosterId === rosterId) {
        return team;
      }
    }
    return null;
  }

  /**
   * gets rankings by team
   * @param rosterId selected roster id
   */
  findTeamFromRankingsByUserId(userId: string): TeamPowerRanking {
    for (const team of this.powerRankings) {
      if (team.team.roster.ownerId === userId) {
        return team;
      }
    }
    return null;
  }

  /**
   * Fetch Team array if not top 20%
   * @param rosterId teams roster id
   * @returns 
   */
  getTeamNeedsFromRosterId(rosterId: number): string[] {
    const teamNeeds = [];
    const team = this.findTeamFromRankingsByRosterId(rosterId);
    team.roster.slice().sort((a,b) => b.rank - a.rank).forEach(pos => {
      if (pos.rank > this.powerRankings.length * .35) {
        teamNeeds.push(pos.position);
      }
    });

    return teamNeeds;
  }

  /**
   * get position group value based on settings
   * @param group 
   * @param metric 
   * @param selectedMarket
   * @returns 
   */
  getPosGroupValue(group: PositionPowerRanking, metric: string = '', selectedMarket: FantasyMarket = this.playerService.selectedMarket): number {
    switch (selectedMarket) {
      case FantasyMarket.FantasyCalc:
        if (metric === 'rank') {
          return group.fcRank;
        }
        return !this.leagueService.selectedLeague.isSuperflex ?
          group.fcTradeValue : group.fcSfTradeValue;
      default:
        if (metric === 'rank') {
          return group.rank;
        }
        return !this.leagueService.selectedLeague.isSuperflex ?
          group.tradeValue : group.sfTradeValue;
    }
  }

  /**
   * get power rankings value based on settings
   * @param team 
   * @param metric
   * @param selectedMarket
   * @returns 
   */
  getTeamPowerRankingValue(team: TeamPowerRanking, metric: string = '', selectedMarket: FantasyMarket = this.playerService.selectedMarket): number {
    switch (selectedMarket) {
      case FantasyMarket.FantasyCalc:
        if (metric === 'rank') {
          return team.fcOverallRank;
        }
        return !this.leagueService.selectedLeague.isSuperflex ?
          team.fcTradeValueOverall : team.fcSfTradeValueOverall;
      default:
        if (metric === 'rank') {
          return team.overallRank;
        }
        return !this.leagueService.selectedLeague.isSuperflex ?
          team.tradeValueOverall : team.sfTradeValueOverall
    }
  }
}

export enum PowerRankingMarket {
  KeepTradeCut,
  FantasyCalc,
  ADP
}
