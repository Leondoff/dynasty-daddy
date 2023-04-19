import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LeagueDTO, LeagueType } from '../../../model/league/LeagueDTO';
import { ESPNApiService } from './espn-api.service';
import { LeaguePlatform } from 'src/app/model/league/FantasyPlatformDTO';
import { LeagueWrapper } from 'src/app/model/league/LeagueWrapper';
import { LeagueTeam } from 'src/app/model/league/LeagueTeam';
import { LeagueOwnerDTO } from 'src/app/model/league/LeagueOwnerDTO';
import { LeagueRosterDTO } from 'src/app/model/league/LeagueRosterDTO';
import { TeamMetrics } from 'src/app/model/league/TeamMetrics';
import { LeagueTeamMatchUpDTO } from 'src/app/model/league/LeagueTeamMatchUpDTO';
import { LeagueCompletedPickDTO } from 'src/app/model/league/LeagueCompletedPickDTO';
import { CompletedDraft } from 'src/app/model/league/CompletedDraft';
import { LeagueRawDraftOrderDTO } from 'src/app/model/league/LeagueRawDraftOrderDTO';

@Injectable({
  providedIn: 'root'
})
export class ESPNService {

  /** default flea flicker icon if team has no icon */
  private DEFAULT_TEAM_LOGO = 'https://g.espncdn.com/lm-static/ffl/images/default_logos/12.svg';

  /** player id map for players found in apis */
  playerIdMap = {}

  constructor(private espnApiService: ESPNApiService) {
  }

  /**
   * returns Load league observable from flea flicker league id and year
   * @param year string
   * @param leagueId string
   */
  loadLeagueFromId$(year: string, leagueId: string): Observable<LeagueDTO> {
    return this.espnApiService.getESPNLeague(year, leagueId).pipe(map((leagueInfo) => {
      return this.fromESPNLeague(leagueInfo);
    }));
  }

  /**
   * Format league data into wrapper and return
   * @param leagueWrapper league wrapper to build
   * @returns 
   */
  loadLeague$(leagueWrapper: LeagueWrapper): Observable<LeagueWrapper> {
    const teams = [];
    leagueWrapper.selectedLeague.metadata.rosters?.forEach((team, ind) => {
      const ddTeam = new LeagueTeam(null, null);
      const ownerDetails = leagueWrapper.selectedLeague.metadata.owners?.find(it => it.id === team.primaryOwner)
      ddTeam.owner = new LeagueOwnerDTO(team.primaryOwner, ownerDetails.firstName.slice(0, 1) + '. ' + ownerDetails.lastName, team.name, team.logo || this.DEFAULT_TEAM_LOGO);
      const roster = team.roster.entries.map(it => it.playerId.toString());
      // TODO put in a funtion to reuse
      this.mapESPNIdMap(team.roster.entries);
      ddTeam.roster = new LeagueRosterDTO(
        team.id,
        team.primaryOwner,
        roster,
        null,
        null,
        new TeamMetrics(null)
      );
      // index in the division array so we want 0 to be default
      // ddTeam.roster.teamMetrics.division = leagueWrapper.selectedLeague.divisions > 1 ?
      //   leagueWrapper.selectedLeague.divisionNames.findIndex(it => it === division.name) + 1 : 1;
      ddTeam.roster.teamMetrics.fpts = Number(team.record?.overall?.pointsFor || 0);
      ddTeam.roster.teamMetrics.fptsAgainst = Number(team.record?.overall?.pointsAgainst || 0);
      ddTeam.roster.teamMetrics.wins = Number(team.record?.overall?.wins || 0);
      ddTeam.roster.teamMetrics.losses = Number(team.record?.overall?.losses || 0);
      ddTeam.roster.teamMetrics.rank = Number(team.playoffSeed || 0);
      teams.push(ddTeam);
    });
    leagueWrapper.leagueTeamDetails = teams;
    leagueWrapper.selectedLeague.leagueMatchUps = this.marshallSchedule(leagueWrapper.selectedLeague.metadata.schedule)
    leagueWrapper.completedDrafts = leagueWrapper.selectedLeague.metadata.draft ?
      [this.marshallDraftResults(leagueWrapper.selectedLeague.metadata.draft, leagueWrapper.selectedLeague.leagueId, leagueWrapper.selectedLeague.draftRounds)] : [];
    leagueWrapper.selectedLeague.metadata = {};
    return of(leagueWrapper);
  }

