import {Injectable} from '@angular/core';
import {SleeperApiService} from './api/sleeper/sleeper-api.service';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {LeagueWrapper} from '../model/league/LeagueWrapper';
import {SleeperService} from './api/sleeper/sleeper.service';
import {MflService} from './api/mfl/mfl.service';
import {MflApiService} from './api/mfl/mfl-api.service';
import {LeaguePlayoffMatchUpDTO} from '../model/league/LeaguePlayoffMatchUpDTO';
import {LeagueTeam} from '../model/league/LeagueTeam';
import {LeagueRosterDTO} from '../model/league/LeagueRosterDTO';
import {LeagueRawDraftOrderDTO} from '../model/league/LeagueRawDraftOrderDTO';
import {LeagueOwnerDTO} from '../model/league/LeagueOwnerDTO';
import {TeamMetrics} from '../model/league/TeamMetrics';
import {FantasyPlatformDTO, LeaguePlatform} from '../model/league/FantasyPlatformDTO';
import {CompletedDraft} from '../model/league/CompletedDraft';
import {DraftCapital} from '../model/assets/DraftCapital';
import {LeagueDTO} from '../model/league/LeagueDTO';

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
    if (this.selectedLeague.leaguePlatform === LeaguePlatform.MFL) {
      return this.mflService.loadLeague$(new LeagueWrapper(this.selectedLeague))?.pipe(map((league) => {
        this.setServiceFromLeagueWrapper(league);
        this.mflApiService.getMFLPlayers(selectedLeague.season, selectedLeague.leagueId).subscribe((players) => {
          this.platformPlayersMap = players;
          return of(league);
        });
      }));
    } else {
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
    this.playoffMatchUps = league.playoffMatchUps;
  }

  /**
   * loads new user data from sleeper username
   * @param username user name
   * @param year string selected season
   */
  loadNewUser(username: string, year: string): Observable<any> {
    this.selectedYear = year;
    try {
      this.sleeperService.loadSleeperUser$(username, year).subscribe(leagueUser => {
        this.leagueUser = leagueUser;
        return of(leagueUser);
      });
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

}
