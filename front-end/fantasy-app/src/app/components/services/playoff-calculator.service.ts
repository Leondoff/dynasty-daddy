import { Injectable } from '@angular/core';
import { LeagueTeam } from '../../model/league/LeagueTeam';
import { Division, MatchUpProbability, SimulatedTeamInfo } from '../model/playoffCalculator';
import { PowerRankingsService } from './power-rankings.service';
import { MatchupService } from './matchup.service';
import { MatchUpUI } from '../model/matchup';
import { LeagueService } from '../../services/league.service';
import { NflService } from '../../services/utilities/nfl.service';
import { cumulativeStdNormalProbability, mean, median, standardDeviation, zScore } from 'simple-statistics';
import { Observable, of } from 'rxjs';
import { LeaguePlayoffMatchUpDTO } from '../../model/league/LeaguePlayoffMatchUpDTO';
import { LeagueDTO } from "../../model/league/LeagueDTO";
import { TeamPowerRanking } from '../model/powerRankings';

@Injectable({
  providedIn: 'root'
})
export class PlayoffCalculatorService {

  /** division objects */
  divisions: Division[] = [];

  /** array of arrays of match ups with prob */
  matchUpsWithProb: MatchUpProbability[][] = [];

  /** team odds dict of object with proj wins and proj losses based on roster id key */
  teamsProjectedRecord = {};

  /** team Prob values by roster id */
  teamRatingsPValues = {};

  /** odds values by roster id */
  teamPlayoffOdds = {};

  /** how many selected wins by roster id, used for season table record */
  selectedGameResults = {};

  /** median win probability for each team based on median of team rank 6 and 7 */
  medianWinProbability = {};

  /** force show records of teams on table if game results are selected */
  forceShowRecord: boolean = false;

  /** total number of simulations, if changed make sure to update percentage function */
  NUMBER_OF_SIMULATIONS = 10000;

  /** forecast model from radio group */
  forecastModel: ForecastTypes = ForecastTypes.ADP_STARTER;

  constructor(
    private leagueService: LeagueService,
    private powerRankingsService: PowerRankingsService,
    private matchUpService: MatchupService,
    private nflService: NflService
  ) {
  }

  /**
   * calculate games with probability
   */
  calculateGamesWithProbability(week: number): void {
    // get mean of team ratings
    const ratings = this.powerRankingsService.powerRankings.map(team => {
      return this.forecastModel === ForecastTypes.ADP_STARTER ? team.adpValueStarter : team.eloAdpValueStarter;
    });
    const meanRating = mean(ratings);

    // get standard deviation of team ratings
    const stdRating = standardDeviation(ratings);

    // get z scores and p values for each team
    for (const team of this.powerRankingsService.powerRankings) {
      const starterValue = this.forecastModel === ForecastTypes.ADP_STARTER ? team.adpValueStarter : team.eloAdpValueStarter;
      const teamZ = zScore(starterValue, meanRating, stdRating);
      this.teamRatingsPValues[team.team.roster.rosterId] = cumulativeStdNormalProbability(teamZ);
    }
    // generate mean value score and save it to position 0 of dict
    this.medianWinProbability = this.generateMedianProbabilities(meanRating, stdRating);
    this.matchUpsWithProb = this.generateMatchUpsWithProb();
    this.teamsProjectedRecord = this.getProjectedRecord(week);
    this.teamPlayoffOdds = this.generatePlayoffOdds(week);
  }

  /**
 * calculate games with probability
 */
  mockSimulationOfASeason(mockPowerRankings: TeamPowerRanking[], week: number): {odds: {}, projectedRecord: {}} {
    // get mean of team ratings
    const ratings = mockPowerRankings.map(team => {
      return team.adpValueStarter;
    });
    const meanRating = mean(ratings);

    // get standard deviation of team ratings
    const stdRating = standardDeviation(ratings);

    let teamPValues = {};

    // get z scores and p values for each team
    for (const team of mockPowerRankings) {
      const starterValue = team.adpValueStarter;
      const teamZ = zScore(starterValue, meanRating, stdRating);
      teamPValues[team.team.roster.rosterId] = cumulativeStdNormalProbability(teamZ);
    }
    // generate mean value score and save it to position 0 of dict
    const medianPValues = this.generateMedianProbabilities(meanRating, stdRating, teamPValues);
    const matchups = this.generateMatchUpsWithProb(teamPValues);
    const projectedRecord = this.getProjectedRecord(week, matchups, medianPValues);
    return {odds: this.generatePlayoffOdds(week, teamPValues, matchups, 1000), projectedRecord};
  }

  /**
   * generates probabilities for matchups and stores matchup object with it
   * @private
   */
  private generateMatchUpsWithProb(teamRatingsPValues: {} = this.teamRatingsPValues): any[] {
    const matchups = [];
    this.matchUpService.leagueMatchUpUI.map(weekMatchups => {
      const games: MatchUpProbability[] = [];
      weekMatchups.map(matchup => {
        matchup.selectedWinner = 0;
        matchup.selectedTeam1MedianWin = 0;
        matchup.selectedTeam2MedianWin = 0;
        games.push(this.getProbabilityForGame(matchup, teamRatingsPValues));
      });
      matchups.push(games);
    });
    return matchups;
  }

  /**
   * get probability for each match up
   * @param matchup array of arrays of match up prob
   */
  private getProbabilityForGame(matchup: MatchUpUI, teamRatingsPValues: {} = this.teamRatingsPValues): MatchUpProbability {
    const team1Prob = 0.5 + (teamRatingsPValues[matchup.team1RosterId] - teamRatingsPValues[matchup.team2RosterId]) / 2;
    const team2Prob = 0.5 + (teamRatingsPValues[matchup.team2RosterId] - teamRatingsPValues[matchup.team1RosterId]) / 2;
    return new MatchUpProbability(
      matchup,
      this.getPercent(team1Prob),
      this.getPercent(team2Prob)
    );
  }

