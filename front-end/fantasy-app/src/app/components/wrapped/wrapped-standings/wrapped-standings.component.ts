import { Component, Input, OnInit } from '@angular/core';
import { LeagueTeam } from 'src/app/model/league/LeagueTeam';
import { ConfigService } from 'src/app/services/init/config.service';
import { LeagueService } from 'src/app/services/league.service';
import { NflService } from 'src/app/services/utilities/nfl.service';
import { MatchUpProbability } from '../../model/playoffCalculator';
import { LeagueSwitchService } from '../../services/league-switch.service';
import { MatchupService } from '../../services/matchup.service';
import { PlayoffCalculatorService } from '../../services/playoff-calculator.service';
import { WrappedService } from '../../services/wrapped.service';
import { FadeGrowStagger, FadeSlideInOut } from '../animations/fade.animation';
import { WrappedCardContent } from '../wrapped-card/wrapped-card.component';

@Component({
  selector: 'app-wrapped-standings',
  templateUrl: './wrapped-standings.component.html',
  styleUrls: ['./wrapped-standings.component.scss'],
  animations: [FadeSlideInOut, FadeGrowStagger]
})
export class WrappedStandingsComponent implements OnInit {

  @Input()
  baseFrame: number;

  /** standing intro text */
  standingsIntro = [];

  /** teams intro text */
  teamsIntro = [];

  /** team superlatives */
  superlatives: WrappedCardContent[] = [];

  /** top teams in the league */
  topTeams: WrappedCardContent[] = [];

  /** closest matchups */
  closestGames: WrappedCardContent[] = [];

  /** biggest upsets */
  upsetGames: WrappedCardContent[] = [];

  /** winner of the league */
  winner: LeagueTeam = null;

  /** rival quotes */
  rivalQuotes: string[] = [];

  /** show next button */
  showNext = false;

  /** show page content */
  showContent = false;

  constructor(
    public configService: ConfigService,
    private matchUpService: MatchupService,
    public leagueSwitchService: LeagueSwitchService,
    private playoffCalculatorService: PlayoffCalculatorService,
    public wrappedService: WrappedService,
    private nflService: NflService,
    private leagueService: LeagueService
  ) { }

