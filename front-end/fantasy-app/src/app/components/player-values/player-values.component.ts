import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { BaseComponent } from '../base-component.abstract';
import { ConfigService } from '../../services/init/config.service';
import { ActivatedRoute } from '@angular/router';
import { LeagueSwitchService } from '../services/league-switch.service';
import { LeagueService } from '../../services/league.service';
import { PlayerValueService } from '../services/player-value.service';
import { MatDialog } from '@angular/material/dialog';
import { FilterPlayerValuesModalComponent } from '../modals/filter-player-values-modal/filter-player-values-modal.component';

@Component({
  selector: 'app-player-values',
  templateUrl: './player-values.component.html',
  styleUrls: ['./player-values.component.css']
})
export class PlayerValuesComponent extends BaseComponent implements OnInit {

  /** are players loaded */
  playersLoaded: boolean;

  constructor(public playerService: PlayerService,
    public configService: ConfigService,
    public leagueService: LeagueService,
    private dialog: MatDialog,
    public playerValueService: PlayerValueService,
    public leagueSwitchService: LeagueSwitchService,
    private route: ActivatedRoute) {
    super();
  }

  ngOnInit(): void {
    this.playersLoaded = (this.playerService.playerValues.length > 0);
    if (!this.playersLoaded) {
      this.playerService.loadPlayerValuesForToday();
    }
    if (this.playersLoaded && !this.playerValueService.filteredPlayers) {
      this.playerValueService.filteredPlayers = this.playerService.cleanOldPlayerData().slice();
    }
    this.addSubscriptions(this.playerService.currentPlayerValuesLoaded$.subscribe(() => {
      this.playersLoaded = true;
      this.playerValueService.filteredPlayers = this.playerService.cleanOldPlayerData().slice();
    }),
      this.route.queryParams.subscribe(params => {
        this.leagueSwitchService.loadFromQueryParams(params);
      })
    );
  }

  /**
   * open advanced filtering modal
   */
  openPlayerQuery(): void {
    this.dialog.open(FilterPlayerValuesModalComponent
      , {
        minHeight: '350px',
        minWidth: this.configService.isMobile ? '300px' : '500px',
      }
    );
  }

  /**
   * disables the advanced filtering object and applies filtering settings
   */
  disableAdvancedFilter(): void {
    this.playerValueService.isAdvancedFiltered = false;
    this.playerValueService.applyFilters();
  }

  clearTextSearch(): void{
    this.playerValueService.searchVal = '';
    this.playerValueService.applyFilters();
  }

  onMarketChange($event): void {
    this.playerService.selectedMarket = $event
  }

}