  /**
   * calculates projected record based on points
   */
  private getProjectedRecord(startWeek: number = this.getStartWeek(),
    matchUpsWithProb: MatchUpProbability[][] = this.matchUpsWithProb,
    medianWinProbability: {} = this.medianWinProbability): {} {
    const teamsProjectedRecord = {};
    this.leagueService.leagueTeamDetails.map(it => it.roster.rosterId).forEach(rosterId => {
      let totalWins = 0;
      let projectedWeeks = 0;
      let selectedWins = 0;
      let selectedLosses = 0;
      let totalMedianWins = 0;
      let selectedMedianWins = 0;
      let selectedMedianLosses = 0;
      for (let week = startWeek - this.leagueService.selectedLeague.startWeek;
        week < this.leagueService.selectedLeague.playoffStartWeek - this.leagueService.selectedLeague.startWeek; week++) {
        projectedWeeks++;
        matchUpsWithProb[week]?.map(matchUp => {
          if (matchUp.matchUpDetails.team1RosterId === rosterId) {
            if (matchUp.matchUpDetails.selectedWinner === 0) {
              totalWins += matchUp.team1Prob;
              if (this.leagueService.selectedLeague.medianWins) {
                totalMedianWins += medianWinProbability[rosterId].meanProb;
              }
            } else if (matchUp.matchUpDetails.selectedWinner === 1) {
              selectedWins++;
              projectedWeeks--;
              if (this.leagueService.selectedLeague.medianWins) {
                matchUp.matchUpDetails.selectedTeam1MedianWin === 1
                  ? selectedMedianWins++ : selectedMedianLosses++;
              }
            } else if (matchUp.matchUpDetails.selectedWinner === 2) {
              selectedLosses++;
              projectedWeeks--;
              if (this.leagueService.selectedLeague.medianWins) {
                matchUp.matchUpDetails.selectedTeam1MedianWin === 1
                  ? selectedMedianWins++ : selectedMedianLosses++;
              }
            }
            return;
          } else if (matchUp.matchUpDetails.team2RosterId === rosterId) {
            if (matchUp.matchUpDetails.selectedWinner === 0) {
              totalWins += matchUp.team2Prob;
              if (this.leagueService.selectedLeague.medianWins) {
                totalMedianWins += medianWinProbability[rosterId].meanProb;
              }
            } else if (matchUp.matchUpDetails.selectedWinner === 2) {
              selectedWins++;
              projectedWeeks--;
              if (this.leagueService.selectedLeague.medianWins) {
                matchUp.matchUpDetails.selectedTeam2MedianWin === 1
                  ? selectedMedianWins++ : selectedMedianLosses++;
              }
            } else if (matchUp.matchUpDetails.selectedWinner === 1) {
              selectedLosses++;
              projectedWeeks--;
              if (this.leagueService.selectedLeague.medianWins) {
                matchUp.matchUpDetails.selectedTeam2MedianWin === 1
                  ? selectedMedianWins++ : selectedMedianLosses++;
              }
            }
            return;
          }
        });
      }
      const winsAtDate = this.getWinsAtWeek(rosterId, startWeek - 1);
      const lossesAtDate = this.getLossesAtWeek(rosterId, startWeek - 1);
      this.selectedGameResults[rosterId] = {
        selectedWins,
        selectedLosses,
        selectedMedianWins,
        selectedMedianLosses,
      };
      // if median league than double the amount of projected games to take into account
      // if (this.leagueService.selectedLeague.medianWins) { projectedWeeks *= 2; }
      teamsProjectedRecord[rosterId] = {
        projWins: winsAtDate.wins + selectedWins + Math.round(totalWins / 100),
        projLoss: lossesAtDate.losses + selectedLosses + projectedWeeks - Math.round(totalWins / 100),
        medianWins: winsAtDate.medianWins + selectedMedianWins + Math.round(totalMedianWins / 100),
        medianLoss: lossesAtDate.medianLosses + selectedMedianLosses + projectedWeeks - Math.round(totalMedianWins / 100)
      };
    });
    return teamsProjectedRecord;
  }

  /**
   * get number of wins at a current week in the past
   * TODO maybe move to separate service?
   * @param rosterId
   * @param endWeek
   */
  getWinsAtWeek(rosterId: number, endWeek: number, matchUpsWithProb: MatchUpProbability[][] = this.matchUpsWithProb): { totalWins: number, wins: number, medianWins: number } {
    let wins = 0;
    let medianWins = 0;
    for (let i = 0; i <= endWeek - this.leagueService.selectedLeague.startWeek; i++) {
      const medianValue = this.leagueService.selectedLeague.medianWins ? this.getMedianPointsForWeek(matchUpsWithProb[i]) : 0;
      matchUpsWithProb[i]?.map(matchUp => {
        if (matchUp.matchUpDetails.team1RosterId === rosterId) {
          if (matchUp.matchUpDetails.team1Points > matchUp.matchUpDetails.team2Points) {
            wins++;
          }
          if (this.leagueService.selectedLeague.medianWins && matchUp.matchUpDetails.team1Points >= medianValue) {
            medianWins++;
          }
        } else if (matchUp.matchUpDetails.team2RosterId === rosterId) {
          if (matchUp.matchUpDetails.team2Points > matchUp.matchUpDetails.team1Points) {
            wins++;
          }
          if (this.leagueService.selectedLeague.medianWins && matchUp.matchUpDetails.team2Points >= medianValue) {
            medianWins++;
          }
        }
      });
    }
    return { totalWins: wins + medianWins, wins, medianWins };
  }

