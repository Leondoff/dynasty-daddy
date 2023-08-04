import { OnInit, Component } from "@angular/core";
import { BaseComponent } from "../base-component.abstract";
import { PageService } from "src/app/services/utilities/page.service";
import { PlayerService } from "src/app/services/player.service";
import { LeagueSwitchService } from "../services/league-switch.service";
import { ActivatedRoute } from "@angular/router";
import { LeagueService } from "src/app/services/league.service";
import { LeagueFormatService } from "../services/league-format.service";
import { ConfigService } from "src/app/services/init/config.service";
import { Status } from "../model/status";
import { UntypedFormControl } from "@angular/forms";
import { NflService } from "src/app/services/utilities/nfl.service";
import { DownloadService } from "src/app/services/utilities/download.service";

@Component({
    selector: 'league-format-tool',
    templateUrl: './league-format.component.html',
    styleUrls: ['./league-format.component.scss']
})
export class LeagueFormatComponent extends BaseComponent implements OnInit {

    pageDescription = 'Identify positional advantages for your league by looking at historical quality starts and WoRP for your league\'s settings.';

    leagueFormatStatus: Status = Status.LOADING;

    searchVal: string = '';

    leaguePositions: string[] = [];

    showAdvancedSettings: boolean = false;

    /** form control for postion filter dropdown */
    selectedPositions = new UntypedFormControl();

    /** form control for metrics dropdown */
    selectedMetrics = new UntypedFormControl();

    /** form control for data visualizations dropdown */
    selectedVisualizations = new UntypedFormControl();

    formatPresetOptions = [
        { type: 0, display: 'WoRP View' },
        { type: 1, display: 'Spike Week View' },
        { type: 2, display: 'Opportunity View' }
    ]

    earliestSeason: number = 2019;

    selectableSeasons: number[] = [];

    availableMetrics: any[] = [
        { key: 'player', display: 'Player Name' },
        { key: 'pos', display: 'Position' },
        { key: 'owner', display: 'Fantasy Manager' },
        { key: 'team', display: 'NFL Team' },
        { key: 'worp', display: 'Wins Over Replacement (WoRP)' },
        { key: 'worppg', display: 'WoRP Per Game' },
        { key: 'winP', display: 'Player Win Percent' },
        { key: 'pts', display: 'Fantasy Points' },
        { key: 'ppg', display: 'Points Per Game' },
        { key: 'tradeValue', display: 'Fantasy Market Trade Value' },
        { key: 'opp', display: 'Fantasy Opportunity' },
        { key: 'oppg', display: 'Opportunities Per Game' },
        { key: 'ppo', display: 'Points Per Opportunity' },
        { key: 'week', display: 'Games Played' },
        { key: 'spikeHigh', display: 'High Spike Week Count' },
        { key: 'spikeMid', display: 'Mid Spike Week Count' },
        { key: 'spikeLow', display: 'Low Spike Week Count' },
        { key: 'spikeHighP', display: 'High Spike Week Percent' },
        { key: 'spikeMidP', display: 'Mid Spike Week Percent' },
        { key: 'spikeLowP', display: 'Low Spike Week Percent' },
    ];

    availableVisualizations: any[] = [
        { key: 'worp', display: 'Wins Over Replacement (WoRP)', type: 'line' },
        { key: 'worppg', display: 'WoRP Per Game', type: 'line' },
        { key: 'percent', display: 'Player Win Percent', type: 'line' },
        { key: 'pts', display: 'Fantasy Points', type: 'line' },
        { key: 'ppg', display: 'Points Per Game', type: 'line' },
        { key: 'opp', display: 'Fantasy Opportunities', type: 'line' },
        { key: 'oppg', display: 'Fantasy Opportunities Per Game', type: 'line' },
        { key: 'ppo', display: 'Points Per Opportunity', type: 'line' },
        { key: 'spikeHigh', display: 'High Spike Week Count', type: 'line' },
        { key: 'spikeMid', display: 'Mid Spike Week Count', type: 'line' },
        { key: 'spikeLow', display: 'Low Spike Week Count', type: 'line' },
        { key: 'spikeHighP', display: 'High Spike Week Percent', type: 'line' },
        { key: 'spikeMidP', display: 'Mid Spike Week Percent', type: 'line' },
        { key: 'spikeLowP', display: 'Low Spike Week Percent', type: 'line' }
    ];

    constructor(private pageService: PageService,
        private leagueSwitchService: LeagueSwitchService,
        public leagueService: LeagueService,
        public configService: ConfigService,
        public leagueFormatService: LeagueFormatService,
        private route: ActivatedRoute,
        private nflService: NflService,
        private downloadService: DownloadService,
        private playerService: PlayerService) {
        super();
        this.pageService.setUpPageSEO('League Format Tool',
            ['fantasy league format', 'worp tool', 'player worp', 'bestball', 'vorp', 'war'],
            this.pageDescription)
    }

