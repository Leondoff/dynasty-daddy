import { Component, Input, OnInit } from "@angular/core";
import { ConfigService } from "src/app/services/init/config.service";

@Component({
    selector: 'app-wrapped-card-trade',
    templateUrl: './wrapped-card-trade.component.html',
    styleUrls: ['./wrapped-card-trade.component.css']
})
export class WrappedCardTradeComponent implements OnInit {

    @Input()
    content: WrappedCardTradeContent

    team1Adds: string[] = [];
    team2Adds: string[] = [];

    @Input()
    showTradeWinner: boolean = false;

    constructor(public configService: ConfigService) { }

    ngOnInit(): void {
        this.team1Adds = this.content.team1Adds.length > 5 ?
            this.formatTradePackage(this.content.team1Adds) : this.content.team1Adds;
        this.team2Adds = this.content.team2Adds.length > 5 ?
            this.formatTradePackage(this.content.team2Adds) : this.content.team2Adds;
    }

    /**
     * Format picks to consolidate them
     * @param tradedPlayers string array of players in trade
     */
    private formatTradePackage(tradedPlayers: string[]): string[] {
        const result = tradedPlayers.reduce((acc, str) => {
            // Regular expression to match ordinal numbers (1st, 2nd, 3rd, etc.)
            const ordinalMatches = str.match(/\d+(st|nd|rd|th)/g);

            if (ordinalMatches) {
                ordinalMatches.forEach(match => {
                    if (acc[match]) {
                        acc[match]++;
                    } else {
                        acc[match] = 1;
                    }
                });
            } else {
                acc['other'].push(str);
            }

            return acc;
        }, { other: [] });

        // Create an array of grouped ordinal strings
        const groupedOrdinals = [];
        Object.keys(result).forEach(ordinal => {
            if (ordinal === 'other') {
                groupedOrdinals.push(...result[ordinal]);
            } else {
                const count = result[ordinal];
                groupedOrdinals.push(`${count} ${count === 1 ? ordinal : ordinal + 's'}`);
            }
        });
        return groupedOrdinals;
    }
}

export class WrappedCardTradeContent {
    team1: string;
    team2: string;
    team1Adds: string[];
    team2Adds: string[];
}