  /**
   * get number of losses at a current week in the past
   * TODO maybe move to separate service?
   * @param rosterId
   * @param endWeek
   */
  getLossesAtWeek(rosterId: number, endWeek: number, matchUpsWithProb: MatchUpProbability[][] = this.matchUpsWithProb): { totalLosses: number, losses: number, medianLosses: number } {
    let losses = 0;
    let medianLosses = 0;
    for (let i = 0; i <= endWeek - this.leagueService.selectedLeague.startWeek; i++) {
      const medianValue = this.leagueService.selectedLeague.medianWins ? this.getMedianPointsForWeek(matchUpsWithProb[i]) : 0;
      matchUpsWithProb[i]?.map(matchUp => {
        if (matchUp.matchUpDetails.team1RosterId === rosterId) {
          if (matchUp.matchUpDetails.team1Points < matchUp.matchUpDetails.team2Points) {
            losses++;
          }
          if (this.leagueService.selectedLeague.medianWins && matchUp.matchUpDetails.team1Points < medianValue) {
            medianLosses++;
          }
        } else if (matchUp.matchUpDetails.team2RosterId === rosterId) {
          if (matchUp.matchUpDetails.team2Points < matchUp.matchUpDetails.team1Points) {
            losses++;
          }
          if (this.leagueService.selectedLeague.medianWins && matchUp.matchUpDetails.team2Points < medianValue) {
            medianLosses++;
          }
        }
      });
    }
    return { totalLosses: losses + medianLosses, losses, medianLosses };
  }

  /**
   * return number as a rounded percent
   * @param num
   * @private
   */
  private getPercent(num: number): number {
    return Math.round(num * 100);
  }

  /**
   * generate league divisions
   * TODO create standings service for this since it doesn't relate
   * @param league league data
   * @param teams fantasy teams
   */
  generateDivisions(league: LeagueDTO, teams: LeagueTeam[]): Observable<any> {
    if (this.divisions?.length === 0) {
      if (league.divisions && league.divisions > 1) {
        for (let i = 0; i < league.divisions; i++) {
          const divisionTeams: LeagueTeam[] = [];
          for (const team of teams) {
            if (team.roster.teamMetrics.division === i + 1) {
              divisionTeams.push(team);
            }
          }
          divisionTeams.sort((a, b) => {
            return a.roster.teamMetrics.rank - b.roster.teamMetrics.rank || b.roster.teamMetrics.wins - a.roster.teamMetrics.wins
              || b.roster.teamMetrics.fpts - a.roster.teamMetrics.fpts;
          });
          this.divisions.push(new Division(i + 1, divisionTeams));
        }
      } else {
        const allTeams = teams.slice();
        allTeams.sort((a, b) => {
          return a.roster.teamMetrics.rank - b.roster.teamMetrics.rank || b.roster.teamMetrics.wins - a.roster.teamMetrics.wins
            || b.roster.teamMetrics.fpts - a.roster.teamMetrics.fpts;
        });
        if (allTeams[0] && allTeams[0].roster.teamMetrics.rank === 0) {
          for (let i = 0; i < allTeams.length; i++) {
            allTeams[i].roster.teamMetrics.rank = i + 1;
          }
        }
        this.divisions.push(new Division(1, allTeams));
        league.divisions = 1;
      }
    }
    return of(this.divisions);
  }

  /**
   * resets division data
   */
  reset(): void {
    this.divisions = [];
    this.matchUpsWithProb = [];
    this.teamPlayoffOdds = {};
    this.teamsProjectedRecord = {};
    this.teamRatingsPValues = {};
    this.selectedGameResults = {};
    this.medianWinProbability = {};
    this.forceShowRecord = false;
  }

  /**
   * update season odds handler may remove later if unnecessary
   * @param value
   */
  updateSeasonOdds(selectedWeek?: number): void {
    this.teamsProjectedRecord = this.getProjectedRecord(selectedWeek);
    this.teamPlayoffOdds = this.generatePlayoffOdds(selectedWeek);
  }

  /**
   * get Division by Roster id
   * @param rosterId
   */
  getDivisionByRosterId(rosterId: number): Division {
    for (const division of this.divisions) {
      for (const team of division.teams) {
        if (team.roster.rosterId === rosterId) {
          return division;
        }
      }
    }
    return null;
  }

  /**
   * simulate regular season from week
   * @param startWeek week number to start simulation from
   * @private
   */
  private simulateRegularSeason(startWeek: number, matchUpsWithProb: MatchUpProbability[][] = this.matchUpsWithProb): SimulatedTeamInfo[] {
    const wins = [];
    // simulate regular season
    this.leagueService.leagueTeamDetails.map(it => it.roster.rosterId).forEach(rosterId => {
      let totalWins = 0;
      let timesTeamWonOut = 0;
      for (let week = startWeek; week < this.leagueService.selectedLeague.playoffStartWeek; week++) {
        matchUpsWithProb[week - this.leagueService.selectedLeague.startWeek]?.map(matchUp => {
          if (matchUp.matchUpDetails.team1RosterId === rosterId) {
            // check if game was manually selected
            if (matchUp.matchUpDetails.selectedWinner === 0) {
              // randomly select winner
              if (this.getRandomInt(100) < matchUp.team1Prob) {
                totalWins++;
              }
              if (this.leagueService.selectedLeague.medianWins && this.getRandomInt(100) < this.medianWinProbability[rosterId].meanProb) {
                totalWins++;
              }
            } else if (matchUp.matchUpDetails.selectedWinner !== 0) {
              if (matchUp.matchUpDetails.selectedWinner === 1) {
                totalWins++;
              }
              if (matchUp.matchUpDetails.selectedTeam1MedianWin === 1) {
                totalWins++;
              }
            }
            return;
          } else if (matchUp.matchUpDetails.team2RosterId === rosterId) {
            // check if game was manually selected
            if (matchUp.matchUpDetails.selectedWinner === 0) {
              // randomly generate winner based on prob
              if (this.getRandomInt(100) < matchUp.team2Prob) {
                totalWins++;
              }
              if (this.leagueService.selectedLeague.medianWins && this.getRandomInt(100) < this.medianWinProbability[rosterId].meanProb) {
                totalWins++;
              }
            } else if (matchUp.matchUpDetails.selectedWinner !== 0) {
              if (matchUp.matchUpDetails.selectedWinner === 2) {
                totalWins++;
              }
              if (matchUp.matchUpDetails.selectedTeam2MedianWin === 1) {
                totalWins++;
              }
            }
            return;
          }
        });
      }
      if (totalWins >= (this.leagueService.selectedLeague.playoffStartWeek - startWeek)
        * (this.leagueService.selectedLeague.medianWins ? 2 : 1)
      ) {
        timesTeamWonOut += 1;
      }
      wins.push({
        rosterId: rosterId,
        team: this.leagueService.getTeamByRosterId(rosterId),
        projWins: totalWins,
        timesTeamWonOut
      });
    });
    return wins;
  }

