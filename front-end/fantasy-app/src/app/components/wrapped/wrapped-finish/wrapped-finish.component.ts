import { Component, OnInit, Input } from '@angular/core';
import { ConfigService } from 'src/app/services/init/config.service';
import { LeagueService } from 'src/app/services/league.service';
import { LeagueSwitchService } from '../../services/league-switch.service';
import { PlayoffCalculatorService } from '../../services/playoff-calculator.service';
import { WrappedService } from '../../services/wrapped.service';
import { FadeGrowStagger, FadeSlideInOut } from '../animations/fade.animation';
import { WrappedCardSummaryContent } from '../wrapped-card-summary/wrapped-card-summary.component';
import { WrappedCardSummaryPlayer, WrappedCardSummaryUserContent } from '../wrapped-card-summary-user/wrapped-card-summary-user.component';
import { WrappedCardTradeContent } from '../wrapped-card-trade/wrapped-card-trade.component';
import { PlayerService } from 'src/app/services/player.service';
import { MatchUpProbability } from '../../model/playoffCalculator';
import { MatchupService } from '../../services/matchup.service';
import { BaseComponent } from '../../base-component.abstract';
import { MatDialog } from '@angular/material/dialog';
import { ShareSocialsComponent } from '../../sub-components/share-socials/share-socials.component';

@Component({
  selector: 'app-wrapped-finish',
  templateUrl: './wrapped-finish.component.html',
  styleUrls: ['./wrapped-finish.component.scss'],
  animations: [FadeSlideInOut, FadeGrowStagger]
})
export class WrappedFinishComponent extends BaseComponent implements OnInit {

  @Input()
  baseFrame: number;

  /** recap object */
  summaryCard: WrappedCardSummaryContent

  /** selected roster id to load */
  selectedRosterId: number;

  /** user recap object */
  summaryUserCard: WrappedCardSummaryUserContent

  /** final intro text */
  finalIntro = [];

  /** show next button */
  showNext = false;

  /** show content */
  showContent = false;

  teams: any[] = [];

  constructor(public configService: ConfigService,
    private playerService: PlayerService,
    private leagueService: LeagueService,
    private matchUpService: MatchupService,
    private playoffCalculatorService: PlayoffCalculatorService,
    public leagueSwitchService: LeagueSwitchService,
    public dialog: MatDialog,
    public wrappedService: WrappedService) {
    super()
  }

  ngOnInit(): void {
    this.finalIntro.push('It\'s tough to say goodbye to football')
    this.finalIntro.push('But before you go');
    this.finalIntro.push('We\'ll try to make a recap');
    const teams = this.leagueService.leagueTeamDetails.slice().sort((a, b) => b.roster.teamMetrics.fpts - a.roster.teamMetrics.fpts);
    const seasonResults = this.wrappedService.sortBySeasonWinner(teams, this.playoffCalculatorService.teamPlayoffOdds);
    // get best trade
    const bestTrade = this.wrappedService.transactionsDict['trades']?.[0] || null;
    const tradeTeam1 = bestTrade ? this.leagueService.getTeamByRosterId(bestTrade.rosterIds[0]) : null;
    const tradeTeam2 = bestTrade ? this.leagueService.getTeamByRosterId(bestTrade.rosterIds[1]) : null;
    const biggestTrade = bestTrade ? { team1: tradeTeam1.owner.teamName, team2: tradeTeam2.owner.teamName, team1Adds: bestTrade.adds.map(p => p.playerName), team2Adds: bestTrade.drops.map(p => p.playerName) } : null;
    this.summaryCard = {
      first: seasonResults[0],
      second: seasonResults[1],
      bestOffense: teams[0],
      worstOffense: teams[teams.length - 1],
      bestTrade: biggestTrade,
      standings: this.leagueService.leagueTeamDetails.slice(),
      totalWaivers: this.wrappedService.transactionsDict['waivers']?.length || 0,
      totalTrades: this.wrappedService.transactionsDict['trades']?.length || 0,
      leagueName: this.leagueService.selectedLeague.name
    };
    this.selectedRosterId = 1;
    if (this.leagueService.leagueUser) {
      const leagueTeam = this.leagueService.leagueTeamDetails.find(l =>
        l.owner.userId === this.leagueService.leagueUser.userData.user_id);
      this.selectedRosterId = leagueTeam.roster.rosterId;
    }
    this.summaryUserCard = this.generateUserSummary();
    setInterval(() => {
      this.showContent = true;
    }, 1000);
    setInterval(() => {
      this.showNext = true;
    }, 3000);
    this.teams = this.leagueService.leagueTeamDetails.map(t => ({ rosterId: t.roster.rosterId, teamName: t.owner.teamName }))
  }

