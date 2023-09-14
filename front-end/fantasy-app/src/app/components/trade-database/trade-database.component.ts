import { Component, OnDestroy, OnInit } from "@angular/core";
import { BaseComponent } from "../base-component.abstract";
import { FormControl, UntypedFormControl } from "@angular/forms";
import { ReplaySubject, Subject } from "rxjs";
import { FantasyPlayer } from "src/app/model/assets/FantasyPlayer";
import { PlayerService } from "src/app/services/player.service";
import { takeUntil } from "rxjs/operators";
import { LeagueSwitchService } from "../services/league-switch.service";
import { ActivatedRoute } from "@angular/router";
import { TradeDatabaseService } from "../services/trade-database.service";
import { Status } from "../model/status";
import { LeagueService } from "src/app/services/league.service";
import { LeagueType } from "src/app/model/league/LeagueDTO";
import { FantasyPlayerApiService } from "src/app/services/api/fantasy-player-api.service";
import { BarChartColorPalette, ComparisonColorPalette, TierColorPalette } from "src/app/services/utilities/color.service";
import { ConfigService } from "src/app/services/init/config.service";

@Component({
    selector: 'app-trade-database',
    templateUrl: './trade-database.component.html',
    styleUrls: ['./trade-database.component.scss']
})
export class TradeDatabaseComponent extends BaseComponent implements OnInit, OnDestroy {

    /** page description and SEO */
    pageDescription = 'Search from over a quarter million fantasy football trades from actual leagues. The database updates daily.';

    /** control for the selected player */
    public playerCtrl: UntypedFormControl = new UntypedFormControl();

    /** control for the MatSelect filter keyword */
    public playerFilterCtrl: FormControl = new FormControl();

    /** list of players filtered by search keyword */
    public filteredSideAPlayers: ReplaySubject<FantasyPlayer[]> = new ReplaySubject<FantasyPlayer[]>(1);

    /** control for the selected player */
    public player2Ctrl: UntypedFormControl = new UntypedFormControl();

    /** control for the MatSelect filter keyword */
    public player2FilterCtrl: UntypedFormControl = new UntypedFormControl();

    /** list of players filtered by search keyword */
    public filteredSideBPlayers: ReplaySubject<FantasyPlayer[]> = new ReplaySubject<FantasyPlayer[]>(1);

    /** scoring format options for trade db */
    public scoringFormat: number[] = [0, 0.5, 1.0];