  /**
   * simulate division winners by record
   * @param wins array of simulated record
   * @private
   */
  private simulateDivisionWinners(wins: SimulatedTeamInfo[], teamRatingsPValues: {} = this.teamRatingsPValues): SimulatedTeamInfo[] {
    // division winners to filter out if applicable
    const divisionWinners = [];

    this.divisions.map(division => {
      let divWinnerTeam = null;
      let numOfwins = 0;
      division.teams.map(team => {
        for (const teamWins of wins) {
          if (divWinnerTeam) {
            if (numOfwins < teamWins.projWins && teamWins.team.roster.rosterId === team.roster.rosterId) {
              divWinnerTeam = teamWins;
              numOfwins = teamWins.projWins;
              break;
            } else if (numOfwins === teamWins.projWins && teamWins.team.roster.rosterId === team.roster.rosterId
              && divWinnerTeam.team.roster.rosterId !== teamWins.team.roster.rosterId) {
              divWinnerTeam = this.calculateTieBreaker([divWinnerTeam, teamWins], teamRatingsPValues);
            }
          } else {
            if (team.roster.rosterId === teamWins.team.roster.rosterId) {
              divWinnerTeam = teamWins;
              numOfwins = teamWins.projWins;
              break;
            }
          }
        }
      });
      divisionWinners.push(divWinnerTeam);
    });

    return divisionWinners;
  }

  /**
   * simulate round of playoff and returns advanced teams
   * @param playoffTeams array of teams
   * @private
   */
  private simulateRoundOfPlayoffs(playoffTeams: SimulatedTeamInfo[],
    teamRatingsPValues: {} = this.teamRatingsPValues): SimulatedTeamInfo[] {
    // is the format 2 games or 1 game per round
    const gamesPerRound = this.leagueService.selectedLeague.playoffRoundType === 2 ? 2 : 1;
    // initialize array of advancing teams
    const advancingTeams: SimulatedTeamInfo[] = [];
    for (let i = 0; i < playoffTeams.length / 2; i++) {
      // get two teams facing off
      const team1 = playoffTeams[i];
      const team2 = playoffTeams[playoffTeams.length - 1 - i];

      // get prob team 1 wins
      const team1WinsOdds = Math.round((0.5 + (teamRatingsPValues[team1.team.roster.rosterId]
        - teamRatingsPValues[team2.team.roster.rosterId]) / 2) * 100);

      // handles 1 game per round format
      if (gamesPerRound === 1) {
        if (this.getRandomInt(100) < team1WinsOdds) {
          advancingTeams.push(team1);
        } else {
          advancingTeams.push(team2);
        }
      } else {
        // handles 2 games per round playoff format
        let team1Wins = 0;
        let team2Wins = 0;
        for (let round = 0; round < gamesPerRound; round++) {
          if (this.getRandomInt(100) < team1WinsOdds) {
            team1Wins++;
          } else {
            team2Wins++;
          }
        }
        if (team1Wins === team2Wins) {
          if (this.getRandomInt(100) < team1WinsOdds) {
            advancingTeams.push(team1);
          } else {
            advancingTeams.push(team2);
          }
        } else if (team1Wins === gamesPerRound) {
          advancingTeams.push(team1);
        } else {
          advancingTeams.push(team2);
        }
      }
    }
    return advancingTeams;
  }

  /**
   * handles add/removing teams from teams left
   * @param teamsLeft current array
   * @param matchup matchup to process
   * @private
   */
  private processTeamsLeft(teamsLeft: number[], matchup: LeaguePlayoffMatchUpDTO): number[] {
    if (matchup.win === null && matchup.loss === null) {
      return teamsLeft;
    }
    if (matchup.win === matchup.team1) {
      if (!teamsLeft.includes(matchup.team1)) {
        teamsLeft.push(matchup.team1);
      }
      if (teamsLeft.includes(matchup.team2)) {
        teamsLeft.splice(teamsLeft.indexOf(matchup.team2), 1);
      }
    } else {
      if (!teamsLeft.includes(matchup.team2)) {
        teamsLeft.push(matchup.team2);
      }
      if (teamsLeft.includes(matchup.team1)) {
        teamsLeft.splice(teamsLeft.indexOf(matchup.team1), 1);
      }
    }
    return teamsLeft;
  }

