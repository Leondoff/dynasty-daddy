import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { ConfigService } from "src/app/services/init/config.service";
import { LeagueService } from "src/app/services/league.service";
import { WrappedCardTradeContent } from "../wrapped-card-trade/wrapped-card-trade.component";
import { MatchUpProbability } from "../../model/playoffCalculator";

@Component({
    selector: 'app-wrapped-summary-user',
    templateUrl: './wrapped-card-summary-user.component.html',
    styleUrls: ['./wrapped-card-summary-user.component.scss']
})
export class WrappedCardSummaryUserComponent implements OnInit, OnChanges {

    @Input()
    content: WrappedCardSummaryUserContent

    biggestWinString: string = '';

    worstLossString: string = '';

    constructor(public configService: ConfigService, public leagueService: LeagueService) { }

    ngOnInit(): void {
        this.setup();
    }

    ngOnChanges(): void {
        this.setup();
    }

    private setup(): void {
        let isTeam1 = this.content.biggestWin?.matchUpDetails?.team1Points > this.content.biggestWin?.matchUpDetails?.team2Points;
        const loserId = isTeam1 ? this.content.biggestWin?.matchUpDetails?.team2RosterId :
            this.content.biggestWin?.matchUpDetails?.team1RosterId;
        const loserTeam = this.leagueService.leagueTeamDetails.find(t => t.roster.rosterId === loserId);
        // const percent = isTeam1 ? this.content.biggestWin?.team1Prob : this.content.biggestWin?.team2Prob;
        this.biggestWinString = `${this.content.biggestWin?.matchUpDetails.team1Points}-${this.content.biggestWin?.matchUpDetails.team2Points} vs. ${loserTeam.owner?.teamName}`;
        
        isTeam1 = this.content.worstLoss?.matchUpDetails?.team1Points < this.content.worstLoss?.matchUpDetails?.team2Points;
        const winnerId = isTeam1 ? this.content.worstLoss?.matchUpDetails?.team2RosterId :
            this.content.worstLoss?.matchUpDetails?.team1RosterId;
        const winnerTeam = this.leagueService.leagueTeamDetails.find(t => t.roster.rosterId === winnerId);
        this.worstLossString = `${this.content.worstLoss?.matchUpDetails.team1Points}-${this.content.worstLoss?.matchUpDetails.team2Points} vs. ${winnerTeam.owner?.teamName}`;
    }

}

export class WrappedCardSummaryUserContent {
    wins: number;
    losses: number;
    bestTrade: WrappedCardTradeContent;
    bestPerformers: WrappedCardSummaryPlayer[];
    totalWaivers: number;
    totalTrades: number;
    user: string;
    img: string;
    fpts: number;
    ptsRange: string;
    allPlayRecord: string;
    biggestWin: MatchUpProbability;
    worstLoss: MatchUpProbability;
}

export class WrappedCardSummaryPlayer {
    firstName: string;
    lastName: string;
    points: number;
}