    ngOnInit(): void {
        this.playerService.loadPlayerValuesForToday();
        this.selectedMetrics.setValue(this.leagueFormatService.columnsToDisplay);
        this.selectedVisualizations.setValue(this.leagueFormatService.selectedVisualizations);
        if (this.leagueService.selectedLeague) {
            this.loadNewSeason();
        }
        this.addSubscriptions(
            this.route.queryParams.subscribe(params => {
                this.leagueSwitchService.loadFromQueryParams(params);
            }),
            this.leagueSwitchService.leagueChanged$.subscribe(_ => {
                this.leagueService.loadLeagueFormat$(this.leagueFormatService.selectedSeason).subscribe(_ => {
                    this.leaguePositions = Array.from(new Set(this.leagueService.selectedLeague.rosterPositions
                        .filter(p => !['BN', 'FLEX', 'SUPER_FLEX', 'IDP_FLEX'].includes(p))));
                    this.selectedPositions.setValue(this.leaguePositions);
                    this.selectableSeasons = this.getSelectableSeasons(this.nflService.getYearForStats());
                    this.reloadFormatTool();
                });
            })
        );
    }

    /**
     * load new season for format
     */
    loadNewSeason(): void {
        this.leagueFormatStatus = Status.LOADING;
        this.leagueFormatService.filteredPlayers = [];
        this.leagueService.loadLeagueFormat$(this.leagueFormatService.selectedSeason).subscribe(_ => {
            this.leaguePositions = Array.from(new Set(this.leagueService.selectedLeague.rosterPositions
                .filter(p => !['BN', 'FLEX', 'SUPER_FLEX', 'IDP_FLEX'].includes(p))));
            this.selectedPositions.setValue(this.leaguePositions);
            this.selectableSeasons = this.getSelectableSeasons(this.nflService.getYearForStats());
            this.reloadFormatTool();
        });
    }

    /**
     * reload format tool data
     */
    reloadFormatTool(): void {
        this.leagueFormatService.filteredPlayers = this.playerService.playerValues.filter(p => p.position != 'PI'
            && this.leagueService.leagueFormatMetrics[this.leagueFormatService.selectedSeason]?.[p.name_id].c)
            .filter(p => p.full_name.toLowerCase().includes(this.searchVal.toLowerCase()) && this.selectedPositions.value.includes(p.position));
        this.leagueFormatService.columnsToDisplay = this.selectedMetrics.value;
        this.leagueFormatService.selectedVisualizations = this.selectedVisualizations.value;
        this.leagueFormatStatus = Status.DONE;
    }

    /** wrapper around reseting search functionality */
    clearSearchVal(): void {
        this.searchVal = '';
        this.reloadFormatTool();
    }

    /**
     * handles changing of fantasy market
     * @param $event 
     */
    onMarketChange($event: any): void {
        this.playerService.selectedMarket = $event;
        this.reloadFormatTool();
    }

    getSelectableSeasons(number: string) {
        const result = [];
        for (let i = Number(number); i >= this.earliestSeason; i--) {
            result.push(i);
        }
        return result;
    }

    /**
     * Take key and return display name for metric
     * @param key metric to get display for
     */
    getVisualizationDisplayName(key: string): string {
        return this.availableVisualizations.filter(val => val.key == key)[0].display;
    }

    /**
     * Load presets for format tool
     * @param type preset to load
     */
    loadPreset(type: number): void {
        switch (type) {
            case 2:
                this.selectedVisualizations.setValue(['oppg', 'ppo']);
                this.selectedMetrics.setValue(['player', 'pos', 'team', 'owner', 'opp', 'oppg', 'ppo']);
                break;
            case 1:
                this.selectedVisualizations.setValue(['spikeMidP', 'spikeHighP']);
                this.selectedMetrics.setValue(['player', 'pos', 'team', 'owner', 'week', 'spikeHigh', 'spikeMid', 'spikeLow', 'spikeHighP', 'spikeMidP', 'spikeLowP']);
                break;
            default:
                this.selectedVisualizations.setValue(['worp']);
                this.selectedMetrics.setValue(['player', 'pos', 'team', 'owner', 'worp', 'worppg', 'winP']);
        }
        this.reloadFormatTool();
    }

    /**
     * Download table data
     */
    exportTableData(): void {
        const playerData: any[][] = [];
        playerData.push(this.selectedMetrics.value);
        this.leagueFormatService.filteredPlayers.forEach(p => {
            const row = [];
            this.selectedMetrics.value.forEach(met => {
                row.push(this.leagueFormatService.tableCache[p.name_id]?.[met])
            });
            playerData.push(row);
        });
        const formattedDraftData = playerData.map(e => e.join(',')).join('\n');

        const filename = `Dynasty_Daddy_League_Format_${new Date().toISOString().slice(0, 10)}.csv`;

        this.downloadService.downloadCSVFile(formattedDraftData, filename);
    }
}
