import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FantasyMarket } from 'src/app/model/assets/FantasyPlayer';
import { PlayerService } from 'src/app/services/player.service';

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

    // Dynasty Fantasy Markets
    dynastyFantasyMarkets = [
        { 'num': FantasyMarket.KeepTradeCut, 'value': 'KeepTradeCut' },
        { 'num': FantasyMarket.FantasyCalc, 'value': 'FantasyCalc' },
        { 'num': FantasyMarket.DynastyProcess, 'value': 'DynastyProcess' },
        { 'num': FantasyMarket.DynastySuperflex, 'value': 'DynastySuperflex' }
    ]

    // Redraft Fantasy Markets
    redraftFantasyMarkets = [
        { 'num': FantasyMarket.KeepTradeCutRedraft, 'value': 'KeepTradeCut (Redraft)' },
        { 'num': FantasyMarket.FantasyCalcRedraft, 'value': 'FantasyCalc (Redraft)' },
    ]

    constructor(private playerService: PlayerService) {

    }

    ngOnInit() {

    }

    changeMarket($event: any) {
        this.playerService.loadPlayerValuesForFantasyMarket$($event.value).subscribe(() => {
            this.selectedMarketChange.emit($event.value);
        });
    }

    /**
     * Open url
     */
    openUrl(url: string): void {
        window.open(url, "_blank");
    }
}