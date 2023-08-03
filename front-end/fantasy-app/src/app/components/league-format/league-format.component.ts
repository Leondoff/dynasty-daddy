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

    earliestSeason: number = 2019;

    selectableSeasons: number[] = [];

    availableMetrics: any[] = [
        { key: 'player', display: 'Player Name' },
        { key: 'pos', display: 'Position' },
        { key: 'team', display: 'NFL Team' },
        { key: 'worp', display: 'Wins over replacement (WoRP)' },
        { key: 'worppg', display: 'WoRP Per Game' },
        { key: 'winP', display: 'Win percent over replacement' },
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

    constructor(private pageService: PageService,
        private leagueSwitchService: LeagueSwitchService,
        public leagueService: LeagueService,
        public configService: ConfigService,
        public leagueFormatService: LeagueFormatService,
        private route: ActivatedRoute,
        private nflService: NflService,
        private playerService: PlayerService) {
        super();
        this.pageService.setUpPageSEO('League Format Tool',
            ['fantasy league format', 'worp tool', 'player worp', 'bestball', 'vorp', 'war'],
            this.pageDescription)
    }

    ngOnInit(): void {
        this.playerService.loadPlayerValuesForToday();
        this.selectedMetrics.setValue(this.leagueFormatService.columnsToDisplay);
        if (this.leagueService.selectedLeague) {
            this.addSubscriptions(this.leagueService.loadLeagueFormat$(this.leagueFormatService.selectedSeason).subscribe(_ => {
                this.leaguePositions = Array.from(new Set(this.leagueService.selectedLeague.rosterPositions
                    .filter(p => !['BN', 'FLEX', 'SUPER_FLEX', 'IDP_FLEX'].includes(p))));
                this.selectedPositions.setValue(this.leaguePositions);
                this.selectableSeasons = this.getSelectableSeasons(this.nflService.getYearForStats());
                this.reloadFormatTool();
            })
            );
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
     * reload format tool data
     */
    reloadFormatTool(): void {
        this.leagueFormatService.filteredPlayers = this.playerService.playerValues.filter(p => p.position != 'PI'
            && this.leagueService.leagueFormatMetrics[this.leagueFormatService.selectedSeason]?.[p.name_id].c)
            .filter(p => p.full_name.toLowerCase().includes(this.searchVal.toLowerCase()) && this.selectedPositions.value.includes(p.position));
        this.leagueFormatService.columnsToDisplay = this.selectedMetrics.value;
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
    onMarketChange($event): void {
        this.playerService.selectedMarket = $event;
        this.reloadFormatTool();
    }

    getSelectableSeasons(number) {
        const result = [];
        for (let i = number; i >= this.earliestSeason; i--) {
            result.push(i);
        }
        return result;
    }
}