  ngOnInit(): void {
    const completedWeek = this.nflService.getCompletedWeekForSeason(this.leagueService.selectedLeague.season);
    this.matchUpService.initMatchUpCharts(this.leagueService.selectedLeague, completedWeek);
    // intro standings text
    this.standingsIntro.push('This season was full of drama!');
    this.standingsIntro.push('There were ' + this.matchUpService.leagueMatchUpUI.reduce((a, m) => a + m.length, 0) + ' fantasy games played this season.');
    this.standingsIntro.push('Let\'s relive some of those memorable moments.');
    // closest match ups
    this.matchUpService.getClosestWins(this.leagueService.selectedLeague.startWeek, completedWeek);
    for (let i = 0; i < 4; i++) {
      const matchUp = this.matchUpService.leagueClosestWins[i];
      const winnerId = matchUp.team1Points > matchUp.team2Points ? matchUp.team1RosterId : matchUp.team2RosterId;
      const loserId = matchUp.team1Points > matchUp.team2Points ? matchUp.team2RosterId : matchUp.team1RosterId;
      const winnerTeam = this.leagueService.getTeamByRosterId(winnerId);
      const loserTeam = this.leagueService.getTeamByRosterId(loserId);
      this.closestGames.push({ rank: (Math.round(Math.abs(matchUp.team1Points - matchUp.team2Points) * 100) / 100).toString(), details: 'Defeats ' + loserTeam.owner.teamName + ' in Week ' + matchUp.week + ' (' + (matchUp.team1Points > matchUp.team2Points ? matchUp.team1Points + ' - ' + matchUp.team2Points : matchUp.team2Points + ' - ' + matchUp.team1Points) + ')', header: winnerTeam.owner.teamName, image: winnerTeam.owner.avatar });
    }
    // biggest upsets
    this.playoffCalculatorService.calculateGamesWithProbability(completedWeek + 1);
    const upsetMatchups = this.playoffCalculatorService.matchUpsWithProb.slice().reduce((a, b) => a.concat(b), []).filter(m => m.matchUpDetails.team1Points !== 0 && m.matchUpDetails.team2Points !== 0).sort((a, b) => this.getWinnerProb(a) - this.getWinnerProb(b));
    for (let i = 0; i < 4; i++) {
      const matchUp = upsetMatchups[i];
      const didTeam1Win = matchUp.matchUpDetails.team1Points > matchUp.matchUpDetails.team2Points
      const winnerId = didTeam1Win ? matchUp.matchUpDetails.team1RosterId : matchUp.matchUpDetails.team2RosterId;
      const loserId = didTeam1Win ? matchUp.matchUpDetails.team2RosterId : matchUp.matchUpDetails.team1RosterId;
      const winnerTeam = this.leagueService.getTeamByRosterId(winnerId);
      const loserTeam = this.leagueService.getTeamByRosterId(loserId);
      this.upsetGames.push({ rank: (didTeam1Win ? matchUp.team1Prob : matchUp.team2Prob) + '%', details: 'Had a ' + (didTeam1Win ? matchUp.team1Prob : matchUp.team2Prob) + '% chance to defeat ' + loserTeam.owner.teamName + ' in Week ' + matchUp.matchUpDetails.week + ' (' + (didTeam1Win ? matchUp.matchUpDetails.team1Points + ' - ' + matchUp.matchUpDetails.team2Points : matchUp.matchUpDetails.team2Points + ' - ' + matchUp.matchUpDetails.team1Points) + ')', header: winnerTeam.owner.teamName, image: winnerTeam.owner.avatar });
    }
    // teams intro
    this.teamsIntro.push('The league is only as good as the teams in it');
    this.teamsIntro.push('This season ' + this.leagueService.selectedLeague.totalRosters + ' teams all put forward their best effort');
    this.teamsIntro.push('Let\'s hand out some superlatives...');
    // superlatives from the season
    const teams = this.leagueService.leagueTeamDetails.slice().sort((a, b) => b.roster.teamMetrics.fpts - a.roster.teamMetrics.fpts);
    this.superlatives.push({ rank: '', details: 'Best Offense in the league - Points For: ' + teams[0].roster.teamMetrics.fpts, header: teams[0].owner.teamName, image: teams[0].owner.avatar });
    this.superlatives.push({ rank: '', details: 'Worst Offense in the league - Points For: ' + teams[teams.length - 1].roster.teamMetrics.fpts, header: teams[teams.length - 1].owner.teamName, image: teams[teams.length - 1].owner.avatar });
    const worstTeam = teams.sort((a, b) => b.roster.teamMetrics.fptsAgainst - a.roster.teamMetrics.fptsAgainst);
    this.superlatives.push({ rank: '', details: 'Worst defense in the league - Points Against: ' + worstTeam[0].roster.teamMetrics.fptsAgainst, header: worstTeam[0].owner.teamName, image: worstTeam[0].owner.avatar });
    this.matchUpService.getMostPointsForInWeek(this.leagueService.selectedLeague.startWeek, completedWeek);
    const mostPointsMatchUp = this.matchUpService.leagueMostPointsFor[0];
    const mostPointsForTeam = this.leagueService.getTeamByRosterId(mostPointsMatchUp.rosterId);
    this.superlatives.push({ rank: '', details: 'Any given sunday - Single Game High: ' + mostPointsMatchUp.points, header: mostPointsForTeam.owner.teamName, image: mostPointsForTeam.owner.avatar });
    // best record
    const recordTeam = teams.sort((a, b) => b.roster.teamMetrics.wins - a.roster.teamMetrics.wins)
    for (let i = 0; i < 4; i++) {
      this.topTeams.push({ rank: '#' + (i + 1), details: 'Record: ' + recordTeam[i].roster.teamMetrics.wins + '-' + recordTeam[i].roster.teamMetrics.losses + ' | Avg PPG: ' + Math.round(recordTeam[i].roster.teamMetrics.fpts / completedWeek), header: recordTeam[i].owner.teamName, image: recordTeam[i].owner.avatar });
    }
    // winner
    const seasonResults = this.wrappedService.sortBySeasonWinner(teams, this.playoffCalculatorService.teamPlayoffOdds);
    if (this.playoffCalculatorService.teamPlayoffOdds[seasonResults[0].roster.rosterId].timesWinChampionship === 100) {
      this.winner = seasonResults[0];
      this.rivalQuotes.push("\"The best fantasy team and a even better person\" - " + seasonResults[1].owner.teamName);
      this.rivalQuotes.push("\"The envy of the league. They are a genius!\" - " + seasonResults[2].owner.teamName);
      this.rivalQuotes.push("\"They are so good looking... I mean their fantasy team is good looking\" - " + seasonResults[3].owner.teamName);
    }

    setInterval(() => {
      this.showContent = true;
    }, 1000);
    setInterval(() => {
      this.showNext = true;
    }, 3000);
  }

  private getWinnerProb(matchUp: MatchUpProbability): number {
    return matchUp.matchUpDetails.team1Points > matchUp.matchUpDetails.team2Points ? matchUp.team1Prob : matchUp.team2Prob;
  }

  /**
   * handles transitioning to the next frame
   */
  nextFrame(): void {
    this.wrappedService.frameNumber++;
    if (this.wrappedService.frameNumber === (this.baseFrame + 6) && !this.winner) {
      this.wrappedService.frameNumber++;
    }
    this.showNext = false;
    this.showContent = false;
    setInterval(() => {
      this.showContent = true;
    }, 1000);
    setInterval(() => {
      this.showNext = true;
    }, 7000);
  }
}
