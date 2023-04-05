import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { LeaguePlatform } from 'src/app/model/league/FantasyPlatformDTO';
import { LeagueService } from 'src/app/services/league.service';
import { PlayerService } from 'src/app/services/player.service';
import { BaseComponent } from "../base-component.abstract";
import { MatDialog } from '@angular/material/dialog';
import { Status } from '../model/status';
import { LeagueSwitchService } from '../services/league-switch.service';
import { PortfolioService } from '../services/portfolio.service';
import { delay } from 'rxjs/operators';
import { ConfigService } from 'src/app/services/init/config.service';
import { LeagueLoginModalComponent } from '../modals/league-login-modal/league-login-modal.component';
import { UntypedFormControl } from '@angular/forms';

@Component({
    selector: 'app-fantasy-portfolio',
    templateUrl: './fantasy-portfolio.component.html',
    styleUrls: ['./fantasy-portfolio.component.css']
})
export class FantasyPortfolioComponent extends BaseComponent implements OnInit {

    /** Loading status for the portfolio tool */
    portfolioStatus: Status = Status.LOADING;

    /** players with fantasy value */
    playerPortfolioWithValue: FantasyPlayer[] = [];

    /** filtered players with fantasy value */
    filteredPortfolio: FantasyPlayer[] = [];

    /** selectable leagues */
    selectableLeagues: { name: string, leagueId: string, platform: LeaguePlatform }[] = [];

    /** form control for leagues dropdown */
    selectedLeagues = new UntypedFormControl();

    /** search string for page */
    searchVal: string = '';

    /** position filter */
    posFilter: boolean[] = [true, true, true, true, true];

    constructor(public playerService: PlayerService,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private leagueSwitchService: LeagueSwitchService,
        public leagueService: LeagueService,
        public configService: ConfigService,
        public portfolioService: PortfolioService) {
        super();
    }

    ngOnInit(): void {
        this.playerService.loadPlayerValuesForToday();
        this.setUpPortfolio();
        this.updateConnectedLeagues();
        this.addSubscriptions(
            this.route.queryParams.subscribe(params => {
                this.leagueSwitchService.loadFromQueryParams(params);
            }),
            this.portfolioService.portfolioValuesUpdated$.subscribe(() => {
                this.setUpPortfolio();
            }),
            this.portfolioService.portfolioLeaguesAdded$.pipe(delay(3000)).subscribe(() => {
                this.portfolioService.connectAccountStatus = Status.DONE;
                this.updateConnectedLeagues();
            })
        );
    }

    /**
     * set up portfolio page
     */
    setUpPortfolio(): void {
        this.playerPortfolioWithValue = this.portfolioService.playersWithValue;
        this.filteredPortfolio = this.playerPortfolioWithValue.filter(p => {
            return p.position == 'QB' && this.posFilter[0] || p.position == 'RB' && this.posFilter[1]
                || p.position == 'WR' && this.posFilter[2] || p.position == 'TE' && this.posFilter[3]
                || (!['QB', 'RB', 'WR', 'TE'].includes(p.position) && this.posFilter[4]);
        }).filter(p => p.full_name.toLowerCase().includes(this.searchVal.toLowerCase()));
        this.portfolioStatus = Status.DONE;
    }

    /** wrapper around reseting search functionality */
    clearSearchVal(): void {
        this.searchVal = '';
        this.setUpPortfolio();
    }

    /**
     * handles updating the selectable leagues and selected leagues when changes are made
     */
    private updateConnectedLeagues(): void {
        const leagues = [];
        this.portfolioService.portfolio?.leagues?.forEach(plat => {
            plat?.leagues?.filter(l => l.metadata['status'] == Status.DONE).forEach(l => {
                leagues.push({ name: l.name, leagueId: l.leagueId, platform: plat.leaguePlatform });
            });
        });
        this.selectableLeagues = leagues;
        this.selectedLeagues.setValue(this.selectableLeagues);
    }

    /**
     * open league login modal for managing leagues
     */
    openLeagueLoginModal(): void {
        this.dialog.open(LeagueLoginModalComponent
            , {
                minHeight: '350px',
                minWidth: this.configService.isMobile ? '300px' : '500px',
            }
        );
    }

    refreshPortfolio(): void {
        this.portfolioService.appliedLeagues = this.selectedLeagues.value;
        this.portfolioService.updatePortfolio()
    }
}
