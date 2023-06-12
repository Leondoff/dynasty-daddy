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

    /** mat tab group index */
    selectedTab: string = '0';

    /** selected year for fetching current portfolio */
    selectedYear: string;

    /** league load chunk size */
    LEAGUE_CHUNK_SIZE: number = 20;

    /** error message for mfl errors */
    mflErrorMsg: string = '';

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
                this.sleeperService.fetchAllLeaguesForUser$(this.portfolioService.sleeperUsername, this.selectedYear).subscribe(leagueUser => {
                    this.portfolioService.portfolio.leagues[LeaguePlatform.SLEEPER] = leagueUser;
                    this.portfolioService.setPlatformIdMaps(LeaguePlatform.SLEEPER);
                    this.portfolioService.portfolioLeaguesAdded$.next();
                });
                break;
            }
            case LeaguePlatform.FLEAFLICKER: {
                this.fleaflickerService.fetchAllLeaguesForUser$(this.portfolioService.fleaflickerEmail, this.selectedYear).subscribe(leagueUser => {
                    this.portfolioService.portfolio.leagues[LeaguePlatform.FLEAFLICKER] = leagueUser;
                    this.portfolioService.leagueBatches[LeaguePlatform.FLEAFLICKER] = new Array(Math.round(leagueUser.leagues.length/this.LEAGUE_CHUNK_SIZE) + 1).fill(false);
                    this.portfolioService.setPlatformIdMaps(LeaguePlatform.FLEAFLICKER);
                    this.portfolioService.portfolioLeaguesAdded$.next();
                });
                break;
            }
            case LeaguePlatform.MFL: {
                this.mflService.fetchAllLeaguesForUser$(this.portfolioService.mflUsername, this.portfolioService.mflPassword, this.selectedYear).subscribe(leagueUser => {
                    this.mflErrorMsg = '';
                    this.portfolioService.portfolio.leagues[LeaguePlatform.MFL] = leagueUser;
                    this.portfolioService.portfolioMFLUserId = this.mflService.mflUserId;
                    this.portfolioService.leagueBatches[LeaguePlatform.MFL] = new Array(Math.round(leagueUser.leagues.length/this.LEAGUE_CHUNK_SIZE) + 1).fill(false);
                    if (leagueUser?.leagues?.length > 0) {
                        this.portfolioService.setPlatformIdMaps(LeaguePlatform.MFL, leagueUser?.leagues[0]?.leagueId, this.selectedYear);
                    }
                    this.portfolioService.portfolioLeaguesAdded$.next();
                },
                error => {
                    this.mflErrorMsg = 'Unable to login. Make sure Username/Password are correct.'
                    this.portfolioService.connectAccountStatus = Status.DONE;
                });
                break;
            }
        }
    }

    /**
     * load league chunk
     * @param platform platform id
     * @param chunkNumber chunk number
     */
    loadLeagueChunk(platform: LeaguePlatform, chunkNumber: number): void {
        this.portfolioService.connectAccountStatus = Status.LOADING;
        switch (platform) {
            case LeaguePlatform.MFL: {
                this.mflService.loadLeagueFromList$(this.portfolioService.portfolio.leagues[LeaguePlatform.MFL].leagues.slice((chunkNumber * this.LEAGUE_CHUNK_SIZE), (chunkNumber * this.LEAGUE_CHUNK_SIZE) + this.LEAGUE_CHUNK_SIZE), this.selectedYear).subscribe(leagues => {
                    leagues.forEach((l, i) => {
                        this.portfolioService.portfolio.leagues[LeaguePlatform.MFL].leagues[i + (chunkNumber * this.LEAGUE_CHUNK_SIZE)] = l;
                    });
                    this.portfolioService.leagueBatches[LeaguePlatform.MFL][chunkNumber] = true;
                    if (leagues?.length > 0) {
                        this.portfolioService.setPlatformIdMaps(LeaguePlatform.MFL, leagues[0]?.leagueId, this.selectedYear);
                    }
                    this.portfolioService.portfolioLeaguesAdded$.next();
                });
                break;
            }
            case LeaguePlatform.FLEAFLICKER: {
                this.fleaflickerService.loadLeagueFromList$(this.portfolioService.portfolio.leagues[LeaguePlatform.FLEAFLICKER].leagues.slice((chunkNumber * this.LEAGUE_CHUNK_SIZE), (chunkNumber * this.LEAGUE_CHUNK_SIZE) + this.LEAGUE_CHUNK_SIZE), this.selectedYear).subscribe(leagues => {
                    leagues.forEach((l, i) => {
                        this.portfolioService.portfolio.leagues[LeaguePlatform.FLEAFLICKER].leagues[i + (chunkNumber * this.LEAGUE_CHUNK_SIZE)] = l;
                    });
                    this.portfolioService.leagueBatches[LeaguePlatform.FLEAFLICKER][chunkNumber] = true;
                    if (leagues?.length > 0) {
                        this.portfolioService.setPlatformIdMaps(LeaguePlatform.FLEAFLICKER, leagues[0]?.leagueId, this.selectedYear);
                    }
                    this.portfolioService.portfolioLeaguesAdded$.next();
                });
                break;
            }
        }
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