  /**
   * helper function that will format json league response into League Data
   * @param leagueInfo league info json blob
   * @param year season
   */
  private fromESPNLeague(leagueInfo: any): LeagueDTO {
    const divisions: string[] = [...new Set<string>(leagueInfo?.settings?.scheduleSettings?.divisions?.map(division => division?.name))] || [];
    const roster = this.generateRosterPositions(leagueInfo.settings.rosterSettings.lineupSlotCounts)
    const ffLeague = new LeagueDTO().setLeague(
      roster[1] == 'QB',
      leagueInfo.settings?.name || 'ESPN League',
      leagueInfo.id,
      leagueInfo.settings?.size,
      roster,
      leagueInfo.id || null,
      leagueInfo.seasonId === new Date().getFullYear() ? 'in_progress' : 'completed',
      leagueInfo.seasonId.toString(),
      null,
      null,
      null,
      LeaguePlatform.ESPN);
    ffLeague.rosterSize = roster.length + (leagueInfo?.settings?.rosterSettings?.lineupSlotCounts["23"] || 2 * roster.length);
    ffLeague.divisionNames = divisions;
    ffLeague.divisions = divisions.length;
    ffLeague.startWeek = Number(leagueInfo.status?.firstScoringPeriod) || 1;
    ffLeague.type = (leagueInfo.settings?.keeperCount > 0 || leagueInfo.settings?.keeperCountFuture > 0) ? LeagueType.DYNASTY : LeagueType.REDRAFT;
    ffLeague.draftRounds = (leagueInfo.draftDetail?.picks?.length / leagueInfo.settings?.size) || 5;
    ffLeague.medianWins = false; // TODO figure out how that is determined
    ffLeague.playoffStartWeek = leagueInfo?.settings?.scheduleSettings?.matchupPeriodCount || 14;
    ffLeague.playoffTeams = leagueInfo?.settings?.scheduleSettings?.playoffTeamCount || 6;
    ffLeague.playoffRoundType = leagueInfo?.settings?.scheduleSettings?.playoffMatchupPeriodLength || 1;
    ffLeague.metadata = {
      rosters: leagueInfo.teams,
      schedule: leagueInfo.schedule,
      owners: leagueInfo.members,
      draft: leagueInfo.draftDetail
    };
    return ffLeague;
  }

  /**
   * Map roster slots to offensive starters
   * https://support.espn.com/hc/en-us/articles/115003939432-Roster-Slots-Offense-
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
    return rosterList;
  }

  /**
   * Maps response schedule into dynasty daddy formatted schedule
   * @param games list of schedule games
   * @returns 
   */
  private marshallSchedule(games: any[]): {} {
    const schedule = {}
    games?.forEach(game => {
      const homeMatchUp = new LeagueTeamMatchUpDTO();
      homeMatchUp.createMatchUpObject(game.id, game.home.totalPoints, game.home.teamId);
      const awayMatchUp = new LeagueTeamMatchUpDTO();
      awayMatchUp.createMatchUpObject(game.id, game.away.totalPoints, game.away.teamId);
      schedule[game.matchupPeriodId] = !schedule[game.matchupPeriodId] ? [homeMatchUp, awayMatchUp]
        : schedule[game.matchupPeriodId].concat(...[homeMatchUp, awayMatchUp]);
    });
    return schedule;
  }

  /**
   * Marshall draft results into Completed Draft object
   * @param draft json response
   * @param leagueId league id
   * @param rounds number of rounds
   * @returns 
   */
  private marshallDraftResults(draft: any, leagueId: string, rounds: number): CompletedDraft {
    const draftId = Math.round(Math.random() * 100);
    const picks = draft?.picks?.map(pick => {
      return (new LeagueCompletedPickDTO(null).fromESPN(pick));
    });
    return new CompletedDraft(
      new LeagueRawDraftOrderDTO(draftId.toString(), leagueId, 'completed', null,
        null, null, null, null).fromESPN(draft, rounds),
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
