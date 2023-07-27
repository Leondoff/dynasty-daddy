import { Injectable } from '@angular/core';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { LeagueService } from 'src/app/services/league.service';

@Injectable({
    providedIn: 'root'
})
export class LeagueFormatService {

    selectedSeason: number = 2022;

    filteredPlayers: FantasyPlayer[] = [];

    filterPosGroup: any[] = [];

    constructor(private leagueService: LeagueService) { }

}
