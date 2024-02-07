import { Component, Input, OnInit } from "@angular/core";
import { TradeDatabaseItem } from "src/app/model/assets/TradeDatabase";
import { PlayerService } from "src/app/services/player.service";
import { ColorService } from "src/app/services/utilities/color.service";
import { DisplayService } from "src/app/services/utilities/display.service";

@Component({
    selector: 'trade-database-card',
    templateUrl: './trade-database-card.component.html',
    styleUrls: ['./trade-database-card.component.scss']
})
export class TradeDatabaseCardComponent implements OnInit {

    @Input()
    trade: TradeDatabaseItem

    dateString: string;

    tepStr: string;

    pprStr: string;

    constructor(public colorService: ColorService,
        private displayService: DisplayService,
        private playerService: PlayerService) {

    }

    ngOnInit(): void {
        const daysAgo = this.displayService.getDaysSinceDateString(this.trade.transaction_date);

        this.dateString = daysAgo <= 0 ? 'Today' : `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`;

        this.pprStr = this.displayService.getPPRFormatDisplay(Number(this.trade.ppr))
       
        this.tepStr = Number(this.trade.tep) === 0 ? "No" : Number(this.trade.tep).toString()
    }

    /**
     * Get display name for asset
     * @param id asset id
     */
    getAssetName(id: string): string {
        const player = this.playerService.unfilteredPlayerValues.find(p => p.position == 'PI' ? p.name_id == id : p.sleeper_id == id);
        if (player?.position === 'PI') {
            // Use a regular expression to match year and place
            const regex = /(\d{4})\s+(mid\s+)?(\d[st|nd|rd|th]+)/i;

            // Replace the matched values with the desired format
            const convertedValue = player.full_name.replace(regex, (match, year, mid, place) => {
                const placeText = place.toLowerCase()[0];
                return year + ' Round ' + placeText;
            });

            return convertedValue;
        } else {
            return player?.full_name.length > 20 ? player?.first_name.substring(0, 1) + '. ' + player?.last_name : player?.full_name;
        }
    }
}
