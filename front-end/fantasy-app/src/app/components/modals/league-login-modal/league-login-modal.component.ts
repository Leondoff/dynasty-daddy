import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LeaguePlatform } from 'src/app/model/league/FantasyPlatformDTO';
import { FleaflickerService } from 'src/app/services/api/fleaflicker/fleaflicker.service';
import { MflService } from 'src/app/services/api/mfl/mfl.service';
import { SleeperService } from 'src/app/services/api/sleeper/sleeper.service';
import { LeagueService } from 'src/app/services/league.service';
import { Portfolio } from '../../model/portfolio';
import { Status } from '../../model/status';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
    selector: 'app-league-login-modal',
    templateUrl: './league-login-modal.component.html',
    styleUrls: ['./league-login-modal.component.css']
})
export class LeagueLoginModalComponent implements OnInit {

    /** sleeper username input */
    usernameInput: string = '';

    /** mat tab group index */
    selectedTab: string = '0';

    /** fleaflicker email string */
    fleaflickerEmail: string = '';

    /** selected year for fetching current portfolio */
    selectedYear: string;

    /** mfl username */
    mflUsername: string = '';

    /** mfl password */
    mflPassword: string = '';

    constructor(private dialog: MatDialog,
        public portfolioService: PortfolioService,
        private sleeperService: SleeperService,
        private fleaflickerService: FleaflickerService,
        private mflService: MflService,
        public leagueService: LeagueService) {
    }

    ngOnInit(): void {
        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() - 2);
        this.selectedYear = currentDate.getFullYear().toString();
    }

    /**
     * Connect league to profile
     * @param platform League Platform to load
     */
    connectToLeague(platform: LeaguePlatform): void {
        this.portfolioService.connectAccountStatus = Status.LOADING;
        if (!this.portfolioService.portfolio) {
            this.portfolioService.portfolio = new Portfolio()
        }
        switch (platform) {
            case LeaguePlatform.SLEEPER: {
                this.sleeperService.fetchAllLeaguesForUser$(this.usernameInput, this.selectedYear).subscribe(leagueUser => {
                    this.portfolioService.portfolio.leagues[LeaguePlatform.SLEEPER] = leagueUser;
                    this.portfolioService.setPlatformIdMaps(LeaguePlatform.SLEEPER);
                });
                break;
            }
            case LeaguePlatform.FLEAFLICKER: {
                this.fleaflickerService.fetchAllLeaguesForUser$(this.fleaflickerEmail, this.selectedYear).subscribe(leagueUser => {
                    this.portfolioService.portfolio.leagues[LeaguePlatform.FLEAFLICKER] = leagueUser;
                    this.portfolioService.setPlatformIdMaps(LeaguePlatform.FLEAFLICKER);
                });
                break;
            }
            case LeaguePlatform.MFL: {
                this.mflService.fetchAllLeaguesForUser$(this.mflUsername, this.mflPassword, this.selectedYear).subscribe(leagueUser => {
                    this.portfolioService.portfolio.leagues[LeaguePlatform.MFL] = leagueUser;
                    if (leagueUser?.leagues.length > 0) {
                        this.portfolioService.setPlatformIdMaps(LeaguePlatform.MFL, leagueUser?.leagues[0]?.leagueId, this.selectedYear);
                    }
                });
                break;
            }
        }
        this.portfolioService.portfolioLeaguesAdded$.next();
    }

    /**
     * Disconnect user from portfolio
     * @param platform what platform to disconnect
     */
    disconnectUser(platform: LeaguePlatform): void {
        this.portfolioService.portfolio.leagues[platform] = null;
        this.portfolioService.portfolioLeaguesAdded$.next();
    }

    /**
     * close dialog
     */
    closeDialog(): void {
        this.dialog.closeAll();
    }
}
