import { Component, Input, OnInit } from "@angular/core";
import { LeagueTeam } from "src/app/model/league/LeagueTeam";
import { ConfigService } from "src/app/services/init/config.service";
import { LeagueService } from "src/app/services/league.service";
import { WrappedCardTradeContent } from "../wrapped-card-trade/wrapped-card-trade.component";
import { WrappedCardContent } from "../wrapped-card/wrapped-card.component";

@Component({
    selector: 'app-wrapped-summary-trade',
    templateUrl: './wrapped-card-summary.component.html',
    styleUrls: ['./wrapped-card-summary.component.css']
})
  export class WrappedCardSummaryComponent implements OnInit {

    @Input()
    content: WrappedCardSummaryContent

    constructor(public configService: ConfigService, public leagueService: LeagueService) {}
    
    ngOnInit(): void {
        this.content.standings.sort((a,b) => b.roster.teamMetrics.wins - a.roster.teamMetrics.wins || b.roster.teamMetrics.fpts - a.roster.teamMetrics.fpts);
    }

}

export class WrappedCardSummaryContent{
    first: LeagueTeam;
    second: LeagueTeam;
    bestOffense: LeagueTeam;
    worstOffense: LeagueTeam;
    bestTrade: WrappedCardTradeContent;
    standings: LeagueTeam[];
    totalWaivers: number;
    totalTrades: number;
    leagueName: string;
}