  /**
   * update playoff odds for week in the playoffs
   * @param startWeek
   */
  private updatePlayoffOdds(startWeek: number,
    teamRatingsPValues: {} = this.teamRatingsPValues,
    simulatedPlayoffOdds: {},
    numberOfSimulations: number = this.NUMBER_OF_SIMULATIONS): {} {
    // teams that haven't lost yet
    const teamsLeft = [];

    // eliminated teams used to check with matchup is winners bracket
    const teamsEliminated = [];

    // currently selected round of the playoffs
    const playOffRounds = this.leagueService.getPlayoffRoundsCount();
    let weekDiff = startWeek - this.leagueService.selectedLeague.playoffStartWeek + 1;
    if (weekDiff > playOffRounds) {
      weekDiff = playOffRounds + 1
    }

    // teams that have a bye for the simulation
    const byeWeekTeams = [];

    // how many games per selected rd for array length
    let gamesThisRd = 0;

    // calculate current state of playoffs
    // we loop through the games up to three rounds of playoffs
    // we have to check if they are the first round at each step
    this.leagueService.playoffMatchUps.map((matchup) => {
      if (matchup.round === weekDiff && (!teamsEliminated.includes(matchup.team1) || !teamsEliminated.includes(matchup.team2))) {
        gamesThisRd++;
      }
      if (simulatedPlayoffOdds[matchup.team1] && simulatedPlayoffOdds[matchup.team2] && matchup.round <= weekDiff) {
        if (matchup.round === playOffRounds - 2) {
          teamsLeft.push(matchup.win);
          teamsEliminated.push(matchup.loss);
          simulatedPlayoffOdds[matchup.team1].timesMakingPlayoffs = numberOfSimulations;
          simulatedPlayoffOdds[matchup.team2].timesMakingPlayoffs = numberOfSimulations;
        } else if (matchup.round === playOffRounds - 1 &&
          (matchup.round === 1 || matchup.round > 1 &&
            (teamsLeft.includes(matchup.team1) || teamsLeft.includes(matchup.team2)))
        ) {
          if (matchup.round > 1) {
            this.processTeamsLeft(teamsLeft, matchup);
          } else {
            teamsLeft.push(matchup.win);
          }
          if (matchup.loss) {
            teamsEliminated.push(matchup.loss);
          }
          simulatedPlayoffOdds[matchup.team1].timesMakingPlayoffs = numberOfSimulations;
          simulatedPlayoffOdds[matchup.team2].timesMakingPlayoffs = numberOfSimulations;
          simulatedPlayoffOdds[matchup.team1].timesMakeConfRd = numberOfSimulations;
          simulatedPlayoffOdds[matchup.team2].timesMakeConfRd = numberOfSimulations;
        } else if (matchup.round === playOffRounds && (matchup.round === 1 || matchup.round > 1 && (teamsLeft.includes(matchup.team1) || teamsLeft.includes(matchup.team2)))) {
          if (matchup.round > 1) {
            this.processTeamsLeft(teamsLeft, matchup);
          } else {
            teamsLeft.push(matchup.win);
          }
          if (matchup.loss) {
            teamsEliminated.push(matchup.loss);
          }
          simulatedPlayoffOdds[matchup.team1].timesMakeChampionship = numberOfSimulations;
          simulatedPlayoffOdds[matchup.team2].timesMakeChampionship = numberOfSimulations;
          if (weekDiff > playOffRounds && matchup.loss !== null) {
            if (!teamsEliminated.includes(matchup.team1)) {
              simulatedPlayoffOdds[matchup.team1].timesWinChampionship = numberOfSimulations;
            } else {
              simulatedPlayoffOdds[matchup.team2].timesWinChampionship = numberOfSimulations;
            }
          }
        }
      }
      // process teams with a bye round 1 and update table
      if (weekDiff === 1 && matchup.round === 2) {
        if (matchup.team1 && !teamsLeft.includes(matchup.team1) && !teamsEliminated.includes(matchup.team1)) {
          teamsLeft.push(matchup.team1);
          byeWeekTeams.push({ team: this.leagueService.getTeamByRosterId(matchup.team1), projWins: 0 });
          simulatedPlayoffOdds[matchup.team1].timesMakingPlayoffs = numberOfSimulations;
          simulatedPlayoffOdds[matchup.team1].timesMakeConfRd = numberOfSimulations;
        }
        if (matchup.team2 && !teamsLeft.includes(matchup.team2) && !teamsEliminated.includes(matchup.team2)) {
          teamsLeft.push(matchup.team2);
          byeWeekTeams.push({ team: this.leagueService.getTeamByRosterId(matchup.team2), projWins: 0 });
          simulatedPlayoffOdds[matchup.team2].timesMakingPlayoffs = numberOfSimulations;
          simulatedPlayoffOdds[matchup.team2].timesMakeConfRd = numberOfSimulations;
        }
      }
    });

    let simulatedTeamRd: SimulatedTeamInfo[] = Array(gamesThisRd * 2).fill(null);

    let gameCount = 0;
    this.leagueService.playoffMatchUps.map((matchUp) => {
      if (matchUp.round === weekDiff && (!teamsEliminated.includes(matchUp.team1) || !teamsEliminated.includes(matchUp.team2))) {
        simulatedTeamRd[gameCount] = { team: this.leagueService.getTeamByRosterId(matchUp.team1), projWins: 0, timesWinOut: 0 };
        simulatedTeamRd[simulatedTeamRd.length - 1 - gameCount] = {
          team: this.leagueService.getTeamByRosterId(matchUp.team2),
          projWins: 0,
          timesWinOut: 0
        };
        gameCount++;
        if (gameCount === gamesThisRd) {
          return;
        }
      }
    });

    // TODO simplify work
    // simulate future rounds of the playoffs if they exist
    if (weekDiff <= playOffRounds - 2) {
      simulatedTeamRd = this.simulateRoundOfPlayoffs(simulatedTeamRd, teamRatingsPValues);
      // assign wins for conference
      for (const team of simulatedTeamRd) {
        if (simulatedPlayoffOdds[team.team.roster.rosterId]) {
          simulatedPlayoffOdds[team.team.roster.rosterId].timesMakeConfRd =
            (simulatedPlayoffOdds[team.team.roster.rosterId]?.timesMakeConfRd || 0) + 1;
        }
      }
      simulatedTeamRd = byeWeekTeams.concat(simulatedTeamRd.reverse());
    }
    if (weekDiff <= playOffRounds - 1) {
      simulatedTeamRd = this.simulateRoundOfPlayoffs(simulatedTeamRd, teamRatingsPValues);
      // assign making the championship
      for (const team of simulatedTeamRd) {
        if (simulatedPlayoffOdds[team.team.roster.rosterId]) {
          simulatedPlayoffOdds[team.team.roster.rosterId].timesMakeChampionship =
            (simulatedPlayoffOdds[team.team.roster.rosterId]?.timesMakeChampionship || 0) + 1;
        }
      }
    }
    if (weekDiff <= playOffRounds) {
      simulatedTeamRd = this.simulateRoundOfPlayoffs(simulatedTeamRd, teamRatingsPValues);
      // assign wins for championship
      for (const team of simulatedTeamRd) {
        if (simulatedPlayoffOdds[team.team.roster.rosterId]) {
          simulatedPlayoffOdds[team.team.roster.rosterId].timesWinChampionship =
            (simulatedPlayoffOdds[team.team.roster.rosterId]?.timesWinChampionship || 0) + 1;
        }
      }
    }
    return simulatedPlayoffOdds;
  }

