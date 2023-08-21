import { Injectable } from '@angular/core';
import { from, Observable, of, throwError } from 'rxjs';
import { LeagueWrapper } from '../../../model/league/LeagueWrapper';
import { LeagueOwnerDTO } from '../../../model/league/LeagueOwnerDTO';
import { LeagueTeam } from '../../../model/league/LeagueTeam';
import { LeagueCompletedPickDTO } from '../../../model/league/LeagueCompletedPickDTO';
import { LeagueRosterDTO } from '../../../model/league/LeagueRosterDTO';
import { map, concatMap, catchError, delay, switchMap, toArray } from 'rxjs/operators';
import { LeagueTeamMatchUpDTO } from '../../../model/league/LeagueTeamMatchUpDTO';
import { LeagueRawDraftOrderDTO } from '../../../model/league/LeagueRawDraftOrderDTO';
import { TeamMetrics } from '../../../model/league/TeamMetrics';
import { LeagueDTO, LeagueType } from '../../../model/league/LeagueDTO';
import { FantasyPlatformDTO, LeaguePlatform } from '../../../model/league/FantasyPlatformDTO';
import { CompletedDraft } from '../../../model/league/CompletedDraft';
import { DraftCapital } from '../../../model/assets/DraftCapital';
import { NflService } from '../../utilities/nfl.service';
import { LeagueUserDTO } from 'src/app/model/league/LeagueUserDTO';
import { Status } from 'src/app/components/model/status';
import { FFPCApiService } from './ffpc-api.service';
import { PlatformLogos } from '../../utilities/display.service';
import { LeagueScoringDTO } from 'src/app/model/league/LeagueScoringDTO';

@Injectable({
  providedIn: 'root'
})
export class FFPCService {

  /** Request Delay for api calls to prevent 429s */
  private REQUEST_DELAY = 500

  /** player id map for FFPC */
  public playerIdMap = {};

  constructor(private ffpcApiService: FFPCApiService, private nflService: NflService) {
  }

  /**
   * returns Load league observable from mfl league id and year
   * @param year string
   * @param leagueId string
   */
  loadLeagueFromId$(year: string, leagueId: string): Observable<LeagueDTO> {
    return this.ffpcApiService.getFFPCLeague(year, leagueId).pipe(map((leagueInfo) => {
      return this.fromFFPCLeague(leagueInfo?.root?.data?.league, year);
    }));
  }

