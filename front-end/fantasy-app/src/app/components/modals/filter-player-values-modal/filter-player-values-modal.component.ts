import { Component, Inject, OnInit } from '@angular/core';
import { PlayerService } from '../../../services/player.service';
import { FantasyPlayer } from '../../../model/assets/FantasyPlayer';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { LeagueService } from '../../../services/league.service';
import { ConfigService } from '../../../services/init/config.service';
import { PlayerValueService } from '../../services/player-value.service';

@Component({
  selector: 'app-filter-player-values-modal',
  templateUrl: './filter-player-values-modal.component.html',
  styleUrls: ['./filter-player-values-modal.component.css']
})
export class FilterPlayerValuesModalComponent implements OnInit {

  /** player search string */
  playerSearch = '';

  /** filtered search list */
  filteredList: FantasyPlayer[];

  /** query filtered list */
  queryList: FantasyPlayer[] = [];

  /** filter grouping options */
  filterPosGroup: boolean[];

  /** toggle between search and query mode */
  toggleQueryMode: boolean = false;

  constructor(private playerService: PlayerService,
    public playerValueService: PlayerValueService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { isGroup2: boolean },
    public leagueService: LeagueService,
    public configService: ConfigService) {
  }

  ngOnInit(): void {
    this.filterPosGroup = [true, true, true, true, true, false];
    this.filteredList = this.playerService.playerValues.slice(0, 11);
  }

  /**
   * close dialog
   */
  close(): void {
    this.dialog.closeAll();
  }

  /**
   * adds all query results to comp table
   */
  applyFilter(): void {
    this.playerValueService.isAdvancedFiltered = true;
    this.playerValueService.applyFilters();
    this.close();
  }

}
