import { Injectable } from '@angular/core';
import { FantasyMarket, FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { LeagueType } from 'src/app/model/league/LeagueDTO';
import { LeagueService } from 'src/app/services/league.service';
import { PlayerService } from 'src/app/services/player.service';
import { QueryService } from 'src/app/services/utilities/query.service';

@Injectable({
    providedIn: 'root'
})
export class PlayerValueService {

    /** filtered list of players for searching */
    filteredPlayers: FantasyPlayer[];

    /** position group filters, [qb, rb, wr, te, picks] */
    filterPosGroup: boolean[] = [true, true, true, true, true];

    /** query object with query configuration */
    query = {
        condition: 'and',
        rules: [
            { field: 'sf_trade_value', operator: '>=', value: '6000' },
        ]
    };

    /** show rookies in table */
    showRookies: boolean = false;

    /** show free agents, only show if league is loaded */
    showFreeAgents: boolean = false;

    /** search value from search box */
    searchVal: string;

    /** is sorted order superflex or not */
    isSuperFlex: boolean = true;

    /** do we apply the advanced filter or not */
    isAdvancedFiltered: boolean = false;

    /** page index of player values table */
    pageIndex: number = 0;

    constructor(private leagueService: LeagueService,
        private queryService: QueryService,
        private playerService: PlayerService) { }

    applyFilters(): void {
        const newPlayers = this.handleFilteringPlayerTable();
        this.filteredPlayers = this.isAdvancedFiltered === true ? this.queryService.processRulesetForPlayer(newPlayers, this.query) : newPlayers;
        this.updatePlayerFilters();
    }

    /**
   * Helper function that encapsulates cleaning old player data and filtering list on league type
   */
    private handleFilteringPlayerTable(): FantasyPlayer[] {
        let players = this.playerService.cleanOldPlayerData();
        if (this.leagueService?.selectedLeague && this.leagueService?.selectedLeague?.type !== LeagueType.DYNASTY) {
            players = players.filter(player => player.position !== 'PI');
            this.filterPosGroup[4] = false;
        }
        return players;
    }

    /**
     * Resets player value service metrics when signing into a new league
     * @param isSuperFlex is default superflex
     */
    reset(isSuperFlex: boolean = true): void {
        this.showFreeAgents = false;
        this.showRookies = false;
        this.filterPosGroup = [true, true, true, true, true];
        this.pageIndex = 0;
        this.isSuperFlex = isSuperFlex;
        this.isAdvancedFiltered = false;
    }

    /**
     * update player filters, function is called when option is selected
     * TODO simplifiy the redundant code
     */
    updatePlayerFilters(): void {
        const filterOptions = ['QB', 'RB', 'WR', 'TE', 'PI'];
        if (this.showRookies) {
            this.filterPosGroup[4] = false;
            this.filteredPlayers = this.filteredPlayers.filter(player => {
                if (player.experience === 0 && player.position !== 'PI') {
                    return player;
                }
            });
        }
        if (this.showFreeAgents) {
            this.filterPosGroup[4] = false;
            this.filteredPlayers = this.filteredPlayers.filter(player => {
                if (!player.owner && player.position !== 'PI') {
                    return player;
                }
            });
        }
        for (let i = 0; i < this.filterPosGroup.length; i++) {
            if (!this.filterPosGroup[i]) {
                this.filteredPlayers = this.filteredPlayers.filter(player => {
                    if (player.position !== filterOptions[i]) {
                        return player;
                    }
                });
            }
        }
        if (this.searchVal && this.searchVal.length > 0) {
            this.filteredPlayers = this.filteredPlayers.filter(player => {
                return (player.full_name.toLowerCase().indexOf(this.searchVal.toLowerCase()) >= 0
                    || player.age?.toString().indexOf(this.searchVal) >= 0
                    || ((player.owner?.ownerName.toLowerCase().indexOf(this.searchVal.toLowerCase()) >= 0)
                        && this.leagueService.selectedLeague));
            });
        }
    }

}