  /**
   * simulate playoffs during the regular season
   * @param playoffTeams teams in playoff
   * @param numOfBye number of byes
   * @param simulatedPlayoffOdds dict of current simulation
   * @private
   */
  private simulatePlayoffs(playoffTeams: SimulatedTeamInfo[],
    numOfBye: number, teamRatingsPValues: {} = this.teamRatingsPValues,
    simulatedPlayoffOdds: {}): {} {
    // generate teams that advance each round
    const rounds = [];
    let teamsLeft = playoffTeams
    while (teamsLeft.length > 1) {
      // if first rd process byes
      if (teamsLeft.length === playoffTeams.length) {
        teamsLeft = playoffTeams.slice(0, numOfBye).concat(this.simulateRoundOfPlayoffs(teamsLeft.slice(numOfBye), teamRatingsPValues))
      } else {
        teamsLeft = this.simulateRoundOfPlayoffs(teamsLeft)
      }
      rounds.push(teamsLeft)
    }

    // award points for how far teams made
    rounds.reverse().forEach((teams, ind) => {
      switch (ind) {
        case 0: {
          for (const team of teams) {
            simulatedPlayoffOdds[team.team.roster.rosterId].timesWinChampionship =
              (simulatedPlayoffOdds[team.team.roster.rosterId]?.timesWinChampionship || 0) + 1;
          }
          break;
        }
        case 1: {
          for (const team of teams) {
            simulatedPlayoffOdds[team.team.roster.rosterId].timesMakeChampionship =
              (simulatedPlayoffOdds[team.team.roster.rosterId]?.timesMakeChampionship || 0) + 1;
          }
          break;
        }
        case 2: {
          for (const team of teams) {
            simulatedPlayoffOdds[team.team.roster.rosterId].timesMakeConfRd =
              (simulatedPlayoffOdds[team.team.roster.rosterId]?.timesMakeConfRd || 0) + 1;
          }
          break;
        }
        default: {
          // do nothing but might want to add another round
        }
      }
    });
    return simulatedPlayoffOdds;
  }

  /**
   * handles simulating one whole season including playoffs
   * @param startWeek
   */
  simulateOneSeason(startWeek: number = this.getStartWeek(),
    teamRatingsPValues: {} = this.teamRatingsPValues,
    simulatedPlayoffOdds: {},
    matchUpsWithProb: MatchUpProbability[][] = this.matchUpsWithProb): {} {

    // get simulated regular season wins per team
    const simulatedWins: SimulatedTeamInfo[] = this.simulateRegularSeason(startWeek, matchUpsWithProb);

    simulatedWins.forEach(wins => {
      wins.projWins += simulatedPlayoffOdds[wins.team.roster.rosterId].winsAtStartDate.totalWins;
      simulatedPlayoffOdds[wins.team.roster.rosterId].timesWonOut = wins.timesWinOut;
    });

    // determine worst record and update odds
    const worstTeam = this.determineWorstRecordTeam(simulatedWins, teamRatingsPValues);
    simulatedPlayoffOdds[worstTeam.team.roster.rosterId].timesWithWorstRecord += 1;

    // determine best record and update odds
    const bestTeam = this.determineBestTeamFromArray(simulatedWins, [], teamRatingsPValues);
    simulatedPlayoffOdds[bestTeam.team.roster.rosterId].timesWithBestRecord += 1;

    // determine number of bye weeks
    const numOfByeWeeks = this.leagueService.selectedLeague.playoffTeams % 2 === 0 ?
      this.leagueService.selectedLeague.playoffTeams % 4 : this.leagueService.selectedLeague.playoffTeams % 2;

    // number of spots available
    let numOfPlayoffSpotsLeft = this.leagueService.selectedLeague.playoffTeams;

    // division winners array
    let nonWildCardTeams: SimulatedTeamInfo[] = [];

    let simulatedPlayoffTeams: SimulatedTeamInfo[] = [];
    // if divisions calculate winner
    // determine division winner and bye
    if (this.divisions.length > 1) {
      // get array of division winners
      nonWildCardTeams = this.simulateDivisionWinners(simulatedWins, numOfByeWeeks);
      nonWildCardTeams.forEach(divTeam => {
        simulatedPlayoffOdds[divTeam.team.roster.rosterId].timesMakingPlayoffs =
          (simulatedPlayoffOdds[divTeam.team.roster.rosterId]?.timesMakingPlayoffs) + 1;
        simulatedPlayoffOdds[divTeam.team.roster.rosterId].timesWinningDivision =
          (simulatedPlayoffOdds[divTeam.team.roster.rosterId]?.timesWinningDivision) + 1;
      });
      // assign bye weeks TODO what if byes are greater than division winners?
      const byeWeekTeams = [];
      for (let i = 0; i < numOfByeWeeks; i++) {
        // get unique bye week team
        const byeWeekTeam = this.determineBestTeamFromArray(nonWildCardTeams, byeWeekTeams, teamRatingsPValues);
        simulatedPlayoffOdds[byeWeekTeam.team.roster.rosterId].timesWithBye =
          (simulatedPlayoffOdds[byeWeekTeam.team.roster.rosterId]?.timesWithBye || 0) + 1;
        byeWeekTeams.push(byeWeekTeam);
      }
      // subtract division winners to determine how many more wildcard spots there are
      numOfPlayoffSpotsLeft -= this.divisions.length;
    } else {
      // get byes for best teams since there is no divisions
      for (let i = 0; i < numOfByeWeeks; i++) {
        const byeWeekTeam = this.determineBestTeamFromArray(simulatedWins, nonWildCardTeams, teamRatingsPValues);
        simulatedPlayoffOdds[byeWeekTeam.team.roster.rosterId].timesWithBye =
          (simulatedPlayoffOdds[byeWeekTeam.team.roster.rosterId]?.timesWithBye || 0) + 1;
        simulatedPlayoffOdds[byeWeekTeam.team.roster.rosterId].timesMakingPlayoffs =
          (simulatedPlayoffOdds[byeWeekTeam.team.roster.rosterId]?.timesMakingPlayoffs || 0) + 1;
        nonWildCardTeams.push(byeWeekTeam);
      }
      numOfPlayoffSpotsLeft -= numOfByeWeeks;
    }

    // assign the last playoff spots
    for (let selectedTeamCount = 0; selectedTeamCount < numOfPlayoffSpotsLeft; selectedTeamCount++) {
      const wildcardTeam = this.determineBestTeamFromArray(simulatedWins, nonWildCardTeams.concat(simulatedPlayoffTeams), teamRatingsPValues);
      simulatedPlayoffOdds[wildcardTeam.team.roster.rosterId].timesMakingPlayoffs =
        (simulatedPlayoffOdds[wildcardTeam.team.roster.rosterId]?.timesMakingPlayoffs || 0) + 1;
      simulatedPlayoffTeams.push(wildcardTeam);
    }
    simulatedPlayoffTeams = nonWildCardTeams.concat(simulatedPlayoffTeams);
    // simulate playoffs
    return this.simulatePlayoffs(simulatedPlayoffTeams, numOfByeWeeks, teamRatingsPValues, simulatedPlayoffOdds);
  }

