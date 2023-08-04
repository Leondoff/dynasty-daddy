import { Injectable } from '@angular/core';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';

@Injectable({
    providedIn: 'root'
})
export class LeagueFormatService {

    selectedSeason: number = 2022;

    filteredPlayers: FantasyPlayer[] = [];

    filterPosGroup: any[] = [];

    columnsToDisplay = ['player', 'pos', 'team', 'worp',
        'worppg', 'ppo', 'week', 'spikeHigh', 'spikeMid',
        'spikeLow', 'spikeHighP', 'spikeMidP', 'spikeLowP'];

    selectedVisualizations: string[] = ['worp', 'spikeMidP']

    tableCache = {};

    constructor() { }

}
