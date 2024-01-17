import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { LeagueDTO } from '../../../model/league/LeagueDTO';
import { ESPNApiService } from './espn-api.service';
import { LeagueWrapper } from 'src/app/model/league/LeagueWrapper';
import { LeagueTeam } from 'src/app/model/league/LeagueTeam';
import { LeagueOwnerDTO } from 'src/app/model/league/LeagueOwnerDTO';
import { LeagueRosterDTO } from 'src/app/model/league/LeagueRosterDTO';
import { TeamMetrics } from 'src/app/model/league/TeamMetrics';
import { LeagueTeamMatchUpDTO } from 'src/app/model/league/LeagueTeamMatchUpDTO';
import { LeaguePickDTO } from 'src/app/model/league/LeaguePickDTO';
import { CompletedDraft } from 'src/app/model/league/CompletedDraft';
import { LeagueRawDraftOrderDTO } from 'src/app/model/league/LeagueRawDraftOrderDTO';
import { PlatformLogos } from '../../utilities/display.service';
import { LeagueScoringDTO } from 'src/app/model/league/LeagueScoringDTO';
import { LeagueTeamTransactionDTO } from 'src/app/model/league/LeagueTeamTransactionDTO';

@Injectable({
  providedIn: 'root'
})
export class ESPNService {

  /** player id map for players found in apis */
  playerIdMap = {}

  /** cache these two values to load transactions */
  espnS2: string = '';
  swid: string = '';

  constructor(private espnApiService: ESPNApiService) {
  }

  /**
   * returns Load league observable from ESPN league id and year
   * @param year season to load
   * @param leagueId id to load from espn
   * @param espn_s2 espn auth cookie
   * @param swid espn auth cookie
   */
  loadLeagueFromId$(year: string, leagueId: string, espn_s2: string = null, swid: string = null): Observable<LeagueDTO> {
    this.espnS2 = espn_s2;
    this.swid = swid;
    return this.espnApiService.getESPNLeague(year, leagueId, espn_s2, swid).pipe(map((leagueInfo) => {
      return this.fromESPNLeague(leagueInfo, espn_s2, swid);
    }));
  }

  /**
   * Format league data into wrapper and return
   * @param leagueWrapper league wrapper to build
   * @returns 
   */
  loadLeague$(leagueWrapper: LeagueWrapper): Observable<LeagueWrapper> {
    const observe = [];
    let leagueTransactions = {};
    for (let weekNum = leagueWrapper.selectedLeague.startWeek; weekNum < 19; weekNum++) {
      observe.push(
        this.espnApiService.getTransactionsForWeek(
          leagueWrapper.selectedLeague.season,
          leagueWrapper.selectedLeague.leagueId,
          weekNum,
          this.espnS2,
          this.swid
        ).pipe(
          mergeMap((transactions) => {
            leagueTransactions[weekNum] = transactions.map(t => new LeagueTeamTransactionDTO().fromESPN(t));
            return of(transactions);
          })
        )
      );
    }

    return forkJoin(observe).pipe(
      mergeMap(() => {
        const teams = [];
        leagueWrapper.selectedLeague.metadata.rosters?.forEach((team, ind) => {
          const ownerDTO = new LeagueOwnerDTO(
            team.primaryOwner,
            team.name,
            team.name,
            team.logo || PlatformLogos.ESPN_LOGO
          );
          const roster = team.roster.entries.map(it => it.playerId.toString());
          this.mapESPNIdMap(team.roster.entries);
          const rosterDTO = new LeagueRosterDTO().fromESPN(
            team.id,
            team.primaryOwner,
            roster,
            new TeamMetrics().fromESPN(team)
          );
          const ddTeam = new LeagueTeam(ownerDTO, rosterDTO);
          teams.push(ddTeam);
        });
        leagueWrapper.leagueTeamDetails = teams;
        leagueWrapper.selectedLeague.leagueTransactions = leagueTransactions;
        leagueWrapper.selectedLeague.leagueMatchUps = this.marshallSchedule(
          leagueWrapper.selectedLeague.metadata.schedule,
          leagueWrapper.selectedLeague.playoffStartWeek
        );
        if (leagueWrapper.selectedLeague.metadata.draft) {
          const draft = this.marshallDraftResults(leagueWrapper.selectedLeague.metadata.draft,
            leagueWrapper.selectedLeague.leagueId,
            leagueWrapper.selectedLeague.draftRounds,
            leagueWrapper.selectedLeague.totalRosters
          )
          draft?.draft?.status === 'completed' ? leagueWrapper.completedDrafts = [draft] : leagueWrapper.upcomingDrafts = [draft];
        }
        leagueWrapper.selectedLeague.metadata = {
          espn_s2: leagueWrapper.selectedLeague.metadata['espn_s2'],
          swid: leagueWrapper.selectedLeague.metadata['swid']
        };
        return of(leagueWrapper);
      })
    );
  }