  /**
   * determines unique playoff team from array
   * @param simulatedTeams all teams to choose from
   * @param excludedTeams teams not to be selected (usually teams that already qualified before)
   * @private
   */
  private determineBestTeamFromArray(simulatedTeams: SimulatedTeamInfo[], excludedTeams: SimulatedTeamInfo[], teamRatingsPValues: {} = this.teamRatingsPValues): SimulatedTeamInfo {
    let selectedTeam = null;
    let maxWinTotal = 0;
    for (const simulatedTeam of simulatedTeams) {
      if (!excludedTeams.includes(simulatedTeam)) {
        if (!selectedTeam || simulatedTeam.projWins > maxWinTotal) {
          selectedTeam = simulatedTeam;
          maxWinTotal = simulatedTeam.projWins;
        } else if (simulatedTeam.projWins === maxWinTotal) {
          selectedTeam = this.calculateTieBreaker([selectedTeam, simulatedTeam], teamRatingsPValues);
        }
      }
    }
    return selectedTeam;
  }

  /**
   * calculates tie break scenario by simulating a match between the two teams
   * @param tiedTeams 2 tied teams
   * @private
   */
  private calculateTieBreaker(tiedTeams: SimulatedTeamInfo[], teamRatingsPValues: {} = this.teamRatingsPValues): SimulatedTeamInfo {
    const team1Prob = this.getPercent(0.5 + (teamRatingsPValues[tiedTeams[0].team.roster.rosterId]
      - teamRatingsPValues[tiedTeams[1].team.roster.rosterId]) / 2);
    if (this.getRandomInt(100) < team1Prob) {
      return tiedTeams[0];
    }
    return tiedTeams[1];
  }

  /**
   * generate playoffs odds
   * simulate 10000 seasons
   * @param startWeek
   */
  private generatePlayoffOdds(startWeek: number = this.getStartWeek(), 
  teamRatingsPValues: {} = this.teamRatingsPValues, 
  matchUpsWithProb: MatchUpProbability[][] = this.matchUpsWithProb,
  numberOfSimulations: number = this.NUMBER_OF_SIMULATIONS): {} {
    let simulatedPlayoffOdds = {}
    // initialize odds values
    for (const team of this.leagueService.leagueTeamDetails) {
      simulatedPlayoffOdds[team.roster.rosterId] = {
        timesMakingPlayoffs: 0,
        timesWinningDivision: 0,
        timesWithBye: 0,
        timesMakeConfRd: 0,
        timesMakeChampionship: 0,
        timesWinChampionship: 0,
        timesTeamWonOut: 0,
        timesWithWorstRecord: 0,
        timesWithBestRecord: 0,
        winsAtStartDate: this.getWinsAtWeek(team.roster.rosterId, startWeek - 1, matchUpsWithProb)
      };
    }

    for (let i = 0; i < numberOfSimulations; i++) {
      if (startWeek >= this.leagueService.selectedLeague.playoffStartWeek) {
        simulatedPlayoffOdds = this.updatePlayoffOdds(startWeek, teamRatingsPValues, simulatedPlayoffOdds, 1000);
      } else {
        simulatedPlayoffOdds = this.simulateOneSeason(startWeek, teamRatingsPValues, simulatedPlayoffOdds);
      }
    }

    // divisor for percent calculations
    const divisor = (numberOfSimulations / 100);

    for (const team of this.leagueService.leagueTeamDetails) {
      simulatedPlayoffOdds[team.roster.rosterId] = {
        timesMakingPlayoffs: Math.round(simulatedPlayoffOdds[team.roster.rosterId].timesMakingPlayoffs / divisor),
        timesWinningDivision: Math.round(simulatedPlayoffOdds[team.roster.rosterId].timesWinningDivision / divisor),
        timesWithBye: Math.round(simulatedPlayoffOdds[team.roster.rosterId].timesWithBye / divisor),
        timesMakeConfRd: Math.round(simulatedPlayoffOdds[team.roster.rosterId].timesMakeConfRd / divisor),
        timesMakeChampionship: Math.round(simulatedPlayoffOdds[team.roster.rosterId].timesMakeChampionship / divisor),
        timesWinChampionship: Math.round(simulatedPlayoffOdds[team.roster.rosterId].timesWinChampionship / divisor),
        timesTeamWonOut: Math.round(simulatedPlayoffOdds[team.roster.rosterId].timesTeamWonOut / divisor),
        timesWithWorstRecord: Math.round(simulatedPlayoffOdds[team.roster.rosterId].timesWithWorstRecord / divisor),
        timesWithBestRecord: Math.round(simulatedPlayoffOdds[team.roster.rosterId].timesWithBestRecord / divisor),
      };
    }
    return simulatedPlayoffOdds;
  }