  /**
   * Loads mfl league and populates league wrapper object to return via observable
   * TODO clean up to not use variables and fork join
   * @param leagueWrapper new league wrapper object
   */
  loadLeague$(leagueWrapper: LeagueWrapper): Observable<LeagueWrapper> {
    const year = leagueWrapper.selectedLeague.season || this.nflService.stateOfNFL.season;
    const leagueId = leagueWrapper.selectedLeague.leagueId;
    const observableList = [];
    let leagueMatchUps = {};
    let leagueRosters: any = null;
    let teamMetrics = {};
    let completedDraft = null;
    leagueWrapper.selectedLeague.scoringSettings = new LeagueScoringDTO().fromFFPC(leagueWrapper.selectedLeague.metadata['scoringRules']);
    observableList.push(
      this.ffpcApiService.getFFPCSchedules(year, leagueId).pipe(
        map((leagueSchedule) => {
          leagueMatchUps = this.marshalLeagueMatchUps(leagueSchedule?.root?.data?.matchups?.matchup)
          return of(leagueMatchUps);
        })
      )
    );
    observableList.push(
      this.ffpcApiService.getFFPCDraftResults(year, leagueId).pipe(
        map(draftRes => {
          completedDraft = this.marshalCompletedDraft(
            draftRes?.root?.data?.draft?.pick,
            leagueWrapper.selectedLeague.totalRosters,
            leagueId
          );
          return of(completedDraft);
        })
      )
    );
    observableList.push(
      this.ffpcApiService.getFFPCRosters(year, leagueId).pipe(
        map(rosters => {
          leagueRosters = rosters?.root?.data?.league?.teams?.team;
          return of(leagueRosters);
        })
      )
    );
    observableList.push(
      this.ffpcApiService.getFFPCLeagueStandings(year, leagueId).pipe(
        map(standings => {
          standings?.root?.data?.teamStandings?.teamStanding?.forEach(m => {
            const teamMetrics = m._attributes;
            teamMetrics[teamMetrics.teamID] = new TeamMetrics().fromFFPC(teamMetrics);
          });
          return of(teamMetrics);
        })
      )
    );
    return from(observableList).pipe(
      concatMap((observable) => {
        return observable.pipe(delay(this.REQUEST_DELAY));
      }),
      toArray(),
      switchMap(() => {
        leagueWrapper.selectedLeague.leagueMatchUps = leagueMatchUps;
        leagueWrapper.leaguePlatform = LeaguePlatform.FFPC;
        leagueWrapper.completedDrafts = completedDraft ? [completedDraft] : [];
        const teams = [];
        leagueRosters?.forEach(team => {
          const ownerDTO = new LeagueOwnerDTO(team.teamID, team.teamName.toString(), team.teamName.toString(), PlatformLogos.FFPC_LOGO);
          const roster = team.roster?.player?.map(p => p.bgsPlayerID.toString()) || [];
          this.mapFFPCIdMap(team.roster?.player);
          const rosterDTO = new LeagueRosterDTO().fromFFPC(team.teamID, team.teamID, roster);
          const ddTeam = new LeagueTeam(ownerDTO, rosterDTO);
          ddTeam.roster.teamMetrics = teamMetrics[ddTeam.roster.ownerId] || new TeamMetrics();
          // only load future draft capital if dynasty league
          const picks = Array.isArray(team?.draftPicks?.pick) ? team?.draftPicks?.pick : [team?.draftPicks?.pick];
          ddTeam.futureDraftCapital = picks?.map(p => new DraftCapital(
            p.draftRound,
            p.roundPick !== 0 ? p.roundPick : 6,
            p.draftSeason.toString(), team.teamID)
          ) || []
          teams.push(ddTeam);
        });
        leagueWrapper.leagueTeamDetails = teams;
        return of(leagueWrapper);
      }));
  }

  /**
   * helper function that will format json league response into League Data
   * @param leagueInfo league info json blob
   * @param year season
   */
  fromFFPCLeague(leagueInfo: any, year: string = null): LeagueDTO {
    const rosPosition = this.generateRosterPositions(leagueInfo, leagueInfo?.rosterSize);
    const ffpcLeagueId = new LeagueDTO().fromFFPC(
      leagueInfo.leagueName.trim(),
      leagueInfo.leagueID,
      leagueInfo.rosterSize,
      this.getFFPCLeagueType(leagueInfo.ffpcLeagueTypeID),
      leagueInfo.teams?.team?.length || 12,
      leagueInfo.starters,
      rosPosition,
      year === new Date().getFullYear().toString() ? 'in_progress' : 'completed',
      rosPosition.includes('SUPER_FLEX'),
      year
    );
    ffpcLeagueId.metadata['scoringRules'] = leagueInfo?.scoringRules.scoringRule;
    return ffpcLeagueId;
  }

  /**
  * Load FFPC users
  * @param email email string
  * @param season string for current season
  * @returns 
  */
  loadFFPCUser$(email: string, season: string): Observable<FantasyPlatformDTO> {
    return this.ffpcApiService.getFFPCUserLeagues(season, email).pipe(map(response => {
      if (response == null) {
        console.warn('User data could not be found. Try again!');
        return null;
      }

      const userData = new LeagueUserDTO()
      userData.username = email;

      const leagues = []
      response?.root?.data?.league?.forEach(league => {
        const newLeague = new LeagueDTO()
        newLeague.leagueId = league.leagueID;
        newLeague.name = league?.leagueName;
        newLeague.type = this.getFFPCLeagueType(league.ffpcLeagueTypeID)
        newLeague.leaguePlatform = LeaguePlatform.MFL;
        newLeague.metadata['teamId'] = league?.teamID;
        newLeague.metadata['status'] = Status.LOADING;
        leagues.push(newLeague);
      })
      return { leagues, userData, leaguePlatform: LeaguePlatform.FFPC }
    }),
      catchError(error => {
        return throwError(error);
      }));
  }

