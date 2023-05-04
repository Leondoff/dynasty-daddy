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

  constructor(
    public playerValueService: PlayerValueService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { isGroup2: boolean },
    public leagueService: LeagueService,
    public configService: ConfigService) {
  }

  ngOnInit(): void {
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
    this.playerValueService.pageIndex = 0;
    this.playerValueService.applyFilters();
    this.close();
  }

}
