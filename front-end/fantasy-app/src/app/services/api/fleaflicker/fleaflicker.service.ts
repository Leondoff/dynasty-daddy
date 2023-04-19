import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, mergeMap, concatMap, delay, retry, catchError } from 'rxjs/operators';
import { LeagueWrapper } from '../../../model/league/LeagueWrapper';
import { FleaflickerApiService } from './fleaflicker-api.service';
import { LeagueOwnerDTO } from '../../../model/league/LeagueOwnerDTO';
import { LeagueTeam } from '../../../model/league/LeagueTeam';
import { LeagueRosterDTO } from '../../../model/league/LeagueRosterDTO';
import { LeagueTeamMatchUpDTO } from '../../../model/league/LeagueTeamMatchUpDTO';
import { TeamMetrics } from '../../../model/league/TeamMetrics';
import { LeagueTeamTransactionDTO, TransactionStatus } from '../../../model/league/LeagueTeamTransactionDTO';
import { LeagueRawTradePicksDTO } from '../../../model/league/LeagueRawTradePicksDTO';
import { LeagueDTO, LeagueType } from '../../../model/league/LeagueDTO';
import { FantasyPlatformDTO, LeaguePlatform } from '../../../model/league/FantasyPlatformDTO';
import { DraftCapital } from '../../../model/assets/DraftCapital';
import { LeagueUserDTO } from 'src/app/model/league/LeagueUserDTO';
import { Status } from 'src/app/components/model/status';

@Injectable({
  providedIn: 'root'
})
export class FleaflickerService {

  /** default flea flicker icon if team has no icon */
  private DEFAULT_TEAM_LOGO = 'https://apprecs.org/ios/images/app-icons/256/3a/1259897658.jpg';

  /** player id map for players found in apis */
  playerIdMap = {}

  constructor(private fleaflickerApiService: FleaflickerApiService) {
  }

  /**
   * Load fleaflicker users
   * @param username email string
   * @param year season to load
   * @returns 
   */
  loadFleaflickerUser$(username: string, year: string): Observable<FantasyPlatformDTO> {
    return this.fleaflickerApiService.getFFUserLeagues(year, username).pipe(map(response => {
      if (response == null) {
        console.warn('User data could not be found. Try again!');
        return null;
      }
      const userData = new LeagueUserDTO()
      userData.username = username;

      const leagues = []
      response.leagues.forEach(league => {
        const newLeague = new LeagueDTO()
        newLeague.leagueId = league.id
        newLeague.name = league?.name;
        newLeague.leaguePlatform = LeaguePlatform.FLEAFLICKER;
        newLeague.metadata['teamId'] = league?.ownedTeam?.id;
        newLeague.metadata['status'] = Status.LOADING;
        leagues.push(newLeague);
      })
      return { leagues, userData, leaguePlatform: LeaguePlatform.FLEAFLICKER }
    }));
  }

  /**
   * returns Load league observable from flea flicker league id and year
   * @param year string
   * @param leagueId string
   */
  loadLeagueFromId$(year: string, leagueId: string): Observable<LeagueDTO> {
    return this.fleaflickerApiService.getFFLeagueStandings(year, leagueId).pipe(map((leagueInfo) => {
      return this.fromFleaflickerLeague(leagueInfo);
    }));
  }

