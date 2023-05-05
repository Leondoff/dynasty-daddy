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
import { ConfigService } from 'src/app/services/init/config.service';
import { LeagueLoginModalComponent } from '../modals/league-login-modal/league-login-modal.component';
import { UntypedFormControl } from '@angular/forms';
import { DownloadService } from 'src/app/services/utilities/download.service';
import { FilterPortfolioModalComponent } from '../modals/filter-portfolio-modal/filter-portfolio-modal.component';
import { QueryService } from 'src/app/services/utilities/query.service';
import { Portfolio } from '../model/portfolio';

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
        private queryService: QueryService,
        private downloadService: DownloadService,
        public portfolioService: PortfolioService) {
        super();
    }

    ngOnInit(): void {
        // if portfolio exists in localstorage fetch it 
        if (!this.portfolioService.portfolio && localStorage.getItem('portfolio')) {
            this.portfolioService.portfolio = JSON.parse(localStorage.getItem('portfolio'))
        }
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
            this.portfolioService.portfolioLeaguesAdded$.subscribe(() => {
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
        this.filteredPortfolio = this.playerPortfolioWithValue
            .filter(p => this.portfolioService.playerHoldingMap[p.name_id].shares > 0)
            .filter(p => {
                return p.position == 'QB' && this.posFilter[0] || p.position == 'RB' && this.posFilter[1]
                    || p.position == 'WR' && this.posFilter[2] || p.position == 'TE' && this.posFilter[3]
                    || (!['QB', 'RB', 'WR', 'TE'].includes(p.position) && this.posFilter[4]);
            }).filter(p => p.full_name.toLowerCase().includes(this.searchVal.toLowerCase()));
        // if advanced filtering is enabled
        if (this.portfolioService.advancedFiltering) {
            this.filteredPortfolio = this.queryService.processRulesetForPlayer(this.filteredPortfolio, this.portfolioService.query) || [];
        }
        this.portfolioStatus = Status.DONE;
    }

    /** wrapper around reseting search functionality */
    clearSearchVal(): void {
        this.searchVal = '';
        this.setUpPortfolio();
    }

    /**
     * manually clear portfolio cache
     */
    clearPortfolio(): void {
        this.portfolioService.portfolio = new Portfolio();
        this.portfolioService.appliedLeagues = [];
        localStorage.removeItem('portfolio');
        this.selectableLeagues = [];
        this.selectedLeagues.reset();
        this.portfolioService.portfolioValuesUpdated$.next();
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

    /**
     * Load portfolio leagues and map to players in Dynasty Daddy
     */
    refreshPortfolio(): void {
        this.portfolioStatus = Status.LOADING;
        this.portfolioService.appliedLeagues = this.selectedLeagues?.value || [];
        this.portfolioService.updatePortfolio()
    }

    /**
     * Format portfolio for download
     */
    exportPortfolioTable(): void {
        const playerData: any[][] = []
        playerData.push([
            ['Name', 'Position', 'Age', 'Shares', 'Exposure %', 'Price (SF)', 'Price (STD)', 'Total Value', 'Pos Group %', 'Monthly Trend (SF)', 'Monthly Trend (STD)'],
        ]);
        this.playerPortfolioWithValue.slice()
            .sort((a, b) => this.portfolioService.playerHoldingMap[b.name_id].shares - this.portfolioService.playerHoldingMap[a.name_id].shares ||
                this.portfolioService.playerHoldingMap[b.name_id].totalValue - this.portfolioService.playerHoldingMap[a.name_id].totalValue)
            .forEach((player) => {
                const playerRow = [player?.full_name, player?.position || '-', player?.age || '-',
                this.portfolioService.playerHoldingMap[player.name_id].shares,
                Math.round((this.portfolioService.playerHoldingMap[player.name_id].shares / this.portfolioService.leagueCount) * 100) + '%',
                `${player?.sf_trade_value || 0}`,
                `${player?.trade_value || 0}`,
                this.portfolioService.playerHoldingMap[player.name_id].totalValue || 0,
                this.portfolioService.positionGroupValueMap[player.position] != 0 ?
                    Math.round(((this.portfolioService.playerHoldingMap[player.name_id]?.totalValue || 0) /
                        this.portfolioService.positionGroupValueMap[player.position]) * 100) + '%' : '0%',
                `${player?.sf_change || 0}% (${player?.last_month_value_sf || 0})`,
                `${player?.standard_change || 0}% (${player?.last_month_value || 0})`
                ];
                playerData.push(playerRow);
            });

        const formattedDraftData = playerData.map(e => e.join(',')).join('\n');

        const filename = `Dynasty_Daddy_Portfolio_${new Date().toISOString().slice(0, 10)}.csv`;

        this.downloadService.downloadCSVFile(formattedDraftData, filename);
    }

    /**
     * open advanced filtering modal
     */
    openPlayerQuery(): void {
        this.dialog.open(FilterPortfolioModalComponent
            , {
                minHeight: '350px',
                minWidth: this.configService.isMobile ? '300px' : '500px',
            }
        );
    }

    /**
     * handles disabling advanced filtering when active
     */
    disableAdvancedFilter(): void {
        this.portfolioService.advancedFiltering = false;
        this.portfolioService.portfolioValuesUpdated$.next();
    }
}
