import {Injectable} from '@angular/core';
import {forkJoin, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {LeagueWrapper} from '../../../model/league/LeagueWrapper';
import {MflApiService} from './mfl-api.service';
import {LeagueOwnerDTO} from '../../../model/league/LeagueOwnerDTO';
import {LeagueTeam} from '../../../model/league/LeagueTeam';
import {LeagueCompletedPickDTO} from '../../../model/league/LeagueCompletedPickDTO';
import {LeagueRosterDTO} from '../../../model/league/LeagueRosterDTO';
import {LeaguePlayoffMatchUpDTO} from '../../../model/league/LeaguePlayoffMatchUpDTO';
import {LeagueTeamMatchUpDTO} from '../../../model/league/LeagueTeamMatchUpDTO';
import {LeagueRawDraftOrderDTO} from '../../../model/league/LeagueRawDraftOrderDTO';
import {TeamMetrics} from '../../../model/league/TeamMetrics';
import {LeagueTeamTransactionDTO, TransactionStatus} from '../../../model/league/LeagueTeamTransactionDTO';
import {LeagueRawTradePicksDTO} from '../../../model/league/LeagueRawTradePicksDTO';
import {LeagueDTO, LeagueType} from '../../../model/league/LeagueDTO';
import {LeaguePlatform} from '../../../model/league/FantasyPlatformDTO';
import {CompletedDraft} from '../../../model/league/CompletedDraft';
import {DraftCapital} from '../../../model/assets/DraftCapital';

@Injectable({
  providedIn: 'root'
})
export class MflService {

  private DEFAULT_TEAM_LOGO = 'http://myfantasyleague.com/images/mfl_logo/updates/new_mfl_logo_80x80.gif';

  constructor(private mflApiService: MflApiService) {
  }

  /**
   * returns Load league observable from mfl league id and year
   * @param year string
   * @param leagueId string
   */
  loadLeagueFromId$(year: string, leagueId: string): Observable<LeagueDTO> {
    return this.mflApiService.getMFLLeague(year, leagueId).pipe(map((leagueInfo) => {
      return this.fromMFLLeague(leagueInfo.league, year);
    }));
  }

  /**
   * Loads mfl league and populates league wrapper object to return via observable
   * TODO clean up to not use variables and fork join
   * @param leagueWrapper new league wrapper object
   */
  loadLeague$(leagueWrapper: LeagueWrapper): Observable<LeagueWrapper> {
    const year = leagueWrapper.selectedLeague.season;
    const leagueId = leagueWrapper.selectedLeague.leagueId;
    const observableList = [];
    let leagueMatchUps = {};
    const leagueTransactions = {};
    let leagueRosters: any = null;
    let teamMetrics = {};
    let teamDraftCapital = {};
    let playoffMatchUps = [];
    let completedDraft = null;
    observableList.push(this.mflApiService.getMFLTransactions(year, leagueId).pipe(map((leagueTrans) => {
      leagueTransactions[1] = this.marshallLeagueTransactions(leagueTrans.transactions.transaction, leagueWrapper.selectedLeague.season);
      return of(leagueTransactions);
    })));
    observableList.push(this.mflApiService.getMFLSchedules(year, leagueId).pipe(map((leagueSchedule) => {
      leagueMatchUps = this.marshallLeagueMatchUps(leagueSchedule.schedule.weeklySchedule);
      return of(leagueMatchUps);
    })));
    observableList.push(this.mflApiService.getMFLRosters(year, leagueId).pipe(map(rosters => {
      leagueRosters = rosters.rosters.franchise;
      return of(leagueRosters);
    })));
    observableList.push(this.mflApiService.getMFLLeagueStandings(year, leagueId).pipe(map(metrics => {
      teamMetrics = this.marshallLeagueTeamMetrics(metrics);
      return of(leagueRosters);
    })));
    // only load future draft capital if dynasty league
    if (leagueWrapper.selectedLeague.type === LeagueType.DYNASTY) {
      observableList.push(this.mflApiService.getMFLFutureDraftPicks(year, leagueId).pipe(map(draftPicks => {
        teamDraftCapital = this.marshallFutureDraftCapital(draftPicks.futureDraftPicks.franchise);
        return of(leagueRosters);
      })));
    }
    observableList.push(this.mflApiService.getMFLPlayoffBrackets(year, leagueId).pipe(map(playoffs => {
      playoffMatchUps = this.marshallPlayoffs(playoffs.playoffBrackets.playoffBracket, leagueWrapper.selectedLeague.playoffStartWeek);
      return of(leagueRosters);
    })));
    // only load draft if it existed on platform
    if (leagueWrapper.selectedLeague.metadata.loadRosters === 'live_draft' ||
      leagueWrapper.selectedLeague.metadata.loadRosters === 'email_draft') {
      observableList.push(this.mflApiService.getMFLDraftResults(year, leagueId).pipe(map(draftResults => {
        completedDraft = this.marshallDraftResults(
          draftResults.draftResults.draftUnit,
          leagueId,
          leagueWrapper?.selectedLeague?.metadata?.draftPoolType,
          leagueWrapper.selectedLeague?.totalRosters
        );
        return of(leagueRosters);
      })));
    }
    return forkJoin(observableList).pipe(map(() => {
      leagueWrapper.selectedLeague.leagueMatchUps = leagueMatchUps;
      leagueWrapper.selectedLeague.leagueTransactions = leagueTransactions;
      leagueWrapper.playoffMatchUps = playoffMatchUps;
      leagueWrapper.leaguePlatform = LeaguePlatform.MFL;
      const teams = [];
      leagueWrapper.selectedLeague?.metadata?.rosters?.forEach(team => {
        const ddTeam = new LeagueTeam(null, null);
        ddTeam.owner = new LeagueOwnerDTO(team.id, team.name, team.name, team.icon || this.DEFAULT_TEAM_LOGO);
        const roster = leagueRosters.find(it => it.id === team.id).player;
        ddTeam.roster = new LeagueRosterDTO(
          this.formatRosterId(team.id),
          team.id,
          roster?.map(player => player.id),
          roster?.filter(player => player.status === 'INJURED_RESERVE').map(player => player.id),
          roster?.filter(player => player.status === 'TAXI_SQUAD').map(player => player.id),
          null
        );
        ddTeam.roster.teamMetrics = teamMetrics[ddTeam.roster.ownerId];
        // index in the division array so we want 0 to be default
        ddTeam.roster.teamMetrics.division = team.division ? Number(team.division) + 1 : 0;
        ddTeam.futureDraftCapital = teamDraftCapital[ddTeam.roster.ownerId];
        teams.push(ddTeam);
      });
      leagueWrapper.leagueTeamDetails = teams;
      leagueWrapper.completedDrafts = completedDraft ? [completedDraft] : [];
      return leagueWrapper;
    }));
  }

  /**
   * helper function that will format json league response into League Data
   * @param leagueInfo league info json blob
   * @param year season
   */
  fromMFLLeague(leagueInfo: any, year: string = null): LeagueDTO {
    const historyList = leagueInfo?.history?.league.length > 1 ? leagueInfo?.history?.league?.sort((a, b) => b.year - a.year) : [];
    const divisions: string[] = [...new Set<string>(leagueInfo?.divisions?.division.map(team => team?.name))] || [];
    const rosterSize = Number(leagueInfo.rosterSize) + (Number(leagueInfo.injuredReserve) || 0) + (Number(leagueInfo.taxiSquad) || 0);
    const mflLeague = new LeagueDTO(
      leagueInfo.starters.position[0].limit !== '1',
      leagueInfo.name,
      leagueInfo.id,
      Number(leagueInfo.franchises.count),
      this.generateRosterPositions(leagueInfo.starters, rosterSize),
      leagueInfo.id || null,
      historyList[0]?.year === new Date().getFullYear().toString() ? 'in_progress' : 'completed',
      year || historyList[0]?.year || null,
      null,
      null,
      LeaguePlatform.MFL);
    mflLeague.rosterSize = rosterSize;
    mflLeague.startWeek = Number(leagueInfo.startWeek);
    mflLeague.type = this.getMFLLeagueType(leagueInfo.keeperType, leagueInfo.maxKeepers);
    mflLeague.playoffStartWeek = Number(leagueInfo.lastRegularSeasonWeek) + 1;
    mflLeague.divisionNames = divisions;
    mflLeague.divisions = divisions.length;
    mflLeague.draftRounds = leagueInfo.draftPlayerPool === 'Rookie' ? 5 : 12;
    mflLeague.medianWins = false; // TODO figure out how that is determined
    mflLeague.playoffRoundType = 0;
    mflLeague.playoffTeams = 6;
    mflLeague.metadata = {
      rosters: leagueInfo.franchises.franchise,
      draftPoolType: leagueInfo.draftPlayerPool,
      loadRosters: leagueInfo.loadRosters || 'live_draft'
    };
    return mflLeague;
  }

  private getMFLLeagueType(leagueType, maxKeeper): LeagueType {
    switch (leagueType) {
      case 'keeper':
        return LeagueType.KEEPER;
      case undefined:
        return maxKeeper === undefined || Number(maxKeeper) === 0 ? LeagueType.REDRAFT : LeagueType.DYNASTY;
      default:
        return LeagueType.DYNASTY;
    }
  }

  /**
   * generate roster positions and return formatted string array
   * @param starters starters json list
   * @param rosterSize size of roster
   */
  private generateRosterPositions(starters, rosterSize): string[] {
    let count = Number(starters.count) - (Number(starters.idp_starters) || Number(starters.iop_starters) || 0);
    const positionMap = [];
    const validStartersList = ['QB', 'RB', 'WR', 'TE'];
    // generate min count
    starters.position.forEach(group => {
      if (validStartersList.includes(group.name)) {
        const minAmount = Number(group.limit.substring(0, 1));
        for (let i = 0; i < minAmount; i++) {
          positionMap.push(group.name);
          count--;
        }
        if (group.name === 'QB' && group.limit.length > 1) {
          positionMap.push('SUPER_FLEX');
          count--;
        }
      }
    });
    for (let i = 0; i < count; i++) {
      positionMap.push('FLEX');
    }
    for (let i = positionMap.length; i < rosterSize; i++) {
      positionMap.push('BN');
    }
    return positionMap;
  }

  /**
   * format json blob into team metrics objects for each team.
   * @param teamMetrics json
   * @return map of teamId to team metrics object
   */
  private marshallLeagueTeamMetrics(teamMetrics: any): {} {
    const metricDict = {};
    teamMetrics?.leagueStandings?.franchise.forEach(team => {
      metricDict[team.id] = (new TeamMetrics(null)).fromMFL(team);
    });
    return metricDict;
  }

  /**
   * format json response to playoff objects
   * @param playoffs json response
   * @param playoffStartWeek playoff start week number
   */
  private marshallPlayoffs(playoffs: any, playoffStartWeek: number): LeaguePlayoffMatchUpDTO[] {
    if (Array.isArray(playoffs)) {
      return playoffs?.map(matchUp => {
        return new LeaguePlayoffMatchUpDTO(null).fromMFL(matchUp, playoffStartWeek);
      }) || [];
    } else {
      return playoffs ? [new LeaguePlayoffMatchUpDTO(null).fromMFL(playoffs, playoffStartWeek)] : [];
    }
  }

  /**
   * format json response to draft results object
   * @param draft json response
   * @param leagueId league id
   * @param playerType draft type
   * @param teamCount number of teams
   */
  private marshallDraftResults(draft: any, leagueId: string, playerType: string, teamCount: number): CompletedDraft {
    const draftId = Math.round(Math.random() * 100);
    const picks = draft?.draftPick?.filter(pick => pick.player !== '----').map(pick => {
      return (new LeagueCompletedPickDTO(null).fromMFL(pick, teamCount));
    });
    return new CompletedDraft(
      new LeagueRawDraftOrderDTO(draftId.toString(), leagueId, 'completed', null,
        null, null, null, null).fromMFL(draft, playerType, picks.length / teamCount),
      picks
    );
  }

  /**
   * format json response to future draft picks dictionary
   * @param picks json of picks
   */
  private marshallFutureDraftCapital(picks: any): {} {
    const picksDict = {};
    picks?.forEach(team => {
      if (Array.isArray(team.futureDraftPick)) {
        picksDict[team.id] = team.futureDraftPick?.map(pick =>
          new DraftCapital(team.id === pick.originalPickFor, Number(pick.round), 6, pick.year));
      } else {
        picksDict[team.id] = picks ? [new DraftCapital(team.id === picks.originalPickFor, Number(picks.round), 6, picks.year)] : [];
      }
    });
    return picksDict;
  }

  /**
   * format json response to match up dictionary
   * @param leagueSchedule json response
   */
  private marshallLeagueMatchUps(leagueSchedule: any): {} {
    const matchUpsDict = {};
    leagueSchedule?.forEach(matchUps => {
      const week = Number(matchUps.week);
      const teamMatchUps = [];
      let matchUpId = 1;
      matchUps?.matchup?.forEach(matchUp => {
        teamMatchUps.push(this.mapTeamMatchUpFromFranchiseScheduleObject(matchUp.franchise[0], matchUpId));
        teamMatchUps.push(this.mapTeamMatchUpFromFranchiseScheduleObject(matchUp.franchise[1], matchUpId));
        matchUpId++;
      });
      matchUpsDict[week] = teamMatchUps;
    });
    return matchUpsDict;
  }

  /**
   * helper function to marshallLeagueMatchUp for formatting one singular matchup
   * @param matchUp json
   * @param matchUpId match up id
   */
  private mapTeamMatchUpFromFranchiseScheduleObject(matchUp: any, matchUpId: number): LeagueTeamMatchUpDTO {
    const newMatchUpData = new LeagueTeamMatchUpDTO(null);
    newMatchUpData.points = Number(matchUp?.score) || 0;
    newMatchUpData.matchupId = matchUpId;
    newMatchUpData.rosterId = this.formatRosterId(matchUp.id);
    return newMatchUpData;
  }

  /**
   * format json response to league transactions
   * @param leagueTrans json
   * @param season
   */
  private marshallLeagueTransactions(leagueTrans: any, season: string): LeagueTeamTransactionDTO[] {
    if (!leagueTrans) {
      return [];
    }
    return leagueTrans.filter(trans => trans.type !== 'TAXI' && trans.type !== 'IR' && !trans.type.includes('AUCTION')).map(trans => {
      let transaction = new LeagueTeamTransactionDTO(null, []);
      transaction.type = trans.type.toLowerCase();
      const rosterId = this.formatRosterId(trans.franchise);
      const drops = {};
      const adds = {};
      if (transaction.type === 'trade') {
        const rosterId2 = this.formatRosterId(trans.franchise2);
        transaction = this.processTransactionInTrade(transaction, trans.franchise2_gave_up.split(','), rosterId2, rosterId, season);
        transaction = this.processTransactionInTrade(transaction, trans.franchise1_gave_up.split(','), rosterId, rosterId2, season);
        transaction.rosterIds = [rosterId, rosterId2];
      } else {
        if (trans.transaction) {
          const players = trans?.transaction?.split('|');
          players[1]?.split(',').filter(playerId => playerId !== '' && !playerId.includes('.') && playerId.length >= 4)
            .forEach(playerId => {
              drops[playerId] = rosterId;
            });
          players[0]?.split(',').filter(playerId => playerId !== '' && !playerId.includes('.') && playerId.length >= 4)
            .forEach(playerId => {
              adds[playerId] = rosterId;
            });
          transaction.rosterIds = [rosterId];
          transaction.drops = drops;
          transaction.adds = adds;
        }
      }
      transaction.transactionId = 'not provided';
      transaction.status = TransactionStatus.COMPLETED;
      transaction.createdAt = Number(trans.timestamp);
      return transaction;
    });
  }

  /**
   * helper function to format trades in transactions
   * @param transaction transaction object
   * @param assets json array
   * @param rosterIdGiveUp roster id
   * @param rosterIdGiveTo roster id
   * @param season string
   * @private
   */
  private processTransactionInTrade(
    transaction: LeagueTeamTransactionDTO,
    assets: any[],
    rosterIdGiveUp: number,
    rosterIdGiveTo: number,
    season: string
  ): LeagueTeamTransactionDTO {
    assets.filter(playerId => playerId !== '').forEach(playerId => {
      if (playerId.substring(0, 3) === 'FP_' || playerId.substring(0, 3) === 'DP_') {
        const pickArr = playerId.split('_');
        transaction.draftpicks.push(new LeagueRawTradePicksDTO(rosterIdGiveTo,
          rosterIdGiveUp,
          rosterIdGiveTo,
          pickArr[0] === 'FP' ? Number(pickArr[3]) : Number(pickArr[1]) + 1,
          pickArr[0] === 'FP' ? pickArr[2] : season));
      } else {
        transaction.drops[playerId] = rosterIdGiveUp;
        transaction.adds[playerId] = rosterIdGiveTo;
      }
    });
    return transaction;
  }

  /**
   * helper function to format team id to numeric roster id
   * @param rosterId string
   */
  private formatRosterId = (rosterId: string) =>
    Number(rosterId?.substr(rosterId.length - 2))

}