  /**
   * Loads flea flicker league and populates league wrapper object to return via observable
   * TODO clean up to not use variables and fork join
   * @param leagueWrapper new league wrapper object
   */
  loadLeague$(leagueWrapper: LeagueWrapper): Observable<LeagueWrapper> {
    const observableList = [];
    let fleaflickerRosters = [];
    let leagueTransactions = {};
    const teamDraftCapitalMap = {};
    const leagueSchedule = {};
    const isPlayoffs = [];
    const season = leagueWrapper.selectedLeague.season;
    const leagueId = leagueWrapper.selectedLeague.leagueId;
    observableList.push(this.fleaflickerApiService.getFFRosters(season, leagueId).pipe(map(rosters => {
      fleaflickerRosters = rosters.rosters;
      return of(fleaflickerRosters);
    })));
    for (let i = 0; i < 3; i++) {
      observableList.push(this.fleaflickerApiService.getFFTransactions(leagueId, (i * 30).toString()).pipe(map(transactions => {
        leagueTransactions[i + 1] = this.marshalTransactions(transactions.items);
        return of(leagueTransactions[i + 1]);
      })));
    }
    for (let i = 0; i < 3; i++) {
      observableList.push(this.fleaflickerApiService.getFFTrades(season, leagueId, (i * 10).toString()).pipe(map(trades => {
        leagueTransactions[4 + i] = this.marshalTrades(trades.trades);
        return of(leagueTransactions[4 + i]);
      })));
    }
    // get future draft picks
    leagueWrapper.selectedLeague.metadata.rosters.forEach(division => {
      division.teams.forEach(team => {
        observableList.push(this.fleaflickerApiService.getFFFutureDraftPicks(season, leagueId, team.id).pipe(map(draftPicks => {
          teamDraftCapitalMap[team.id] = this.marshalDraftPicks(draftPicks.picks, team.id);
          return of(teamDraftCapitalMap);
        })));
      });
    });
    // generate schedule
    for (let i = 1; i <= 17; i++) {
      observableList.push(this.fleaflickerApiService.getFFSchedules(season, leagueId, i.toString()).pipe(map(scores => {
        leagueWrapper.selectedLeague.startWeek = scores.eligibleSchedulePeriods[0]?.value || 1;
        isPlayoffs[i] = !scores.games || scores.games[0]?.isPlayoffs;
        leagueSchedule[i] = this.marshalWeekSchedule(scores);
        return of(leagueSchedule)
      })));
    }
    return forkJoin(observableList).pipe(map(() => {
      leagueWrapper.selectedLeague.leagueMatchUps = leagueSchedule;
      leagueWrapper.selectedLeague.leagueTransactions = leagueTransactions;
      leagueWrapper.selectedLeague.playoffRoundType = 1;
      leagueWrapper.selectedLeague.playoffStartWeek = isPlayoffs.findIndex(it => it === true) > -1 ? isPlayoffs.findIndex(it => it === true) : 17;
      const teams = [];
      leagueWrapper.selectedLeague.metadata.rosters?.forEach((division, ind) => {
        division.teams?.forEach(team => {
          const ddTeam = new LeagueTeam(null, null);
          const owner = team.owners[0];
          ddTeam.owner = new LeagueOwnerDTO(owner.id, owner.displayName, team.name, team.logoUrl || this.DEFAULT_TEAM_LOGO);
          const roster = fleaflickerRosters.find(it => it.team.id === team.id).players;
          // TODO put in a funtion to reuse
          this.mapFleaFlickerIdMap(roster);
          ddTeam.roster = new LeagueRosterDTO(
            team.id,
            owner.id,
            roster?.map(player => player.proPlayer.id.toString()),
            null,
            null,
            new TeamMetrics(null)
          );
          // index in the division array so we want 0 to be default
          ddTeam.roster.teamMetrics.division = leagueWrapper.selectedLeague.divisions > 1 ?
            leagueWrapper.selectedLeague.divisionNames.findIndex(it => it === division.name) + 1 : 1;
          ddTeam.roster.teamMetrics.fpts = Number(team.pointsFor?.value || 0);
          ddTeam.roster.teamMetrics.ppts = Number(team.pointsFor?.value || 0);
          ddTeam.roster.teamMetrics.fptsAgainst = Number(team.pointsAgainst?.value || 0);
          ddTeam.roster.teamMetrics.waiverPosition = Number(team.waiverPosition || 0);
          ddTeam.roster.teamMetrics.wins = Number(team.recordOverall?.wins || 0);
          ddTeam.roster.teamMetrics.losses = Number(team.recordOverall?.losses || 0);
          ddTeam.roster.teamMetrics.rank = Number(team.recordOverall?.rank || 0);
          ddTeam.futureDraftCapital = teamDraftCapitalMap[ddTeam.roster.rosterId] || [];
          teams.push(ddTeam);
        });
      });
      leagueWrapper.leagueTeamDetails = teams;
      leagueWrapper.selectedLeague.playoffTeams = 6; // TODO how to determine this
      return leagueWrapper;
    }));
  }

  /**
   * Fetch all leagues for user and load rosters
   * This is used for the portfolio functionality
   * @param email string
   * @param year string
   * @returns 
   */
  fetchAllLeaguesForUser$(email: string, year: string): Observable<FantasyPlatformDTO> {
    return this.loadFleaflickerUser$(email, year).pipe(
      mergeMap(leagueUser => {
        if (leagueUser?.leagues?.length > 20) {
          return of(leagueUser);
        } else {
          return this.loadLeagueFromList$(leagueUser.leagues, year).pipe(concatMap(leagues => {
            leagueUser.leagues = leagues;
            return of(leagueUser);
          }));
        };
      })
    );
  }

