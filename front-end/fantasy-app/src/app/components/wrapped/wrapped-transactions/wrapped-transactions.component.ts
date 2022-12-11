import {Component, Input, OnInit} from '@angular/core';
import { LeagueService } from 'src/app/services/league.service';
import { NflService } from 'src/app/services/utilities/nfl.service';
import { LeagueSwitchService } from '../../services/league-switch.service';
import { WrappedService } from '../../services/wrapped.service';
import { FadeGrowStagger, FadeSlideInOut } from '../animations/fade.animation';
import { WrappedCardTradeContent } from '../wrapped-card-trade/wrapped-card-trade.component';
import { WrappedCardContent } from '../wrapped-card/wrapped-card.component';

@Component({
    selector: 'app-wrapped-transactions',
    templateUrl: './wrapped-transactions.component.html',
    styleUrls: ['./wrapped-transactions.component.css'],
    animations: [FadeSlideInOut, FadeGrowStagger]
})
  export class WrappedTransactionsComponent implements OnInit {

    @Input()
    baseFrame: number;

    /** total transactions text */
    totalTransactions = ['As the season progressed, your league kept making moves.'];

    /** Trades intro text array */
    tradesIntro = [];

    /** best/worst transactions winners */
    transactionsWinners: WrappedCardContent[] = [];

    /** best players on waivers */
    transactionsPlayers: WrappedCardContent[] = [];

    /** biggest trades */
    biggestTrades: WrappedCardTradeContent[] = [];

    /** biggest fleeces */
    biggestFleeces: WrappedCardTradeContent[] = [];

    /** show next button */
    showNext = false;
    /** show page content */
    showContent = false;

    constructor(public wrappedService: WrappedService, public leagueSwitchService: LeagueSwitchService, private leagueService: LeagueService) {}
    
    ngOnInit(): void {
      // load transactions if not
      this.wrappedService.calculateTransactionStatistics();
      // total transactions
      this.totalTransactions.push('There was ' + this.wrappedService.transactionsDict['total'] + ' transactions this season!');
      this.totalTransactions.push('Some were better than others...');
      // Most/least transactions
      const mostTransactionsTeam = this.leagueService.getTeamByRosterId(this.wrappedService.transactionsDict['max_id']);
      this.transactionsWinners.push({rank: 'Most', details: 'Most Transactions (' + this.wrappedService.transactionsDict['max'] + ') - Waiver Warrior', header: mostTransactionsTeam.owner.teamName, image: mostTransactionsTeam.owner.getAvatarForLeague(this.leagueService.selectedLeague.leaguePlatform)})
      const leastTransactionsTeam = this.leagueService.getTeamByRosterId(this.wrappedService.transactionsDict['min_id']);
      this.transactionsWinners.push({rank: 'Least', details: 'Least Transactions (' + this.wrappedService.transactionsDict['min'] + ') - Don\'t be shy', header: leastTransactionsTeam.owner.teamName, image: leastTransactionsTeam.owner.getAvatarForLeague(this.leagueService.selectedLeague.leaguePlatform)})
      // Transactions Players
      for (let i = 0; i < (this.wrappedService.transactionsDict['waivers'].length > 5 ? 5 : this.wrappedService.transactionsDict['waivers'].length); i++) {
        const waiver = this.wrappedService.transactionsDict['waivers'][i];
        const waiverTeam = this.leagueService.getTeamByRosterId(waiver.adds[0].rosterId);
        this.transactionsPlayers.push({rank: '#' + (i + 1), details: 'Added by ' + waiverTeam.owner.teamName, header: waiver.adds[0].playerName, image: waiverTeam.owner.getAvatarForLeague(this.leagueService.selectedLeague.leaguePlatform)});  
      }
      // Trades intro
      this.tradesIntro.push('Out of the ' + this.wrappedService.transactionsDict['total'] + ' transactions');
      this.tradesIntro.push((this.wrappedService.transactionsDict['trades'].length || 0) + ' of them were trades.');
      this.tradesIntro.push(this.wrappedService.transactionsDict['trades'].length > 10 ? 'Talk about Art of the Deal!' : 'It\'s okay to talk with each other you know');
      // Biggest Trades
      for (let i = 0; i < (this.wrappedService.transactionsDict['trades'].length > 3 ? 3 : this.wrappedService.transactionsDict['trades'].length); i++) {
        if (this.wrappedService.transactionsDict['trades'][i].rosterIds.length !== 2) continue;
        const tradeTeam1 = this.leagueService.getTeamByRosterId(this.wrappedService.transactionsDict['trades'][i].rosterIds[0])
        const tradeTeam2 = this.leagueService.getTeamByRosterId(this.wrappedService.transactionsDict['trades'][i].rosterIds[1])
        this.biggestTrades.push({team1: tradeTeam1.owner.teamName, team2: tradeTeam2.owner.teamName, team1Adds: this.wrappedService.transactionsDict['trades'][i].adds.map(p => p.playerName), team2Adds: this.wrappedService.transactionsDict['trades'][i].drops.map(p => p.playerName)});  
      }
      // Fleeces of the Year
      const fleeceTradesList = this.wrappedService.transactionsDict['trades'].filter(trade => Math.abs(trade.netValue) >= 3000).sort((a,b) => Math.abs(b.netValue)/((b.adds.reduce((p, x) => p + x.value, 0) + b.drops.reduce((p, x) => p + x.value, 0)) || 1)  - (Math.abs(a.netValue)/(a.adds.reduce((p, x) => p + x.value, 0) + a.drops.reduce((p, x) => p + x.value, 0)) || 1) ).filter(trade => Math.abs(trade.netValue) >= 3000);
      for (let i = 0; i < (fleeceTradesList.length > 3 ? 3 : fleeceTradesList.length); i++) {
        if (fleeceTradesList[i].rosterIds.length !== 2) continue;
        const tradeTeam1 = this.leagueService.getTeamByRosterId(fleeceTradesList[i].rosterIds[0])
        const tradeTeam2 = this.leagueService.getTeamByRosterId(fleeceTradesList[i].rosterIds[1])
        this.biggestFleeces.push({team1: tradeTeam1.owner.teamName, team2: tradeTeam2.owner.teamName, team1Adds: fleeceTradesList[i].adds.map(p => p.playerName), team2Adds: fleeceTradesList[i].drops.map(p => p.playerName)});  
      }
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
      if (this.wrappedService.transactionsDict['trades'].length === 0 && this.wrappedService.frameNumber === this.baseFrame + 4) {
        this.wrappedService.frameNumber += 2;
      }
      this.showNext = false;
      this.showContent = false;
      setInterval(()=> {
        this.showContent = true;
      } ,1000);
      setInterval(()=> {
        this.showNext = true;
      } ,7000);
    }
}
