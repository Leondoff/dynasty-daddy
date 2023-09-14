import { Component, Input, OnInit } from "@angular/core";
import { TradeDatabaseItem } from "src/app/model/assets/TradeDatabase";
import { PlayerService } from "src/app/services/player.service";
import { ColorService } from "src/app/services/utilities/color.service";

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
        private playerService: PlayerService) {

    }

    ngOnInit(): void {
        const date = new Date(this.trade.transaction_date);
        const month = date.getMonth() + 1; // Months are zero-indexed, so add 1
        const day = date.getDate();

        this.dateString = `${month}/${day}`;

        switch(Number(this.trade.ppr)) {
            case 1:
                this.pprStr = 'Full';
                break;
            case 0.5:
                this.pprStr = 'Half';
                break;
            case 0:
                this.pprStr = "No";
                break;
            default:
                this.pprStr = Number(this.trade.ppr).toString();
        }
        this.tepStr = Number(this.trade.tep) === 0 ? "No" : Number(this.trade.tep).toString()
    }

    getAssetName(id: string): string {
        const player = this.playerService.unfilteredPlayerValues.find(p => p.position == 'PI' ? p.name_id == id : p.sleeper_id == id);
        return player?.full_name.length > 20 ? player?.first_name.substring(0,1) + '. ' + player?.last_name : player?.full_name;
    }

}
