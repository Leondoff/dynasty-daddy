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

    constructor(public configService: ConfigService) {}
    
    ngOnInit(): void {
    }

}

export class WrappedCardTradeContent{
    team1: string;
    team2: string;
    team1Adds: string[];
    team2Adds: string[];
}