  /**
   * get random number
   * TODO create numbers service?
   */
  private getRandomInt(max): number {
    return Math.floor(Math.random() * max);
  }

  /**
   * handles if start week is null
   * TODO check when new weeks are processed
   * @private
   */
  public getStartWeek(): number {
    return this.nflService.getCurrentWeekForSeason(this.leagueService?.selectedLeague?.season);
  }

  /**
   * get median value for week
   * @param matchUpsWithProbElement
   * @private
   */
  private getMedianPointsForWeek(matchUpsWithProbElement: MatchUpProbability[]): number {
    const teamPoints = [];
    matchUpsWithProbElement?.map(matchUp => {
      teamPoints.push(matchUp.matchUpDetails.team1Points);
      teamPoints.push(matchUp.matchUpDetails.team2Points);
    });
    teamPoints.sort((a, b) => {
      return a - b;
    });
    const totalPoints = [teamPoints[this.leagueService.selectedLeague.totalRosters / 2 - 1],
    teamPoints[this.leagueService.selectedLeague.totalRosters / 2]];
    return median(totalPoints);
  }

  /**
   * generate odds for a team to beat the median
   * @param meanRating
   * @param stdRating
   * @private
   */
  private generateMedianProbabilities(meanRating: any, stdRating: any, teamRatingsPValues: {} = this.teamRatingsPValues): {} {
    const medianWinProbability = {};
    // sort array based on starter value to find the middle two
    const rankings = this.powerRankingsService.powerRankings.slice();
    rankings.sort((a, b) => {
      return this.forecastModel === ForecastTypes.ADP_STARTER ?
        a.adpValueStarter - b.adpValueStarter : a.eloAdpValueStarter - b.eloAdpValueChange;
    });

    // get median of middle two teams value wise
    const medianStarterValue = median(this.forecastModel === ForecastTypes.ADP_STARTER ?
      [rankings[rankings.length / 2 - 1].adpValueStarter, rankings[rankings.length / 2].adpValueStarter] :
      [rankings[rankings.length / 2 - 1].eloAdpValueStarter, rankings[rankings.length / 2].eloAdpValueStarter]);

    // add median probability to pValues at pos 0
    const medianZ = zScore(medianStarterValue, meanRating, stdRating);
    const medianP = cumulativeStdNormalProbability(medianZ);
    teamRatingsPValues[0] = medianP;

    // generate odds to beat the mean
    for (const team of this.powerRankingsService.powerRankings) {
      medianWinProbability[team.team.roster.rosterId] = {
        meanProb: this.getPercent(0.5 + (teamRatingsPValues[team.team.roster.rosterId] - this.teamRatingsPValues[0]) / 2)
      };
    }
    return medianWinProbability;
  }

  /**
   * calculate the league medians for each week
   */
  calculateLeagueMedians(): void {
    if (this.matchUpsWithProb.length === 0) {
      this.matchUpsWithProb = this.generateMatchUpsWithProb();
    }
    const endWeek = this.leagueService.selectedLeague.season === this.nflService.stateOfNFL.season
      && this.nflService.stateOfNFL.seasonType !== 'post' ?
      this.nflService.stateOfNFL.completedWeek - this.leagueService.selectedLeague.startWeek
      : (Number(this.leagueService.selectedLeague.season) < 2021 ? 17 : 18);
    for (let i = 0; i <= endWeek; i++) {
      this.matchUpService.leagueMedians.push(this.getMedianPointsForWeek(this.matchUpsWithProb[i]));
    }
  }

  /**
   * calculate the worst record team from simulated teams
   * @param simulatedWins
   * @private
   */
  private determineWorstRecordTeam(simulatedWins: SimulatedTeamInfo[], teamRatingsPValues: {} = this.teamRatingsPValues): SimulatedTeamInfo {
    let selectedTeam = null;
    let minWinTotal = this.leagueService.selectedLeague.playoffStartWeek;
    for (const simulatedTeam of simulatedWins) {
      if (!selectedTeam || simulatedTeam.projWins < minWinTotal) {
        selectedTeam = simulatedTeam;
        minWinTotal = simulatedTeam.projWins;
      } else if (simulatedTeam.projWins === minWinTotal) {
        const winner = this.calculateTieBreaker([selectedTeam, simulatedTeam], teamRatingsPValues);
        if (winner.team.roster.rosterId === selectedTeam.team.roster.rosterId) {
          selectedTeam = simulatedTeam;
        }
      }
    }
    return selectedTeam;
  }
}

enum ForecastTypes {
  ADP_STARTER = 0,
  ELO_ADJUSTED = 1,
}
