import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FantasyMarket } from 'src/app/model/assets/FantasyPlayer';
import { ConfigService } from 'src/app/services/init/config.service';
import { PlayerService } from 'src/app/services/player.service';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

@Component({
    selector: 'fantasy-market-dropdown',
    templateUrl: './fantasy-market-dropdown.component.html',
    styleUrls: ['./fantasy-market-dropdown.component.css']
})
export class FantasyMarketDropdownComponent implements OnInit {

    @Input()
    selectedMarket: FantasyMarket = FantasyMarket.KeepTradeCut;

    @Input()
    additionalOptions: any[] = [];

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

    constructor(private playerService: PlayerService,
        private configService: ConfigService,
        private gaService: GoogleAnalyticsService,
        private dialog: MatDialog) {

    }

    ngOnInit() {

    }

    changeMarket($event: any) {
        this.gaService.event('click', `click_${$event.value}`, 'fantasy_market')
        if ($event.value >= 100) {
            this.selectedMarketChange.emit($event.value);
        } else {
            this.playerService.loadPlayerValuesForFantasyMarket$($event.value).subscribe(() => {
                this.selectedMarketChange.emit($event.value);
            });
        }
    }
}