  /**
   * Loads leagues from a list of leagues
   * @param leagues league list
   * @param year selected year string
   * @returns 
   */
  loadLeagueFromList$(leagues: LeagueDTO[], year: string): Observable<LeagueDTO[]> {
    const observableList = leagues.map(league => {
      return this.loadLeagueFromId$(year, league.leagueId).pipe(concatMap(leagueInfo => {
        return this.fleaflickerApiService.getFFRosters(year, league.leagueId).pipe(
          retry(2),
          catchError(error => {
            console.error('Failed to fetch data:', error);
            return of([]);
          }),
          concatMap(rosters => {
            league.metadata['status'] = Status.DONE;
            const roster = rosters.rosters.find(it => it.team.id === league?.metadata?.teamId)?.players;
            this.mapFleaFlickerIdMap(roster);
            league.metadata['roster'] = roster?.map(player => player.proPlayer.id.toString());
            league.isSuperflex = leagueInfo.isSuperflex;
            league.rosterPositions = leagueInfo.rosterPositions;
            league.totalRosters = leagueInfo.totalRosters;
            league.scoringFormat = leagueInfo.scoringFormat;
            league.type = leagueInfo.type;
            return of(league).pipe(delay(1000));
          })
        );
      }));
    })
    return forkJoin(observableList).pipe(concatMap(() => of(leagues).pipe(delay(1000))));
  }

  /**
 * helper function that will format json league response into League Data
 * @param leagueInfo league info json blob
 * @param year season
 */
  fromFleaflickerLeague(leagueInfo: any): LeagueDTO {
    const divisions: string[] = [...new Set<string>(leagueInfo?.divisions?.map(division => division?.name))] || [];
    const rosterSize = Number(leagueInfo.league?.rosterRequirements?.rosterSize) + (Number(leagueInfo.league?.rosterRequirements?.reserveCount) || 0);
    const roster = this.generateRosterPositions(leagueInfo.league.rosterRequirements)
    const ffLeague = new LeagueDTO().setLeague(
      roster.includes('SUPER_FLEX'),
      leagueInfo.league.name,
      leagueInfo.league.id,
      leagueInfo.league.size,
      roster,
      leagueInfo.league.id || null,
      leagueInfo.season === new Date().getFullYear() ? 'in_progress' : 'completed',
      leagueInfo.season.toString(),
      null,
      null,
      null,
      LeaguePlatform.FLEAFLICKER);
    ffLeague.rosterSize = rosterSize;
    ffLeague.divisionNames = divisions;
    ffLeague.divisions = leagueInfo.divisions.length;
    ffLeague.startWeek = Number(leagueInfo.startWeek) || 1; // TODO figure out how that is determined
    ffLeague.type = leagueInfo.league?.maxKeepers > 0 ? LeagueType.DYNASTY : LeagueType.REDRAFT;
    ffLeague.draftRounds = 5; // TODO figure out the right way
    ffLeague.medianWins = false; // TODO figure out how that is determined
    ffLeague.metadata = {
      rosters: leagueInfo.divisions
    };
    return ffLeague;
  }

  /**
   * Format roster positions from roster api
   * @param roster roster from api
   * @returns 
   */
  private generateRosterPositions(roster: any): string[] {
    const positionMap = [];
    const validStartersList = ['QB', 'RB', 'WR', 'TE', 'RB/WR/TE', 'QB/RB/WR/TE'];
    (roster?.positions as any[]).filter(pos => pos?.group === 'START' && validStartersList.includes(pos?.label)).forEach(pos => {
      for (let i = 0; i < pos?.start; i++) {
        let posLabel = pos?.label;
        if (posLabel === 'RB/WR/TE') posLabel = 'FLEX';
        if (posLabel === 'QB/RB/WR/TE') posLabel = 'SUPER_FLEX';
        positionMap.push(posLabel)
      }
    });
    for (let i = 0; i < roster?.benchCount || 0; i++) {
      positionMap.push('BN');
    }
    return positionMap;
  }

  /**
   * Marshal transactions into usable format
   * @param transactions transactions from api
   * @returns 
   */
  marshalTransactions(transactions: any[]): LeagueTeamTransactionDTO[] {
    const transactionList = [];
    let i = 0;
    if (!transactions || transactions.length === 0) return transactionList;
    while (i < transactions.length) {
      let trans = new LeagueTeamTransactionDTO(null, []);
      const currentRosterId = transactions[i]?.transaction?.team?.id
      const timestamp = transactions[i].timeEpochMilli
      do {
        const playerInfo = transactions[i].transaction.player;
        if (playerInfo && playerInfo.proPlayer) {
          this.mapFleaFlickerIdMap([playerInfo])
          transactions[i].transaction.type === 'TRANSACTION_DROP' ?
            trans.drops[playerInfo.proPlayer.id] = currentRosterId :
            trans.adds[playerInfo.proPlayer.id] = currentRosterId;
          trans.rosterIds = [currentRosterId]
          trans.transactionId = transactions[i].timeEpochMilli;
          trans.status = TransactionStatus.COMPLETED;
          trans.createdAt = Number(timestamp);
          trans.type = "waiver";
          transactionList.push(trans)
        }
        i++
      } while (
        i < transactions.length &&
        currentRosterId === transactions[i]?.transaction?.team?.id &&
        timestamp === transactions[i].timeEpochMilli
      )
    }
    return transactionList;
  }