    /** tep format options for trade db */
    public tepFormat: number[] = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5];

    /** qb format options for trade db */
    public qbFormat: number[] = [1, 2];

    /** team format options for trade db */
    public teamFormat: number[] = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

    /** starter format options for trade db */
    public starterFormat: number[] = [6, 7, 8, 9, 10, 11, 12, 13, 14];

    /** league type format options for trade db */
    public leagueType: string[] = ['Dynasty', 'Redraft'];

    /** Subject that emits when the component has been destroyed. */
    protected _onDestroy = new Subject<void>();

    /** player list to add to trade database */
    public playerList: FantasyPlayer[] = [];

    /** loading status for trade searches */
    public tradeSearchStatus: Status = Status.NONE;

    /** loading status for trade volume */
    public tradeVolumeStatus: Status = Status.NONE;

    /** volume data formatted for circle pack */
    public volumeData: any[] = [];

    constructor(private playerService: PlayerService,
        public tradeDatabaseService: TradeDatabaseService,
        private route: ActivatedRoute,
        public configService: ConfigService,
        public leagueService: LeagueService,
        private fantasyPlayerApiService: FantasyPlayerApiService,
        private leagueSwitchService: LeagueSwitchService) {
        super();
    }

    ngOnInit(): void {
        if (this.playerService.playerValues.length === 0) {
            this.playerService.loadPlayerValuesForToday();
        } else {
            this.initializeTradeDB();
        }
        this.addSubscriptions(this.playerService.currentPlayerValuesLoaded$.subscribe(() => {
            this.initializeTradeDB();
        }),
            this.route.queryParams.subscribe(params => {
                this.leagueSwitchService.loadFromQueryParams(params);
            })
        );
    }

    /**
     * get color for circle based on position
     * @param pos string for position
     */
    private getColorForPos(pos: string): string {
        const colorList = ComparisonColorPalette;
        switch (pos) {
            case 'QB':
                return colorList[0]
            case 'RB':
                return colorList[1]
            case 'WR':
                return colorList[2]
            case 'TE':
                return colorList[3]
            default:
                return colorList[4]
        }
    }

    private initializeTradeDB(): void {
        // load recent trade volume for bubble pack
        this.tradeVolumeStatus = Status.LOADING;
        this.addSubscriptions(this.fantasyPlayerApiService.loadRecentTradeVolume().subscribe(res => {
            this.volumeData = [];
            res.sort((a, b) => Number(b.count) - Number(a.count)).slice(0, this.configService.isMobile ? 30 : 50).forEach(p => {
                const player = this.playerService.getPlayerByPlayerPlatformId(p.id)
                const name = player ? `${player.first_name[0]}. ${player.last_name}` : ''
                const tooltipStr = '<span style="font-weight: bold;">' + name + '</span>'
                    + "<br>" + p.count + " trades"
                    + "<br><hr>" + "Pos: " + p.position
                    + "<br>" + "Overall Rank: " + p.rank
                    + "<br>" + "Pos Rank:" + p.position_rank
                    + '<br><span style="font-style: italic">Click to search trades</span>'
                this.volumeData.push({
                    'label': name,
                    'color': this.getColorForPos(p.position),
                    'value': Number(p.count),
                    'id': p.id,
                    'tooltip': tooltipStr
                }
                )
            });
            this.tradeVolumeStatus = Status.DONE;
        }))
        this.playerList = this.playerService.unfilteredPlayerValues
            .filter(p => p.position != 'PI' || p.position == 'PI' && p.name_id.includes('mid')).slice()
        // load the initial player list
        this.filteredSideAPlayers.next(this.playerList.slice(0, 10));
        this.filteredSideBPlayers.next(this.playerList.slice(0, 10));

        this.playerFilterCtrl.setValue('')
        this.player2FilterCtrl.setValue('')

        // listen for search field value changes
        this.playerFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterPlayers(this.playerFilterCtrl, this.filteredSideAPlayers);
            });

        this.player2FilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterPlayers(this.player2FilterCtrl, this.filteredSideBPlayers);
            });

    }

    /**
     * filter players for selected dropdown
     * @protected
     */
    protected filterPlayers(filterCtrl: UntypedFormControl, filterSubscription: ReplaySubject<FantasyPlayer[]>): any {
        if (!this.playerList) {
            return;
        }

        // filter the players
        filterSubscription.next(
            this.playerList
                .filter(player => (((player?.full_name?.toLowerCase().indexOf(filterCtrl.value) > -1
                    || player?.owner?.ownerName?.toLowerCase().indexOf(filterCtrl.value) > -1
                    || player?.position?.toLowerCase().indexOf(filterCtrl.value) > -1))
                    && ((player.position == 'PI' && player.name_id.includes('mid'))
                        || !this.tradeDatabaseService.sideAPlayers.map(p => p.name_id).includes(player.name_id)
                        && !this.tradeDatabaseService.sideBPlayers.map(p => p.name_id).includes(player.name_id)))).slice(0, 10));
    }

    /**
     * Add a player to side a
     * @param player player to add
     */
    addPlayerToSideA(player: FantasyPlayer): void {
        this.tradeDatabaseService.sideAPlayers.push(player)
        this.filterPlayers(this.player2FilterCtrl, this.filteredSideBPlayers);
    }

    /**
     * Add a player to side b
     * @param player player to add
     */
    addPlayerToSideB(player: FantasyPlayer): void {
        this.tradeDatabaseService.sideBPlayers.push(player)
        this.filterPlayers(this.playerFilterCtrl, this.filteredSideAPlayers);
    }

    /**
     * Remove a player from side a
     * @param player player to remove
     */
    removeFromSideA(player: FantasyPlayer): void {
        this.tradeDatabaseService.sideAPlayers = this.tradeDatabaseService.sideAPlayers.filter(p => p.name_id !== player.name_id);
        this.filterPlayers(this.player2FilterCtrl, this.filteredSideBPlayers);
    }

    /**
     * Remove a player from side b
     * @param player player to remove
     */
    removeFromSideB(player: FantasyPlayer): void {
        this.tradeDatabaseService.sideBPlayers = this.tradeDatabaseService.sideBPlayers.filter(p => p.name_id !== player.name_id);
        this.filterPlayers(this.playerFilterCtrl, this.filteredSideAPlayers);
    }

    /**
     * Search trade databse based on filters
     */
    searchTradeDatabase(): void {
        this.tradeSearchStatus = Status.LOADING;
        this.addSubscriptions(this.tradeDatabaseService.searchTradeDatabase(this.tradeDatabaseService.tradePage, 12).subscribe(res => {
            this.tradeDatabaseService.tradeSearchResults = res;
            this.tradeSearchStatus = Status.DONE;
        }))
    }

    /**
     * wrapper for changing filters
     */
    changeFilters(): void {
        this.tradeDatabaseService.tradePage = 1;
        this.searchTradeDatabase();
    }

    /**
     * reset filters
     */
    resetFilters(): void {
        this.tradeDatabaseService.resetFilters();
    }

    /**
     * Change page by a certain amount
     * @param change number to change by
     */
    changePage(change: number): void {
        this.tradeDatabaseService.tradePage += change;
        this.searchTradeDatabase();
    }

    /**
     * Update filters to logged in league and search database
     */
    useMyLeague(): void {
        this.tradeDatabaseService.selectedLeagueTypeFormat
            .setValue(this.leagueService.selectedLeague.type === LeagueType.DYNASTY ? 'Dynasty' : 'Redraft');
        this.tradeDatabaseService.selectedQbFormat
            .setValue([this.leagueService.selectedLeague.isSuperflex ? 2 : 1]);
        this.tradeDatabaseService.selectedScoringFormat
            .setValue([this.leagueService.selectedLeague.scoringSettings.rec]);
        this.tradeDatabaseService.selectedStartersFormat
            .setValue([this.leagueService.selectedLeague.starters]);
        this.tradeDatabaseService.selectedTeamFormat
            .setValue([this.leagueService.selectedLeague.totalRosters]);
        this.tradeDatabaseService.selectedTepFormat
            .setValue([this.leagueService.selectedLeague.scoringSettings.bonusRecTE])
        this.changeFilters();
    }

    /**
     * Add player from chart to search and search the db
     * @param id player sleeper id
     */
    addPlayerFromChart(id: string): void {
        this.tradeDatabaseService.sideBPlayers = [];
        this.tradeDatabaseService.sideAPlayers = [];
        this.addPlayerToSideA(this.playerService.getPlayerByPlayerPlatformId(id));
        this.changeFilters();
    }

    ngOnDestroy(): void {
        this._onDestroy.next();
        this._onDestroy.complete();
    }
}
