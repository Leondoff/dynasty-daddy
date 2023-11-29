import { OnInit, Component } from "@angular/core";
import { BaseComponent } from "../base-component.abstract";
import { PageService } from "src/app/services/utilities/page.service";
import { PlayerService } from "src/app/services/player.service";
import { LeagueSwitchService } from "../services/league-switch.service";
import { ActivatedRoute } from "@angular/router";
import { LeagueService } from "src/app/services/league.service";
import { LeagueFormatService } from "../services/league-format.service";
import { ConfigKeyDictionary, ConfigService } from "src/app/services/init/config.service";
import { Status } from "../model/status";
import { FormControl } from "@angular/forms";
import { DownloadService } from "src/app/services/utilities/download.service";
import { MatDialog } from "@angular/material/dialog";
import { FilterLeagueFormatModalComponent } from "../modals/filter-league-format-modal/filter-league-format-modal.component";
import { QueryService } from "src/app/services/utilities/query.service";
import { LeagueFormatModalComponent } from "../modals/league-format-modal/league-format-modal.component";
import { CreatePresetModalComponent } from "../modals/create-preset-modal/create-preset-modal.component";
import { UserService } from "src/app/services/user.service";
import { ConfirmationDialogModal } from "../modals/confirmation-dialog/confirmation-dialog.component";

@Component({
    selector: 'league-format-tool',
    templateUrl: './league-format.component.html',
    styleUrls: ['./league-format.component.scss']
})
export class LeagueFormatComponent extends BaseComponent implements OnInit {

    /** page description and SEO */
    pageDescription = 'Identify positional advantages for your league by looking at historical quality starts and WoRP/WAR for your league\'s settings.';

    /** login error when no league selected */
    loginError: String = 'Unable to pull league format. Please select a league.';

    /** toggle advanced settings */
    showAdvancedSettings: boolean = false;

    /** control for the MatSelect filter keyword */
    visualizationFilter: FormControl = new FormControl();

    /** filtered visualizations when searching */
    filteredVisualizations: {}[] = [];

    formatPresetOptions = [
        { type: 0, display: 'WoRP View' },
        { type: 1, display: 'Spike Week View' },
        { type: 2, display: 'Opportunity View' },
        { type: 3, display: 'WoRP x Trade Value View' }
    ]