  /**
   * Determines the type of league in MFL
   * @param leagueType league type passed in
   * @returns 
   */
  private getFFPCLeagueType(leagueType: number): LeagueType {
    if ([12, 28, 29].includes(leagueType)) {
      return LeagueType.DYNASTY;
    }
    return LeagueType.REDRAFT;
  }

  /**
   * generate roster positions and return formatted string array
   * @param starters starters json list
   * @param rosterSize size of roster
   */
  private generateRosterPositions(starters: any, rosterSize: number): string[] {
    const positionMap = [];
    starters.rosterPositions.rosterPosition.forEach(group => {
      for (let i = 0; i < Number(group.numStarters); i++) {
        if (group.positionCategoryCode === 'SUPERFLEX') {
          positionMap.push('SUPER_FLEX');
        } else if (group.positionCategoryCode === 'RBWRTE') {
          positionMap.push('FLEX');
        } else {
          let pos = group.positionCategoryCode;
          if (pos == 'PK')
            pos = 'K';
          positionMap.push(pos);
        }
      }
    });
    for (let i = positionMap.length; i < rosterSize; i++) {
      positionMap.push('BN');
    }
    return positionMap;
  }

  /**
 * Format player id map since ffpc doesn't have an api
 * @param playerList list of players to add
 */
  private mapFFPCIdMap(playerList: any[]): void {
    playerList?.forEach(player => {
      this.playerIdMap[player.bgsPlayerID.toString()] = {
        full_name: `${player.firstName} ${player.lastName}`,
        position: player.positionCode,
        short_name: `${player.firstName?.substr(0, 1)}. ${player.lastName}`,
        team: player?.nflTeam || 'FA',
      }
    });
  }

  /**
   * marshal schedule json into dynasty daddy format
   * @param leagueSchedule league schedule json from ffpc
   */
  private marshalLeagueMatchUps(leagueSchedule: any): {} {
    const matchUpsDict = {};
    let matchUpId = 1;
    leagueSchedule?.forEach(rawMatchup => {
      const matchUp = rawMatchup._attributes;
      const week = Number(matchUp.leagueWeek);
      const teamMatchUps = [];
      teamMatchUps.push(new LeagueTeamMatchUpDTO()
        .createMatchUpObject(matchUpId, Number(matchUp.homeTeamScore), Number(matchUp.homeTeamID)));
      teamMatchUps.push(new LeagueTeamMatchUpDTO()
        .createMatchUpObject(matchUpId, Number(matchUp.awayTeamScore), Number(matchUp.awayTeamID)));
      matchUpId++;
      matchUpsDict[week] = matchUpsDict[week] ? matchUpsDict[week].concat(teamMatchUps) : teamMatchUps;
    });
    return matchUpsDict;
  }

  /**
   * marshal json draft results into dynasty daddy objects
   * @param picks json array of picks in draft
   * @param teamCount number of teams
   * @param leagueId league id string
   * @returns 
   */
  private marshalCompletedDraft(picks: any[], teamCount: number, leagueId: string): {} {
    const draftId = Math.round(Math.random() * 100);
    const formattedPicks = picks?.map(pick => {
      return (new LeagueCompletedPickDTO().fromFFPC(pick));
    });
    return new CompletedDraft(
      new LeagueRawDraftOrderDTO()
        .fromFFPC(
          picks,
          (picks?.length || teamCount * 4) / teamCount,
          draftId.toString(),
          leagueId,
          picks && picks?.length > 0 ? 'completed' : 'in_progress'
        ),
      formattedPicks
    );
  }
}
