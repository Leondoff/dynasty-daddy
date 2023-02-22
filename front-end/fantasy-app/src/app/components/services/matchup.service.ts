import {Injectable} from '@angular/core';
import {MatchUpUI, ScheduleComp, WeeklyRecordComp} from '../model/matchup';
import {LeagueTeam} from '../../model/league/LeagueTeam';
import {ChartDataSets} from 'chart.js';
import {forkJoin, Observable, of, Subject} from 'rxjs';
import {LeagueDTO} from '../../model/league/LeagueDTO';
import { LeagueService } from 'src/app/services/league.service';

@Injectable({
  providedIn: 'root'
})
export class MatchupService {

  /** schedule comparisons */
  scheduleComparison: ScheduleComp[] = [];

  /** weekly record comparisons */
  weeklyComparison: WeeklyRecordComp[] = [];

  /** chart data for stength of schedule */
  strengthOfSchedule: ChartDataSets[] = [];

  /** array of array for each weeks matchups */
  leagueMatchUpUI: MatchUpUI[][] = [];

  /** List of weekly medians */
  leagueMedians: number[] = [];

  /** closest games */
  leagueClosestWins: MatchUpUI[] = [];

  /** subject when the matchups are loaded */
  matchUpsLoaded$: Subject<void> = new Subject<void>();

  /** most points for in week */
  leagueMostPointsFor: {rosterId: number, points: number, oppRosterId: number, oppPoints: number, details: MatchUpUI}[] = [];

  constructor(private leagueService: LeagueService) {}

  /**
   * initializes matchup data
   * @param selectedLeague selected League data
   */
  initMatchUpCharts(selectedLeague: LeagueDTO, completedWeek: number = null): Observable<any> {
    return forkJoin([this.generateWeeklyRecords(selectedLeague, completedWeek || selectedLeague.playoffStartWeek),
      this.generateScheduleComparison(selectedLeague),
      this.calculateLeagueMatchUps(selectedLeague)]).pipe(() => {
        this.matchUpsLoaded$.next();
        return of(true);
      }
    );

  }

  /**
   * helper to generate all weekly records
   * @param selectedLeague league data
   */
  generateWeeklyRecords(selectedLeague: LeagueDTO, completedWeek: number): Observable<any[]> {
    this.weeklyComparison = [];
    this.leagueService.leagueTeamDetails.map(it => it.roster.rosterId).forEach(rosterId => {
      this.weeklyComparison.push(this.calculateWeeklyRecordsForTeam(selectedLeague, rosterId, completedWeek));
    });
    return of(this.weeklyComparison);
  }

  /**
   * helper to generates schedule comparison
   * @param selectedLeague league data
   */
  generateScheduleComparison(selectedLeague: LeagueDTO): Observable<any[]> {
    this.scheduleComparison = [];
    this.leagueService.leagueTeamDetails.map(it => it.roster.rosterId).forEach(rosterId => {
      this.scheduleComparison.push(new ScheduleComp(rosterId, this.calculateScheduleForTeam(selectedLeague, rosterId)));
    });
    return of(this.scheduleComparison);
  }

  /**
   * calculates schedule comparison for team
   * @param selectedLeague league data
   * @param rosterId which roster is selected
   */
  private calculateScheduleForTeam(selectedLeague: LeagueDTO, rosterId: number): {} {
    const schedule = {};
    this.leagueService.leagueTeamDetails.map(it => it.roster.rosterId).forEach(selectedRosterId => {
      let wins = 0;
      let losses = 0;
      let ties = 0;
      for (let week = selectedLeague.startWeek - 1; week < selectedLeague.playoffStartWeek; week++) {
        let matchUpId = 0;
        let teamPoints = 0;
        let totalPoints = 0;
        if (selectedLeague.leagueMatchUps && selectedLeague.leagueMatchUps[week] !== undefined) {
          // find matchup id and points scored for team
          for (const matchup of selectedLeague.leagueMatchUps[week]) {
            totalPoints += matchup.points;
            if (matchup.rosterId === selectedRosterId) {
              matchUpId = matchup.matchupId;
            }
            if (matchup.rosterId === rosterId) {
              teamPoints = matchup.points;
            }
          }
          // find match up opponent and compare
          for (const opponent of selectedLeague.leagueMatchUps[week]) {
            if (matchUpId === opponent.matchupId && opponent.rosterId !== selectedRosterId) {
              if (opponent.points > teamPoints) {
                losses++;
              } else if (opponent.points < teamPoints) {
                wins++;
              } else if (teamPoints !== 0) {
                if (opponent.rosterId === rosterId) {
                  if (totalPoints / selectedLeague.totalRosters > teamPoints) {
                    losses++;
                  } else if (totalPoints / selectedLeague.totalRosters <= teamPoints) {
                    wins++;
                  }
                } else {
                  ties++;
                }
              }
              break;
            }
          }
        }
      }
      schedule[selectedRosterId] = [wins, losses, ties];
    });
    return schedule;
  }

