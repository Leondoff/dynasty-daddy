import {Component, OnInit, Input} from '@angular/core';
import { LeagueService } from 'src/app/services/league.service';
import { LeagueSwitchService } from '../../services/league-switch.service';
import { PlayoffCalculatorService } from '../../services/playoff-calculator.service';
import { WrappedService } from '../../services/wrapped.service';
import { FadeGrowStagger, FadeSlideInOut } from '../animations/fade.animation';
import { WrappedCardSummaryContent } from '../wrapped-card-summary/wrapped-card-summary.component';

@Component({
    selector: 'app-wrapped-finish',
    templateUrl: './wrapped-finish.component.html',
    styleUrls: ['./wrapped-finish.component.css'],
    animations: [FadeSlideInOut, FadeGrowStagger]
})
  export class WrappedFinishComponent implements OnInit {

    @Input()
    baseFrame: number;

    /** recap object */
    summaryCard: WrappedCardSummaryContent

    /** final intro text */
    finalIntro = [];
    
    /** show next button */
    showNext = false;
    
    /** show content */
    showContent = false;

    constructor(private leagueService: LeagueService, private playoffCalculatorService: PlayoffCalculatorService, public leagueSwitchService: LeagueSwitchService, public wrappedService: WrappedService) {}
    
    ngOnInit(): void {
      this.finalIntro.push('It\'s tough to say goodbye to football')
      this.finalIntro.push('But before you go');
      this.finalIntro.push('We\'ll try to make a recap');
      const teams = this.leagueService.leagueTeamDetails.slice().sort((a,b) => b.roster.teamMetrics.fpts - a.roster.teamMetrics.fpts);
      const seasonResults = teams.slice().sort((a,b) => this.playoffCalculatorService.teamPlayoffOdds[b.roster.rosterId].timesWinChampionship - this.playoffCalculatorService.teamPlayoffOdds[a.roster.rosterId].timesWinChampionship ||
        this.playoffCalculatorService.teamPlayoffOdds[b.roster.rosterId].timesMakeChampionship - this.playoffCalculatorService.teamPlayoffOdds[a.roster.rosterId].timesMakeChampionship);
      // get best trade
      const bestTrade = this.wrappedService.transactionsDict['trades']?.[0] || null;
      const tradeTeam1 = bestTrade ? this.leagueService.getTeamByRosterId(bestTrade.rosterIds[0]) : null;
      const tradeTeam2 = bestTrade ? this.leagueService.getTeamByRosterId(bestTrade.rosterIds[1]) : null;
      const biggestTrade = bestTrade ? {team1: tradeTeam1.owner.teamName, team2: tradeTeam2.owner.teamName, team1Adds:bestTrade.adds.map(p => p.playerName), team2Adds: bestTrade.drops.map(p => p.playerName)} : null;
      this.summaryCard = {first: seasonResults[0], second: seasonResults[1], bestOffense: teams[0], worstOffense: teams[teams.length-1], bestTrade: biggestTrade, standings: this.leagueService.leagueTeamDetails, totalWaivers: this.wrappedService.transactionsDict['waivers']?.length || 0, totalTrades: this.wrappedService.transactionsDict['trades']?.length || 0, leagueName: this.leagueService.selectedLeague.name};
      setInterval(()=> {
        this.showContent = true;
      } ,1000);
      setInterval(()=> {
        this.showNext = true;
      } ,3000);
    }

    /**
    * handles transitioning to the next frame
    */
    nextFrame(): void {
      this.wrappedService.frameNumber++;
      this.showNext = false;
      this.showContent = false;
      setInterval(()=> {
        this.showContent = true;
      } ,1000);
      setInterval(()=> {
        this.showNext = true;
      } ,12000);
    }
}