    /** available metrics to select */
    availableMetrics: any[] = [
        { key: 'player', display: 'Player Name' },
        { key: 'pos', display: 'Position' },
        { key: 'owner', display: 'Fantasy Manager' },
        { key: 'team', display: 'NFL Team' },
        { key: 'worpTier', display: 'WoRP Tier (Beta)' },
        { key: 'worp', display: 'Wins Over Replacement (WoRP)' },
        { key: 'worppg', display: 'WoRP Per Game' },
        { key: 'winP', display: 'Player Win Percent' },
        { key: 'pts', display: 'Fantasy Points' },
        { key: 'ppg', display: 'Points Per Game' },
        { key: 'snpP', display: 'Snap Percent' },
        { key: 'snppg', display: 'Snaps Per Game' },
        { key: 'pps', display: 'Points Per Snap' },
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

    /** available visualizations to select */
    availableVisualizations: any[] = [
        { key: 'worp', display: 'Wins Over Replacement (WoRP/WAR)', type: 'Line' },
        { key: 'worppg', display: 'WoRP Per Game', type: 'Line' },
        { key: 'tradeValue/worp', display: 'Trade Value x WoRP/WAR', type: 'Scatter' },
        { key: 'tradeValue/worppg', display: 'Trade Value x WoRP/WAR Per Game', type: 'Scatter' },
        { key: 'percent', display: 'Player Win Percent', type: 'Line' },
        { key: 'pts', display: 'Fantasy Points', type: 'Line' },
        { key: 'tradeValue/pts', display: 'Trade Value x Fantasy Points', type: 'Scatter' },
        { key: 'ppg', display: 'Points Per Game', type: 'Line' },
        { key: 'tradeValue/ppg', display: 'Trade Value x Points Per Game', type: 'Scatter' },
        { key: 'opp', display: 'Fantasy Opportunities', type: 'Line' },
        { key: 'oppg', display: 'Fantasy Opportunities Per Game', type: 'Line' },
        { key: 'ppo', display: 'Points Per Opportunity', type: 'Line' },
        { key: 'snpP', display: 'Snap Percent', type: 'Line' },
        { key: 'snppg', display: 'Snaps Per Week', type: 'Line' },
        { key: 'pps', display: 'Points Per Snap', type: 'Line' },
        { key: 'spikeHigh', display: 'High Spike Week Count', type: 'Line' },
        { key: 'spikeMid', display: 'Mid Spike Week Count', type: 'Line' },
        { key: 'spikeLow', display: 'Low Spike Week Count', type: 'Line' },
        { key: 'spikeHighP', display: 'High Spike Week Percent', type: 'Line' },
        { key: 'spikeMidP', display: 'Mid Spike Week Percent', type: 'Line' },
        { key: 'spikeLowP', display: 'Low Spike Week Percent', type: 'Line' },
        { key: 'spikeHighP/worp', display: 'High Spike Week Percent x WoRP/WAR', type: 'Scatter' },
        { key: 'spikeMidP/worp', display: 'Mid Spike Week Percent x WoRP/WAR', type: 'Scatter' },
        { key: 'spikeLowP/worp', display: 'Low Spike Week Percent x WoRP/WAR', type: 'Scatter' },
    ];

    constructor(private pageService: PageService,
        private leagueSwitchService: LeagueSwitchService,
        public leagueService: LeagueService,
        public configService: ConfigService,
        public leagueFormatService: LeagueFormatService,
        private route: ActivatedRoute,
        public userService: UserService,
        private queryService: QueryService,
        private dialog: MatDialog,
        private downloadService: DownloadService,
        private playerService: PlayerService) {
        super();
        this.pageService.setUpPageSEO('League Format Tool',
            ['fantasy league format', 'fantasy war tool', 'fantasy war',
                'fantasy football stats', 'fantasy football war',
                'worp tool', 'player worp', 'bestball', 'vorp', 'war'],
            this.pageDescription)
    }

    ngOnInit(): void {
        this.playerService.loadPlayerValuesForToday();
        this.filteredVisualizations = this.availableVisualizations;
        if (this.leagueFormatService.selectedSeasons.value.length === 0) {
            this.leagueFormatService.selectedSeasons.setValue(
                [Number(this.configService.getConfigOptionByKey(ConfigKeyDictionary.LEAGUE_FORMAT_SEASON)?.configValue || 2023)]
            )
        }
        if (this.leagueService.selectedLeague) {
            this.leagueFormatService.loadLeagueFormat();
        }
        this.addSubscriptions(
            this.route.queryParams.subscribe(params => {
                this.leagueSwitchService.loadFromQueryParams(params);
            }),
            this.leagueFormatService.leagueFormatPlayerUpdated$.subscribe(() => {
                this.reloadFormatTool();
            }),
            this.leagueSwitchService.leagueChanged$.subscribe(_ => {
                this.leagueFormatService.selectedSeasons.setValue(
                    [Number(this.configService.getConfigOptionByKey(ConfigKeyDictionary.LEAGUE_FORMAT_SEASON)?.configValue || 2023)]
                );
                this.leagueFormatService.loadLeagueFormat();
            }),
            this.visualizationFilter.valueChanges
                .subscribe(() => {
                    const searchVal = this.visualizationFilter.value.toLowerCase();
                    this.filteredVisualizations = this.availableVisualizations?.filter(l =>
                        l.display.toLowerCase().includes(searchVal)
                        || l.key.toLowerCase().includes(searchVal)
                        || l.type.toLowerCase().includes(searchVal))
                })
        );
    }

    /**
     * reload format tool data
     */
    reloadFormatTool(): void {
        this.leagueFormatService.applyFilters();
        if (this.leagueFormatService.isAdvancedFiltered) {
            this.leagueFormatService.filteredPlayers = this.queryService.processRulesetForPlayer(this.leagueFormatService.filteredPlayers, this.leagueFormatService.query) || [];
        }
        this.leagueFormatService.leagueFormatStatus = Status.DONE;
    }

    /** wrapper around reseting search functionality */
    clearSearchVal(): void {
        this.leagueFormatService.searchVal = '';
        this.leagueFormatService.leagueFormatPlayerUpdated$.next();
    }

    /**
     * handles changing of fantasy market
     * @param $event 
     */
    onMarketChange($event: any): void {
        this.playerService.selectedMarket = $event;
        this.leagueFormatService.leagueFormatPlayerUpdated$.next();
    }

    /**
     * Take key and return display name for metric
     * @param key metric to get display for
     */
    getVisualizationDisplayName(key: string): string {
        return this.availableVisualizations.filter(val => val.key == key)[0].display;
    }

    /**
     * Download table data
     */
    exportTableData(): void {
        const playerData: any[][] = [];
        playerData.push(this.leagueFormatService.selectedMetrics.value);
        this.leagueFormatService.filteredPlayers.forEach(p => {
            const row = [];
            this.leagueFormatService.selectedMetrics.value.forEach(met => {
                row.push(this.leagueFormatService.tableCache[p.name_id]?.[met])
            });
            playerData.push(row);
        });
        const formattedDraftData = playerData.map(e => e.join(',')).join('\n');

        const filename = `Dynasty_Daddy_League_Format_${new Date().toISOString().slice(0, 10)}.csv`;

        this.downloadService.downloadCSVFile(formattedDraftData, filename);
    }

    /**
     * open advanced filtering modal
     */
    openPlayerQuery(): void {
        this.dialog.open(FilterLeagueFormatModalComponent
            , {
                minHeight: '350px',
                minWidth: this.configService.isMobile ? '300px' : '500px',
            }
        );
    }

    /**
     * open league format modal
     */
    openLeagueFormatModal(): void {
        this.dialog.open(LeagueFormatModalComponent
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
        this.leagueFormatService.isAdvancedFiltered = false;
        this.leagueFormatService.leagueFormatPlayerUpdated$.next();
    }

    /**
     * Loads custom preset in league format tool 
     * @param preset custom preset to load
     */
    loadCustomPreset(preset: any): void {
        this.leagueFormatService.selectedMetrics.setValue(preset.table);
        this.leagueFormatService.selectedVisualizations.setValue(preset.charts);
        this.leagueFormatService.selectedPreset = preset.id;
    }

    /**
     * create a custom preset
     */
    createPreset(): void {
        if (this.userService.user) {
            const dialogRef = this.dialog.open(CreatePresetModalComponent
                , {
                    minHeight: '200px',
                    minWidth: this.configService.isMobile ? '300px' : '500px',
                    autoFocus: true,
                    data: {
                      presetNum: this.userService.user.lfPresets.length 
                    }
                }
            );
            dialogRef.afterClosed().subscribe(result => {
                if (result != '') {
                    const highestId = this.userService.user.lfPresets?.reduce((maxId, preset) => {
                        return preset.id > maxId ? preset.id : maxId;
                    }, 9);
                    const preset = {
                        id: highestId + 1,
                        charts: this.leagueFormatService.selectedVisualizations.value || ['worp'],
                        table: this.leagueFormatService.selectedMetrics.value,
                        name: result
                    }
                    this.userService.user.lfPresets.push(preset)
                    this.userService.setLFPresetsForUser(this.userService.user.lfPresets);
                    this.loadCustomPreset(preset);
                }
            });
        }
    }

    /**
     * Saves changes to a custom preset
     */
    saveChangesToCustomPreset(): void {
        const presetInd = this.userService.user.lfPresets.findIndex(p => p.id == this.leagueFormatService.selectedPreset);
        this.userService.user.lfPresets[presetInd].charts = this.leagueFormatService.selectedVisualizations.value || ['worp'];
        this.userService.user.lfPresets[presetInd].table = this.leagueFormatService.selectedMetrics.value;
        this.userService.setLFPresetsForUser(this.userService.user.lfPresets);
    }

    /**
     * Delete a custom preset
     */
    deleteCustomPreset(): void {
        const presetInd = this.userService.user.lfPresets.findIndex(p => p.id == this.leagueFormatService.selectedPreset);
        const dialogRef = this.dialog.open(ConfirmationDialogModal, {
            disableClose: true,
            autoFocus: true,
            data: {
                title: `Are you sure you want to delete the ${this.userService.user.lfPresets[presetInd].name} Preset?`
            }
        })
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.userService.user.lfPresets.splice(presetInd, 1);
                this.userService.setLFPresetsForUser(this.userService.user.lfPresets);
                if (presetInd > 0) {
                    this.loadCustomPreset(this.userService.user.lfPresets[presetInd - 1]);
                } else {
                    this.leagueFormatService.loadPreset(3);
                }
            }
        });
    }
}
