import { Injectable } from '@angular/core';
import { SleeperApiService } from './api/sleeper/sleeper-api.service';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { LeagueWrapper } from '../model/league/LeagueWrapper';
import { SleeperService } from './api/sleeper/sleeper.service';
import { MflService } from './api/mfl/mfl.service';
import { MflApiService } from './api/mfl/mfl-api.service';
import { LeaguePlayoffMatchUpDTO } from '../model/league/LeaguePlayoffMatchUpDTO';
import { LeagueTeam } from '../model/league/LeagueTeam';
import { LeagueRosterDTO } from '../model/league/LeagueRosterDTO';
import { LeagueRawDraftOrderDTO } from '../model/league/LeagueRawDraftOrderDTO';
import { LeagueOwnerDTO } from '../model/league/LeagueOwnerDTO';
import { TeamMetrics } from '../model/league/TeamMetrics';
import { FantasyPlatformDTO, LeaguePlatform } from '../model/league/FantasyPlatformDTO';
import { CompletedDraft } from '../model/league/CompletedDraft';
import { DraftCapital } from '../model/assets/DraftCapital';
import { LeagueDTO, LeagueScoringFormat } from '../model/league/LeagueDTO';
import { FleaflickerService } from './api/fleaflicker/fleaflicker.service';
import { LeagueTeamMatchUpDTO } from '../model/league/LeagueTeamMatchUpDTO';
import { NflService } from './utilities/nfl.service';
import { ESPNService } from './api/espn/espn.service';

@Injectable({
  providedIn: 'root'
})
export class LeagueService {

  /** league user data */
  leagueUser: FantasyPlatformDTO = null;

  /** selected league data */
  selectedLeague: LeagueDTO;

  /** selected year */
  selectedYear: string;

  /** is league loaded */
  leagueStatus: string = 'LOADING';

  /** selected league team data */
  leagueTeamDetails: LeagueTeam[] = [];

  /** upcoming draft data */
  upcomingDrafts: LeagueRawDraftOrderDTO[] = [];

  /** completed draft data */
  completedDrafts: CompletedDraft[] = [];

  /** dict of sleeper player ids */
  platformPlayersMap = {};

  playoffMatchUps: LeaguePlayoffMatchUpDTO[] = [];

  constructor(private sleeperApiService: SleeperApiService,
    private sleeperService: SleeperService,
    private mflApiService: MflApiService,
    private nflService: NflService,
    private espnService: ESPNService,
    private fleaflickerService: FleaflickerService,
    private mflService: MflService) {
  }

  /**
   * returns true if league is loaded
   */
  isLeagueLoaded(): boolean {
    return this.leagueStatus === 'DONE';
  }

  /**
   * loads team data, roster, and draft picks by league
   * @param selectedLeague selected league
   */
  loadNewLeague$(selectedLeague: LeagueDTO): Observable<any> {
    this.selectedLeague = selectedLeague;
    this.leagueStatus = 'LOADING';
    switch (this.selectedLeague.leaguePlatform) {
      case LeaguePlatform.MFL:
        return this.mflService.loadLeague$(new LeagueWrapper(this.selectedLeague))?.pipe(map((league) => {
          this.setServiceFromLeagueWrapper(league);
          this.mflApiService.getMFLPlayers(selectedLeague.season, selectedLeague.leagueId).subscribe((players) => {
            this.platformPlayersMap = players;
            return of(league);
          });
        }));
      case LeaguePlatform.FLEAFLICKER:
        return this.fleaflickerService.loadLeague$(new LeagueWrapper(this.selectedLeague))?.pipe(map((league) => {
          this.setServiceFromLeagueWrapper(league);
          this.platformPlayersMap = this.fleaflickerService.playerIdMap;
          return of(league);
        }));
      case LeaguePlatform.ESPN:
        return this.espnService.loadLeague$(new LeagueWrapper(this.selectedLeague))?.pipe(map((league) => {
          this.setServiceFromLeagueWrapper(league);
          this.platformPlayersMap = this.espnService.playerIdMap;
          return of(league);
        }));
      default:
        return this.sleeperService.loadLeague$(new LeagueWrapper(this.selectedLeague)).pipe(map((league) => {
          this.setServiceFromLeagueWrapper(league);
          this.sleeperApiService.fetchAllSleeperPlayers().subscribe((players) => {
            this.platformPlayersMap = players;
            return of(league);
          });
        }));
    }
  }

  /**
   * helper function that will set all league values from loaded league wrapper
   * @param league league wrapper
   * @private
   */
  private setServiceFromLeagueWrapper(league: LeagueWrapper): void {
    this.selectedLeague = league.selectedLeague;
    this.leagueTeamDetails = league.leagueTeamDetails;
    this.completedDrafts = league.completedDrafts;
    this.upcomingDrafts = league.upcomingDrafts;
    this.playoffMatchUps = league.selectedLeague.leaguePlatform === LeaguePlatform.SLEEPER ?
      league.playoffMatchUps : this.generatePlayoffsForLeague(league.selectedLeague.leagueMatchUps, league.leagueTeamDetails, league.selectedLeague.playoffStartWeek, league.selectedLeague.season);
  }