  /**
   * creates league match ups objects for playoff calculator
   * @param selectedLeague league data
   */
  private calculateLeagueMatchUps(selectedLeague: LeagueDTO): Observable<any[][]> {
    const allWeeksMatchUps = [];
    const weekNumbers = Number(selectedLeague.season) < 2021 ? 17 : 18;
    for (let week = selectedLeague.startWeek; week < weekNumbers; week++) {
      if (selectedLeague.leagueMatchUps && selectedLeague.leagueMatchUps[week] !== undefined) {
        const weekMatchUps: MatchUpUI[] = [];
        [...new Set( selectedLeague.leagueMatchUps[week].map(game => game.matchupId))].forEach(matchupId => {
          for (const team1 of selectedLeague.leagueMatchUps[week]) {
            if (team1.matchupId === matchupId) {
              selectedLeague.leagueMatchUps[week].map(team2 => {
                if (team2.matchupId === matchupId && team2.rosterId !== team1.rosterId) {
                  return weekMatchUps.push(new MatchUpUI(week, team1, team2));
                }
              });
              break;
            }
          }
        });
        allWeeksMatchUps.push(weekMatchUps);
      }
    }
    this.leagueMatchUpUI = allWeeksMatchUps;
    return of(this.leagueMatchUpUI);
  }

  /**
   * calculate Weekly records for team
   * @param selectedLeague league data
   * @param rosterId selected roster
   * @private
   */
  private calculateWeeklyRecordsForTeam(selectedLeague: LeagueDTO, rosterId: number, completedWeek: number): WeeklyRecordComp {
    const weeklyRecords = {};
    let totalWins = 0;
    let totalLosses = 0;
    let totalTies = 0;
    for (let week = selectedLeague.startWeek; week < selectedLeague.playoffStartWeek; week++) {
      let wins = 0;
      let losses = 0;
      let ties = 0;
      if (selectedLeague.leagueMatchUps && selectedLeague.leagueMatchUps[week] !== undefined && week <= completedWeek) {
        const teamPoints = selectedLeague.leagueMatchUps[week]?.filter(matchup => {
          return matchup.rosterId === rosterId;
        })[0]?.points;
        for (const matchup of selectedLeague.leagueMatchUps[week]) {
          if (matchup.rosterId !== rosterId) {
            if (matchup.points > teamPoints) {
              totalLosses++;
              losses++;
            } else if (matchup.points < teamPoints) {
              totalWins++;
              wins++;
            } else if (matchup.points !== 0 && teamPoints !== 0) {
              totalTies++;
              ties++;
            }
          }
        }
      }
      weeklyRecords[week] = [wins, losses, ties];
    }
    return new WeeklyRecordComp(rosterId, weeklyRecords, totalWins, totalLosses, totalTies);
  }

  /**
   * get team display name
   * @param col col number
   * @param teams team list
   */
  getTeamName(col: string | number, teams: LeagueTeam[]): string {
    for (const team of teams) {
      if (team.roster.rosterId.toString() === col.toString()) {
        return team.owner?.teamName;
      }
    }
  }

  /**
   * sort the matchups by closest wins
   * @param startWeek
   * @param endWeek
   */
  getClosestWins(startWeek: number, endWeek: number): void {
    const closestWins = [];
    for (let i = 0; i < endWeek - startWeek; i++) {
      this.leagueMatchUpUI[i]?.map(matchUp => {
        closestWins.push(matchUp);
      });
    }
    closestWins.sort((a, b) => {
      return (Math.abs(a.team2Points - a.team1Points)) - (Math.abs(b.team2Points - b.team1Points));
    });
    this.leagueClosestWins = closestWins.slice(0, 7);
  }

  /**
   * sort matches by most points in a week
   * @param startWeek
   * @param endWeek
   */
  getMostPointsForInWeek(startWeek: number, endWeek: number): void {
    const mostPointsFor = [];
    for (let i = 0; i < endWeek - startWeek; i++) {
      this.leagueMatchUpUI[i]?.map(matchUp => {
        mostPointsFor.push({rosterId: matchUp.team1RosterId, points: matchUp.team1Points,
          oppRosterId: matchUp.team2RosterId, oppPoints: matchUp.team2Points, details: matchUp});
        mostPointsFor.push({rosterId: matchUp.team2RosterId, points: matchUp.team2Points,
          oppRosterId: matchUp.team1RosterId, oppPoints: matchUp.team1Points, details: matchUp});
      });
    }
    mostPointsFor.sort((a, b) => {
      return b.points - a.points;
    });
    this.leagueMostPointsFor = mostPointsFor.splice(0, 7);
  }

  /**
   * reset standings arrays
   */
  reset(): void {
    this.weeklyComparison = [];
    this.scheduleComparison = [];
    this.leagueMatchUpUI = [];
    this.leagueMedians = [];
    this.leagueClosestWins = [];
    this.leagueMostPointsFor = [];
  }
}
