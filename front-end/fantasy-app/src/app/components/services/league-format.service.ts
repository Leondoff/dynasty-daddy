import { Injectable } from '@angular/core';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';

@Injectable({
    providedIn: 'root'
})
export class LeagueFormatService {

    selectedSeason: number = null;

    filteredPlayers: FantasyPlayer[] = [];

    filterPosGroup: any[] = [];

    columnsToDisplay = ['player', 'pos', 'team', 'worpTier', 'worp',
        'week', 'spikeHigh', 'spikeMid',
        'spikeLow', 'spikeHighP', 'spikeMidP', 'spikeLowP'];

    selectedVisualizations: string[] = ['worp', 'spikeMidP']

    tableCache = {};

    constructor() { }

}

export enum WoRPTiers {
    LeagueWinner,
    Elite,
    Starter,
    Bench,
    Clogger,
    Droppable
}