  /**
   * loads new user data from sleeper username
   * @param username user name
   * @param year string selected season
   * @param leaguePlatform League platform
   * @param password mfl password
   */
  loadNewUser$(username: string, year: string, leaguePlatform: LeaguePlatform = LeaguePlatform.SLEEPER, password: string = ''): Observable<any> {
    this.selectedYear = year;
    try {
      switch (leaguePlatform) {
        case LeaguePlatform.SLEEPER: {
          this.sleeperService.loadSleeperUser$(username, year).subscribe(leagueUser => {
            this.leagueUser = leagueUser;
            return of(leagueUser);
          });
          break;
        }
        case LeaguePlatform.FLEAFLICKER: {
          this.fleaflickerService.loadFleaflickerUser$(username, year).subscribe(leagueUser => {
            this.leagueUser = leagueUser;
            return of(leagueUser);
          });
          break
        }
        case LeaguePlatform.MFL: {
          this.mflService.loadMFLUser$(username, password).subscribe(leagueUser => {
            this.leagueUser = leagueUser;
            return of(leagueUser);
          });
          break
        }
        default: {
          console.warn(`Unsupported league platform type ${leaguePlatform}`);
          return of(null);
        }
      }
    } catch (e) {
      return of();
    }
  }

  /**
   * reset league data
   */
  resetLeague(): void {
    this.selectedLeague = null;
    this.leagueTeamDetails = [];
    this.completedDrafts = [];
    this.upcomingDrafts = [];
    this.playoffMatchUps = [];
  }

  /**
   * get team by roster id
   * @param rosterId id
   * returns sleeper team data
   */
  getTeamByRosterId(rosterId): LeagueTeam {
    for (const team of this.leagueTeamDetails) {
      if (team.roster.rosterId === rosterId) {
        return team;
      }
    }
    // TODO improve handling when player leaves league mid season without replacement
    // if not found we return a dummy object
    return new LeagueTeam(
      new LeagueOwnerDTO(
        'unable_to_find',
        'Retired Owner',
        'Retired Team',
        ''
      ),
      new LeagueRosterDTO(
        rosterId,
        'unable_to_find',
        [],
        [],
        [],
        new TeamMetrics(null)
      )
    );
  }

  /**
   * get team by user id
   * returns sleeper team data
   * @param userId user id
   */
  getTeamByUserId(userId: string): LeagueTeam {
    for (const team of this.leagueTeamDetails) {
      if (team.roster.ownerId === userId) {
        return team;
      }
    }
    return null;
  }

  /**
   * Convert draft capital objects into a list of name ids.
   * This will be used to filter name ids from players.
   * @param draftCapital array of draft capital
   */
  getDraftCapitalToNameId(draftCapital: DraftCapital[]): string[] {
    const nameIds = [];
    draftCapital.map(pick => {
      let pickString = '';
      if (pick.pick <= this.selectedLeague.totalRosters / 3) {
        pickString = 'early';
      } else if (pick.pick >= 2 * this.selectedLeague.totalRosters / 3) {
        pickString = 'late';
      } else {
        pickString = 'mid';
      }
      let rdString = null;
      switch (pick.round) {
        case 1: {
          rdString = '1stpi';
          break;
        }
        case 2: {
          rdString = '2ndpi';
          break;
        }
        case 3: {
          rdString = '3rdpi';
          break;
        }
        case 4: {
          rdString = '4thpi';
          break;
        }
      }
      if (rdString) {
        nameIds.push(`${pick.year}${pickString}${rdString}`);
      }
    });
    return nameIds;
  }

  /**
   * get league scoring format for league or return half ppr if no league is selected
   */
  getLeagueScoringFormat(): string {
    return this.selectedLeague?.getLeagueScoringFormat() || 'pts_half_ppr';
  }

  /**
   * get the display for the scoring formats for display purposes
   */
  getScoringFormatDisplay(): string {
    if (!this.selectedLeague) return 'Half PPR'
    switch (this.selectedLeague?.scoringFormat) {
      case LeagueScoringFormat.PPR:
        return 'PPR';
      case LeagueScoringFormat.STANDARD:
        return 'Standard';
      default:
        return 'Half PPR';
    }
  }

