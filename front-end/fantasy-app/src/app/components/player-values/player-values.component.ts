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
import { DownloadService } from 'src/app/services/utilities/download.service';
import { FantasyMarket } from 'src/app/model/assets/FantasyPlayer';

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
    private downloadService: DownloadService,
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
    this.leagueSwitchService.leagueChanged$.subscribe(league => {
      this.playerValueService.applyFilters();
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

  clearTextSearch(): void {
    this.playerValueService.searchVal = '';
    this.playerValueService.applyFilters();
  }

  onMarketChange($event): void {
    this.playerService.selectedMarket = $event
  }

  /**
   * exports player table to csv
   */
  exportPlayerValuesTable(): void {
    let playerValues = {};
    this.addSubscriptions(this.playerService.fetchTradeValuesForAllMarket().subscribe(values => {
      for (let market in FantasyMarket) {
        playerValues[market] = values[market];
      }
      const playerData: any[][] = []
      playerData.push([`Player Values for ${new Date().toISOString().slice(0, 10)} - ${this.playerValueService?.isSuperFlex ? 'Superflex' : 'Standard (1 QB)'}`]);
      const filterRow = ['Filters'];
      let postionGroupString = '';
      if (this.playerValueService.filterPosGroup[0]) postionGroupString += 'QB '
      if (this.playerValueService.filterPosGroup[1]) postionGroupString += 'RB '
      if (this.playerValueService.filterPosGroup[2]) postionGroupString += 'WR '
      if (this.playerValueService.filterPosGroup[3]) postionGroupString += 'TE '
      if (this.playerValueService.filterPosGroup[4]) postionGroupString += 'Picks'
      filterRow.push(postionGroupString);
      if (this.playerValueService.showFreeAgents) {filterRow.push('Free Agents Only')};
      if (this.playerValueService.showRookies) {filterRow.push('Rookies Only')};
      if (this.playerValueService.isAdvancedFiltered) {filterRow.push(JSON.stringify(this.playerValueService.query))}
      playerData.push(filterRow);
      playerData.push([]);
      playerData.push([
        ['Name', 'Position', 'Age', 'Owner', 'Avg Pos ADP', 'KeepTradeCut', 'KeepTradeCut % Change', 'FantasyCalc', 'FantasyCalc % Change', 'DynastyProcess', 'DynastyProcess % Change'],
      ]);
      this.playerValueService.filteredPlayers.forEach((player, ind) => {
        const playerRow = [player?.full_name, player?.position, player?.age, player?.owner?.ownerName,
        player?.avg_adp > 0 ? player?.avg_adp : '',
        this.playerValueService?.isSuperFlex ?
          playerValues[0][player?.name_id]?.sf_trade_value || 0 :
          playerValues[0][player?.name_id]?.trade_value || 0,
        this.playerValueService?.isSuperFlex ?
          playerValues[0][player?.name_id]?.sf_change || 0 :
          playerValues[0][player?.name_id]?.standard_change || 0,
        this.playerValueService?.isSuperFlex ?
          playerValues[1][player?.name_id]?.sf_trade_value || 0 :
          playerValues[1][player?.name_id]?.trade_value || 0,
        this.playerValueService?.isSuperFlex ?
          playerValues[1][player?.name_id]?.sf_change || 0 :
          playerValues[1][player?.name_id]?.standard_change || 0,
        this.playerValueService?.isSuperFlex ?
          playerValues[2][player?.name_id]?.sf_trade_value || 0 :
          playerValues[2][player?.name_id]?.trade_value || 0,
        this.playerValueService?.isSuperFlex ?
          playerValues[2][player?.name_id]?.sf_change || 0 :
          playerValues[2][player?.name_id]?.standard_change || 0
        ];
        playerData.push(playerRow);
      });

      const formattedDraftData = playerData.map(e => e.join(',')).join('\n');

      const filename = `Dynasty_Daddy_Player_List_${new Date().toISOString().slice(0, 10)}.csv`;

      this.downloadService.downloadCSVFile(formattedDraftData, filename);
    }));
  }

}