  /**
   * Converts a JSON representation of an ESPN league into a LeagueDTO.
   *
   * @param leagueInfo - JSON blob containing information about the ESPN league.
   * @param espnS2 - String for accessing private leagues (optional).
   * @param swid - String for accessing private leagues (optional).
   * @returns A LeagueDTO representing the converted league information.
   */
  private fromESPNLeague(leagueInfo: any, espnS2?: string, swid?: string): LeagueDTO {
    const divisions: string[] = [...new Set<string>(leagueInfo?.settings?.scheduleSettings?.divisions?.map(division => division?.name))] || [];
    const roster = this.generateRosterPositions(leagueInfo.settings.rosterSettings.lineupSlotCounts)
    const ffLeague = new LeagueDTO().fromESPN(
      roster[1] == 'QB',
      leagueInfo.settings?.name || 'ESPN League',
      leagueInfo.id,
      leagueInfo.settings?.size,
      roster,
      leagueInfo.id || null,
      leagueInfo.seasonId === new Date().getFullYear() ? 'in_progress' : 'completed',
      leagueInfo.seasonId.toString(),
      roster.length + (leagueInfo?.settings?.rosterSettings?.lineupSlotCounts["23"] || 2 * roster.length),
      leagueInfo,
      espnS2,
      swid);
    ffLeague.setDivisions(divisions);
    ffLeague.scoringSettings = new LeagueScoringDTO().fromESPN(leagueInfo?.settings?.scoringSettings)
    return ffLeague;
  }

  /**
   * Map roster slots to offensive starters
   * https://github.com/cwendt94/espn-api/blob/master/espn_api/football/constant.py
   * @param league 
   * @param settings 
   * @param rosterSetting 
   */
  private generateRosterPositions(rosterSettings: any): string[] {
    let rosterList = [];
    rosterList = rosterList.concat(...new Array(rosterSettings["0"]).fill('QB'))
    rosterList = rosterList.concat(...new Array(rosterSettings["2"]).fill('RB'))
    rosterList = rosterList.concat(...new Array(rosterSettings["4"]).fill('WR'))
    rosterList = rosterList.concat(...new Array(rosterSettings["6"]).fill('TE'))
    rosterList = rosterList.concat(...new Array(rosterSettings["23"]).fill('FLEX'))
    rosterList = rosterList.concat(...new Array((rosterSettings["3"] || 0) + (rosterSettings["5"] || 0) + (rosterSettings["13"] || 0)).fill('FLEX'))
    rosterList = rosterList.concat(...new Array(rosterSettings["17"]).fill('K'))
    rosterList = rosterList.concat(...new Array(rosterSettings["16"]).fill('DF'))
    rosterList = rosterList.concat(...new Array((rosterSettings["8"] || 0) + (rosterSettings["9"] || 0) + (rosterSettings["11"] || 0)).fill('DL'))
    rosterList = rosterList.concat(...new Array((rosterSettings["13"] || 0) + (rosterSettings["14"] || 0) + (rosterSettings["12"] || 0)).fill('DB'))
    rosterList = rosterList.concat(...new Array(rosterSettings["10"]).fill('LB'))
    rosterList = rosterList.concat(...new Array(rosterSettings["7"]).fill('SUPER_FLEX'))
    rosterList = rosterList.concat(...new Array(rosterSettings["15"]).fill('IDP_FLEX'))
    return rosterList;
  }

  /**
   * Maps response schedule into dynasty daddy formatted schedule
   * @param games list of schedule games
   * @returns 
   */
  private marshallSchedule(games: any[], playoffStartWeek: number): {} {
    const schedule = {}
    games?.forEach(game => {
      if (game.home && game.away &&
        (game.matchupPeriodId < playoffStartWeek ||
          game.playoffTierType === 'WINNERS_BRACKET')
      ) {
        const homeMatchUp = new LeagueTeamMatchUpDTO();
        homeMatchUp.createMatchUpObject(game.id, game.home?.totalPoints, game.home.teamId);
        const awayMatchUp = new LeagueTeamMatchUpDTO();
        awayMatchUp.createMatchUpObject(game.id, game.away?.totalPoints, game.away.teamId);
        schedule[game.matchupPeriodId] = !schedule[game.matchupPeriodId] ? [homeMatchUp, awayMatchUp]
          : schedule[game.matchupPeriodId].concat(...[homeMatchUp, awayMatchUp]);
      }
    });
    return schedule;
  }

  /**
   * Marshall draft results into Completed Draft object
   * @param draft json response
   * @param leagueId league id
   * @param rounds number of rounds
   * @param teamCount number of teams
   */
  private marshallDraftResults(draft: any, leagueId: string, rounds: number, teamCount: number): CompletedDraft {
    const draftId = Math.round(Math.random() * 100);
    const slotOrder = {};
    draft.picks.slice(0, teamCount).forEach((pick, ind) => {
      slotOrder[ind + 1] = pick.teamId;
    })
    const picks = draft?.picks?.map(pick => {
      const originalOwnerId = slotOrder[pick.roundId % 2 === 0 ? teamCount - pick.roundPickNumber + 1 : pick.roundPickNumber]
      return (new LeaguePickDTO().fromESPN(pick, teamCount, originalOwnerId));
    });
    return new CompletedDraft(
      new LeagueRawDraftOrderDTO().fromESPN(draft, rounds, draftId.toString(), leagueId, slotOrder),
      picks
    );
  }

  /**
   * Format player id map since ESPN doesn't have an api
   * @param playerList list of players to add
   */
  private mapESPNIdMap(playerList: any[]): void {
    playerList?.forEach(player => {
      if (player && player.playerPoolEntry) {
        this.playerIdMap[player.playerId.toString()] = {
          full_name: player.playerPoolEntry.player.fullName,
          position: this.getPositionByPositionId(player.playerPoolEntry.player.defaultPositionId),
          short_name: player.playerPoolEntry.player.lastName,
          team: '-',
        }
      }
    });
  }

  /**
   * Return string for espn pos id
   * @param posId number pos id
   * @returns 
   */
  private getPositionByPositionId(posId: number): string {
    switch (posId) {
      case 1:
        return 'QB';
      case 2:
        return 'RB';
      case 3:
        return 'WR';
      case 4:
        return 'TE';
      default:
        return '??';
    }
  }
}