  /**
   * Generate playoffs from league matchups for leagues
   * Platforms: MFL & Flea Flicker
   * @param leagueMatchUps dict of all weeks matchups
   * @param teams teams in league
   * @param playoffStartWeek playoff start week
   * @param season season string
   * @returns 
   */
  private generatePlayoffsForLeague(leagueMatchUps: {}, teams: LeagueTeam[], playoffStartWeek: number, season: string): LeaguePlayoffMatchUpDTO[] {
    // process current match ups in playoffs
    let startRound = 1;
    const playoffMatchups: LeaguePlayoffMatchUpDTO[] = [];
    let existingMatchUps = [];
    let iter = playoffStartWeek;
    while (leagueMatchUps[iter] && leagueMatchUps[iter].length) {
      if (existingMatchUps.length > 0) {
        playoffMatchups.push(...this.formatPlayoffMatchUps(existingMatchUps, startRound - 1, true));
        existingMatchUps = [];
      }
      existingMatchUps = leagueMatchUps[iter];
      startRound++;
      iter++;
    }
    // TODO test this with active playoffs
    if (existingMatchUps.length > 0) {
      // -2 because start round starts at 1 and is in a while loop
      // for the left over round, format playoffs... use completed week to determine if round is completed or not
      playoffMatchups.push(...this.formatPlayoffMatchUps(existingMatchUps, startRound - 1, this.nflService.getCompletedWeekForSeason(season) >= playoffStartWeek + startRound - 2 ? true : false));
    }
    // generate extra match ups for missing rounds
    const playoffTeams = teams.slice().sort((a, b) => b.roster.teamMetrics.wins - a.roster.teamMetrics.wins || b.roster.teamMetrics.fpts - a.roster.teamMetrics.fpts).slice(0, 6);
    if (startRound <= 1) {
      playoffMatchups.push(new LeaguePlayoffMatchUpDTO(null).createMockPlayoffMatchUp(playoffTeams[5].roster.rosterId, playoffTeams[2].roster.rosterId, 0, 1));
      playoffMatchups.push(new LeaguePlayoffMatchUpDTO(null).createMockPlayoffMatchUp(playoffTeams[4].roster.rosterId, playoffTeams[3].roster.rosterId, 1, 1));
    }
    if (startRound <= 2) {
      playoffMatchups.push(new LeaguePlayoffMatchUpDTO(null).createMockPlayoffMatchUp(playoffTeams[0].roster.rosterId, null, 2, 2));
      playoffMatchups.push(new LeaguePlayoffMatchUpDTO(null).createMockPlayoffMatchUp(playoffTeams[1].roster.rosterId, null, 3, 2));
      playoffMatchups.push(new LeaguePlayoffMatchUpDTO(null).createMockPlayoffMatchUp(null, null, 4, 2));
    }
    if (startRound <= 3) {
      playoffMatchups.push(new LeaguePlayoffMatchUpDTO(null).createMockPlayoffMatchUp(null, null, 5, 3));
      playoffMatchups.push(new LeaguePlayoffMatchUpDTO(null).createMockPlayoffMatchUp(null, null, 6, 3));
    }
    return playoffMatchups;
  }

  /**
   * Format match up into playoff match up object
   * @param matchUps League matchups array
   * @param round number for playoff round
   * @param isCompleted is week completed
   * @returns 
   */
  private formatPlayoffMatchUps(matchUps: LeagueTeamMatchUpDTO[], round: number, isCompleted: boolean): LeaguePlayoffMatchUpDTO[] {
    const playoffRoundMatchUp: LeaguePlayoffMatchUpDTO[] = [];
    ([...new Set(matchUps.map(game => game.matchupId))]).forEach(matchupId => {
      const matchUp = matchUps.filter(game => game.matchupId === matchupId);
      playoffRoundMatchUp.push(new LeaguePlayoffMatchUpDTO(null).fromLeagueMatchUp(matchUp[0], matchUp[1], round, isCompleted));
    });
    return playoffRoundMatchUp;
  }

  /**
   * Returns the number of playoff rounds for the league
   * @param numTeams teams in the playoffs
   * @returns 
   */
  getPlayoffRoundsCount(numTeams: number = this.selectedLeague.playoffTeams) {
    const numRounds = Math.floor(Math.log2(numTeams));
    const hasExtraRound = numTeams > Math.pow(2, numRounds);
    return numRounds + (hasExtraRound ? 1 : 0);
  }

  /**
   * open window to users league from dynasty daddy
   * @param LeagueId optional id to navigate to
   * @param platform optional platform id to use
   * @param year optional year to load
   */
  openLeague(leagueId: string = null, platform: LeaguePlatform = null, year: string = null): void {
    const leagueYear = year || this.selectedLeague?.season;
    const selectedLeagueId = leagueId || this.selectedLeague?.leagueId;
    const selectedPlatform = platform != null ? platform : this.selectedLeague?.leaguePlatform;
    switch (selectedPlatform) {
      case LeaguePlatform.MFL:
        window.open('https://www46.myfantasyleague.com/' + leagueYear + '/home/'
          + selectedLeagueId + '#0', '_blank');
        break;
      case LeaguePlatform.SLEEPER:
        window.open('https://sleeper.com/leagues/' + selectedLeagueId + '/team', '_blank');
        break;
      case LeaguePlatform.FLEAFLICKER:
        window.open('https://www.fleaflicker.com/nfl/leagues/' + selectedLeagueId, '_blank');
        break;
      case LeaguePlatform.ESPN:
        window.open('https://fantasy.espn.com/football/team?leagueId=' + selectedLeagueId + '&seasonId=' + leagueYear, '_blank');
        break;
      default:
        console.error('Unsupported League Platform', selectedPlatform);
    }
  }
}
