import { Injectable } from '@angular/core';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { LeagueService } from 'src/app/services/league.service';
import { PlayerService } from 'src/app/services/player.service';
import { Status } from '../model/status';

@Injectable({
    providedIn: 'root'
})
export class LeagueFormatService {

    /** selected seasons from data filters */
    selectedSeasons: FormControl = new FormControl<number[]>([]);

    /** filtered players from query */
    filteredPlayers: FantasyPlayer[] = [];

    filterPosGroup: any[] = [];

    /** league positions in league */
    leaguePositions: string[] = [];

    /** league format loading status */
    leagueFormatStatus: Status = Status.LOADING;

    /** toggle advanced settings */
    isAdvancedFiltered: boolean = false;

    /** selected start week for data filter */
    selectedStartWeek: number = 1;

    /** selected end week for data filter */
    selectedEndWeek: number = 17;

    /** search value */
    searchVal: string = '';

    /** page index of table */
    pageIndex: number = 0;

    /** form control for postion filter dropdown */
    selectedPositions = new UntypedFormControl();

    /** emits on portfolio value updates */
    leagueFormatPlayerUpdated$: Subject<void> = new Subject<void>();

    /** form control for metrics dropdown */
    selectedMetrics = new UntypedFormControl(['player', 'pos', 'team', 'worpTier', 'worp',
        'week', 'spikeHigh', 'spikeMid', 'spikeLow', 'spikeHighP', 'spikeMidP', 'spikeLowP']);

    /** form control for data visualizations dropdown */
    selectedVisualizations = new UntypedFormControl(['worp', 'tradeValue/worp']);

    /** selected preset id */
    selectedPreset: number = 0;

    tableCache = {};

    /** advance query */
    query = {
        condition: 'and',
        rules: [
            { field: 'lf_opp', operator: '>=', value: '50' },
        ]
    };

    constructor(private playerService: PlayerService,
        private leagueService: LeagueService) { }

    applyFilters(): void {
        this.filteredPlayers = this.playerService.playerValues.filter(p => p.position != 'PI'
            && this.leagueService.leagueFormatMetrics?.[p.name_id]?.c)
            .filter(p => (p.full_name.toLowerCase().includes(this.searchVal.toLowerCase()) ||
                p.team.toLowerCase().includes(this.searchVal.toLowerCase()) ||
                p.owner?.ownerName.toLowerCase().includes(this.searchVal.toLowerCase())) &&
                this.selectedPositions.value.includes(p.position));
    }

    /**
     * Load presets for format tool
     * @param type preset to load
     */
    loadPreset(type: number): void {
        switch (type) {
            case 3:
                this.selectedVisualizations.setValue(['worp', 'tradeValue/worp']);
                this.selectedMetrics.setValue(['player', 'pos', 'team', 'owner', 'worpTier', 'worp', 'worppg', 'tradeValue']);
                break;
            case 2:
                this.selectedVisualizations.setValue(['oppg', 'ppo']);
                this.selectedMetrics.setValue(['player', 'pos', 'team', 'owner', 'opp', 'oppg', 'ppo', 'snpP']);
                break;
            case 1:
                this.selectedVisualizations.setValue(['spikeMidP', 'spikeHighP']);
                this.selectedMetrics.setValue(['player', 'pos', 'team', 'owner', 'week', 'spikeHigh', 'spikeMid', 'spikeLow', 'spikeHighP', 'spikeMidP', 'spikeLowP']);
                break;
            default:
                this.selectedVisualizations.setValue(['worp']);
                this.selectedMetrics.setValue(['player', 'pos', 'team', 'owner', 'worpTier', 'worp', 'worppg', 'tradeValue']);
        }
        this.selectedPreset = type;
        this.leagueFormatPlayerUpdated$.next();
    }

    /** load league format from selected filters */
    loadLeagueFormat(): void {
        this.leagueFormatStatus = Status.LOADING;
        this.filteredPlayers = [];
        this.leagueService.loadLeagueFormat$(this.selectedSeasons.value, this.selectedStartWeek, this.selectedEndWeek)
            .subscribe(_ => {
                const positionFilterList = this.leagueService.selectedLeague.rosterPositions
                    .filter(p => !['BN', 'FLEX', 'SUPER_FLEX', 'IDP_FLEX'].includes(p));
                if (this.leagueService.selectedLeague.rosterPositions.includes('FLEX'))
                    positionFilterList.push(...['RB', 'WR', 'TE'])
                if (this.leagueService.selectedLeague.rosterPositions.includes('SUPER_FLEX'))
                    positionFilterList.push(...['QB', 'RB', 'WR', 'TE'])
                if (this.leagueService.selectedLeague.rosterPositions.includes('IDP_FLEX'))
                    positionFilterList.push(...['DL', 'LB', 'DB']);
                this.leaguePositions = Array.from(new Set(positionFilterList));
                this.selectedPositions.setValue(this.leaguePositions);
                this.leagueFormatPlayerUpdated$.next();
            });
    }

}

export enum WoRPTiers {
    LeagueWinner,
    Elite,
    Starter,
    Bench,
    Clogger,
    Droppable
}