  generateUserSummary(rosterId: number = this.selectedRosterId): WrappedCardSummaryUserContent {
    const team = this.leagueService.leagueTeamDetails.find(p => p.roster.rosterId === rosterId);

    const userTrades = this.wrappedService.transactionsDict['trades']
      ?.filter(p => p.rosterIds[0] === rosterId || p.rosterIds[1] === rosterId) || null;

    const userWaivers = this.wrappedService.transactionsDict['waivers']
      ?.filter(p => p.adds[0].rosterId === rosterId)

    const bestTrade = userTrades?.[0] || null;

    const bestPerformers = team.roster.players
      .map(p => this.playerService.getPlayerByPlayerPlatformId(p, this.leagueService.selectedLeague.leaguePlatform))
      .filter(p => p != null)
      .sort((a, b) => (this.playerService.getPlayerPointsByFormat(b.sleeper_id, this.leagueService.getLeagueScoringFormat()) || 0) -
        (this.playerService.getPlayerPointsByFormat(a.sleeper_id, this.leagueService.getLeagueScoringFormat()) || 0))
      .map(p => ({
        firstName: p.first_name,
        lastName: p.last_name,
        points: this.playerService.getPlayerPointsByFormat(p.sleeper_id, this.leagueService.getLeagueScoringFormat()) || 0
      }) as WrappedCardSummaryPlayer).slice(0, 5);

    const userGames: MatchUpProbability[] = [];
    this.playoffCalculatorService.matchUpsWithProb.forEach(m =>
      m.forEach(ml => {
        if (ml.matchUpDetails.team1RosterId === this.selectedRosterId ||
          ml.matchUpDetails.team2RosterId === this.selectedRosterId)
          userGames.push(ml);
      }));
    let high = 0;
    let low = 300;
    let biggestWin: MatchUpProbability;
    let worstLoss: MatchUpProbability;
    userGames.forEach(g => {
      const pts = this.selectedRosterId === g.matchUpDetails.team1RosterId ?
        g.matchUpDetails.team1Points : g.matchUpDetails.team2Points;
      if (high < pts) {
        high = pts;
      }
      if (low > pts && pts != 0) {
        low = pts;
      }
      if (pts > 0) {
        const winTeam1 = biggestWin?.matchUpDetails.team1RosterId === this.selectedRosterId;
        const lossTeam1 = worstLoss?.matchUpDetails.team1RosterId === this.selectedRosterId;
        if (this.selectedRosterId === g.matchUpDetails.team1RosterId) {
          if (g.matchUpDetails.team1Points > g.matchUpDetails.team2Points) {
            if (!biggestWin || g.team1Prob < (winTeam1 ? biggestWin.team1Prob : biggestWin.team2Prob)) {
              biggestWin = g;
            }
          } else {
            if (!worstLoss || g.team1Prob > (lossTeam1 ? worstLoss.team1Prob : worstLoss.team2Prob)) {
              worstLoss = g;
            }
          }
        } else {
          if (g.matchUpDetails.team2Points > g.matchUpDetails.team1Points) {
            if (!biggestWin || g.team2Prob < (winTeam1 ? biggestWin.team1Prob : biggestWin.team2Prob)) {
              biggestWin = g;
            }
          } else {
            if (!worstLoss || g.team2Prob > (lossTeam1 ? worstLoss.team1Prob : worstLoss.team2Prob)) {
              worstLoss = g;
            }
          }
        }
      }
    });

    let allPlayRecord = '0-0';
    this.addSubscriptions(this.matchUpService.generateWeeklyRecords(this.leagueService.selectedLeague,
      this.leagueService.selectedLeague.playoffStartWeek).subscribe(p => {
        const allP = p.find(record => record.rosterId === this.selectedRosterId)
        allPlayRecord = `${allP.totalWins}-${allP.totalLosses}`;
      }
      ));

    return {
      user: team.owner.teamName,
      wins: team.roster.teamMetrics.wins,
      losses: team.roster.teamMetrics.losses,
      fpts: team.roster.teamMetrics.fpts,
      img: team.owner.avatar,
      bestTrade: this.formatTrade(bestTrade),
      bestPerformers,
      totalTrades: userTrades?.length || 0,
      totalWaivers: userWaivers?.length || 0,
      ptsRange: `${high}-${low}`,
      allPlayRecord,
      biggestWin,
      worstLoss
    };
  }

  /**
  * handles transitioning to the next frame
  */
  nextFrame(): void {
    this.wrappedService.frameNumber++;
    this.showNext = false;
    this.showContent = false;
    setInterval(() => {
      this.showContent = true;
    }, 1000);
    setInterval(() => {
      this.showNext = true;
    }, 12000);
  }

  setTeamRecap(rosterId: number): void {
    this.selectedRosterId = rosterId;
    this.summaryUserCard = this.generateUserSummary();
  }

  /**
   * Open share socials modal
   */
  openShareModal(): void {
    this.dialog.open(ShareSocialsComponent
      , {
        data: {
          buttons: ['copy', 'facebook', 'twitter', 'reddit', 'sms', 'email'],
          postTitle: `Fantasy Wrapped for ${this.leagueService.selectedLeague.name}`,
          postUrl: window.location.href,
          description: 'Relive the best moments of the fantasy season with your league\'s fantasy wrapped.'
        }
      }
    );
  }

  private formatTrade(bestTrade: any): WrappedCardTradeContent {
    const tradeTeam1 = bestTrade ? this.leagueService.getTeamByRosterId(bestTrade.rosterIds[0]) : null;
    const tradeTeam2 = bestTrade ? this.leagueService.getTeamByRosterId(bestTrade.rosterIds[1]) : null;
    return bestTrade ? { team1: tradeTeam1.owner.teamName, team2: tradeTeam2.owner.teamName, team1Adds: bestTrade.adds.map(p => p.playerName), team2Adds: bestTrade.drops.map(p => p.playerName) } : null;
  }
}
