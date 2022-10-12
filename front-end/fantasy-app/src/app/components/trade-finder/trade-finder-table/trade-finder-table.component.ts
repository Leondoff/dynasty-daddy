import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {PlayerService} from '../../../services/player.service';
import {MatTableDataSource} from '@angular/material/table';
import {FantasyPlayer} from '../../../model/FantasyPlayer';
import {TradeFinderService} from '../../services/trade-finder.service';

@Component({
  selector: 'app-trade-finder-table',
  templateUrl: './trade-finder-table.component.html',
  styleUrls: ['./trade-finder-table.component.css']
})
export class TradeFinderTableComponent implements OnInit, OnChanges {

  @Input()
  assets: FantasyPlayer[];

  @Input()
  isSuperflex: boolean;

  // columns to display in table
  columnsToDisplay = ['select', 'playerName', 'value'];

  // datasource for mat table
  dataSource: MatTableDataSource<FantasyPlayer> = new MatTableDataSource<FantasyPlayer>();

  constructor(public playerService: PlayerService,
              private tradeFinderService: TradeFinderService) {
  }

  ngOnInit(): void {
    this.dataSource.data = this.assets;
  }

  ngOnChanges(): void {
    this.dataSource.data = this.assets;
  }

  /**
   * handle check box action
   * @param event checkbox event
   * @param asset player to add/remove
   * @param index index of player
   */
  addAssetToTrade(event: any, asset: FantasyPlayer, index: number): void {
    if (event.checked) {
      this.tradeFinderService.selectedPlayers.push(asset);
    } else {
      const removeIndex = this.tradeFinderService.selectedPlayers.map(item => item.name_id).indexOf(asset.name_id);
      if (removeIndex >= 0) {
        this.tradeFinderService.selectedPlayers.splice(removeIndex, 1);
      }
    }
  }
}
