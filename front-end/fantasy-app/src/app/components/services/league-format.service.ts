import { Injectable } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { LeagueService } from 'src/app/services/league.service';
import { PlayerService } from 'src/app/services/player.service';

@Injectable({
    providedIn: 'root'
})
export class LeagueFormatService {

    selectedSeason: number = null;

    filteredPlayers: FantasyPlayer[] = [];

    filterPosGroup: any[] = [];

    isAdvancedFiltered: boolean = false;

    searchVal: string = '';

    pageIndex: number = 0;

    /** form control for postion filter dropdown */
    selectedPositions = new UntypedFormControl();

    /** emits on portfolio value updates */
    leagueFormatPlayerUpdated$: Subject<void> = new Subject<void>();

    /** form control for metrics dropdown */
    selectedMetrics = new UntypedFormControl(['player', 'pos', 'team', 'worpTier', 'worp',
        'week', 'spikeHigh', 'spikeMid', 'spikeLow', 'spikeHighP', 'spikeMidP', 'spikeLowP']);

    /** form control for data visualizations dropdown */
    selectedVisualizations = new UntypedFormControl(['worp', 'spikeMidP']);

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
            && this.leagueService.leagueFormatMetrics[this.selectedSeason]?.[p.name_id]?.c)
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
        this.leagueFormatPlayerUpdated$.next();
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