  /**
   * marshal draft picks into usable format
   * @param teamDraftPicks team picks from api
   * @returns 
   */
  private marshalDraftPicks(teamDraftPicks: any[], teamId: number): DraftCapital[] {
    const teamDraftCapital = [];
    teamDraftPicks.forEach(rawPick => {
      if (rawPick.ownedBy.id == teamId) {
        teamDraftCapital.push(new DraftCapital(rawPick.slot.round, rawPick.slot.slot, rawPick?.season?.toString(), rawPick?.originalOwner?.id || rawPick?.ownedBy?.id));
      }
    });
    return teamDraftCapital;
  }

  /**
   * marshal trades into usable format
   * @param trades trades from api
   * @returns 
   */
  private marshalTrades(trades: any[]): LeagueTeamTransactionDTO[] {
    const leagueTrades = [];
    trades?.forEach(trade => {
      let trans = new LeagueTeamTransactionDTO(null, []);
      trans.transactionId = trade?.id || 'not provided';
      trans.type = 'trade';
      trans.status = TransactionStatus.COMPLETED;
      trans.createdAt = Number(trade?.approvedOn) || Number(trade?.proposedOn)

      const team1Id = trade.teams[0].team.id;
      const team2Id = trade.teams[1].team.id;
      trans.rosterIds = [team1Id, team2Id];

      trade.teams[0]?.playersObtained?.forEach(player => {
        trans.adds[player?.proPlayer?.id] = team1Id;
        trans.drops[player?.proPlayer?.id] = team2Id;
        this.mapFleaFlickerIdMap([player]);
      });

      trade.teams[0]?.picksObtained?.forEach(pick => {
        trans.draftpicks.push(new LeagueRawTradePicksDTO(team1Id,
          pick.originalOwner?.id || team2Id,
          team1Id,
          pick.slot.round,
          pick.season.toString()));
      });

      trade.teams[1]?.playersObtained?.forEach(player => {
        trans.adds[player?.proPlayer?.id] = team2Id;
        trans.drops[player?.proPlayer?.id] = team1Id;
        this.mapFleaFlickerIdMap([player]);
      });

      trade.teams[1]?.picksObtained?.forEach(pick => {
        trans.draftpicks.push(new LeagueRawTradePicksDTO(team2Id,
          pick.originalOwner?.id || team1Id,
          team2Id,
          pick.slot.round,
          pick.season.toString()));
      });

      leagueTrades.push(trans);
    });
    return leagueTrades;
  }

  /**
   * Marshal schedule to usable format
   * @param scores scoreboard for week from api
   * @returns 
   */
  private marshalWeekSchedule(scores: any): LeagueTeamMatchUpDTO[] {
    const week = Number(scores.schedulePeriod.value);
    let teamMatchUps = [];
    if (!scores.games) {
      console.warn(`No games found for week ${week} in fleaflicker.`)
      return [];
    }
    const games = scores.games[0]?.isPlayoffs ? scores.games.filter(game => game.isPlayoffs === true) : scores.games;
    games.forEach(game => {
      teamMatchUps = teamMatchUps.concat(...this.marshalIndividualMatchUp(game));
    });
    return teamMatchUps;
  }

  /**
   * marshal matchup into usable format
   * @param game individual game
   * @returns 
   */
  private marshalIndividualMatchUp(game: any): LeagueTeamMatchUpDTO[] {
    const matchUpTeamHome = new LeagueTeamMatchUpDTO();
    matchUpTeamHome.createMatchUpObject(Number(game.id), game?.homeScore?.score?.value || Number(game?.homeScore?.score?.formatted), Number(game.home.id));
    const matchUpTeamAway = new LeagueTeamMatchUpDTO();
    matchUpTeamAway.createMatchUpObject(Number(game.id), game?.awayScore?.score?.value || Number(game?.awayScore?.score?.formatted), Number(game.away.id));
    return [matchUpTeamAway, matchUpTeamHome];
  }

  /**
   * Format player id map since flea flicker doesn't have an api
   * @param playerList list of players to add
   */
  private mapFleaFlickerIdMap(playerList: any[]): void {
    playerList?.forEach(player => {
      if (player && player.proPlayer) {
        this.playerIdMap[player.proPlayer.id.toString()] = {
          full_name: player.proPlayer.nameFull,
          position: player.proPlayer.position,
          short_name: player.proPlayer.nameShort,
          team: player?.proPlayer?.proTeamAbbreviation || 'FA',
        }
      }
    });
  }
}
