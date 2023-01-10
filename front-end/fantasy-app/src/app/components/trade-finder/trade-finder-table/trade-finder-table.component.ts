import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {PlayerService} from '../../../services/player.service';
import {MatTableDataSource} from '@angular/material/table';
import {FantasyPlayer} from '../../../model/assets/FantasyPlayer';
import {TradeFinderService} from '../../services/trade-finder.service';
import { MatSort } from '@angular/material/sort';
import { element } from 'protractor';
import { ConfigService } from 'src/app/services/init/config.service';

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

  // mat sort element
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  // columns to display in table
  columnsToDisplay = ['select', 'playerName', 'position', 'value'];

  // datasource for mat table
  dataSource: MatTableDataSource<FantasyPlayer> = new MatTableDataSource<FantasyPlayer>();

  constructor(public playerService: PlayerService,
              public configService: ConfigService,
              private tradeFinderService: TradeFinderService) {
  }

  ngOnInit(): void {
    this.setUpTable();
  }

  ngOnChanges(): void {
    this.setUpTable();
  }

  /**
   * handles any logic for setting up table
   */
  setUpTable(): void {
    this.dataSource.data = this.assets;
    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'playerName') {
        return item.full_name;
      } else if (property === 'value') {
        return this.isSuperflex ? item.sf_trade_value : item.trade_value;
      } else {
        return item[property];
      }
    };
    this.dataSource.sort = this.sort;
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
