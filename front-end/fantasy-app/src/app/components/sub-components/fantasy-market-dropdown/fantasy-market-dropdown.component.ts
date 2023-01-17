import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FantasyMarket } from 'src/app/model/assets/FantasyPlayer';

@Component({
    selector: 'fantasy-market-dropdown',
    templateUrl: './fantasy-market-dropdown.component.html',
    styleUrls: ['./fantasy-market-dropdown.component.css']
})
export class FantasyMarketDropdown implements OnInit {

    @Input()
    selectedMarket: FantasyMarket = FantasyMarket.KeepTradeCut;

    @Output()
    selectedMarketChange: EventEmitter<FantasyMarket> = new EventEmitter<FantasyMarket>();

    fantasyMarkets = [{ 'num': FantasyMarket.KeepTradeCut, 'value': 'KeepTradeCut' }, { 'num': FantasyMarket.FantasyCalc, 'value': 'FantasyCalc' }]

    constructor() {

    }

    ngOnInit() {

    }

    changeMarket($event: any) {
        this.selectedMarketChange.emit($event.value);
    }
}