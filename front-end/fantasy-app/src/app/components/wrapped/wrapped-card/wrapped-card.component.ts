import { Component, Input, OnInit } from "@angular/core";
import { ConfigService } from "src/app/services/init/config.service";

@Component({
    selector: 'app-wrapped-card',
    templateUrl: './wrapped-card.component.html',
    styleUrls: ['./wrapped-card.component.css']
})
  export class WrappedCardComponent implements OnInit {

    @Input()
    content: WrappedCardContent

    @Input()
    iconRank: boolean = false;

    constructor(public configService: ConfigService) {}
    
    ngOnInit(): void {
    }

}


export class WrappedCardContent{
    image: string;
    header: string;
    details: string;
    rank: string;
}
