import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { ConfigService } from 'src/app/services/init/config.service';
import { LeagueService } from 'src/app/services/league.service';
import { PortfolioService } from '../../services/portfolio.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-fantasy-portfolio-table',
  templateUrl: './fantasy-portfolio-table.component.html',
  styleUrls: ['./fantasy-portfolio-table.component.scss']
})
export class FantasyPortfolioTableComponent implements OnInit, OnChanges {

  @Input()
  playersWithValue: FantasyPlayer[] = [];

  // datasource for mat table
  dataSource: MatTableDataSource<FantasyPlayer> = new MatTableDataSource<FantasyPlayer>();

  /** month trend value for table (sf, std) */
  monthTrendSetting: string = 'SF';

  /** price setting values for table (sf/std, sf, std) */
  priceSetting: string = 'SF';

  // columns to display in table
  columnsToDisplay = ['expand', 'player', 'pos', 'team', 'shares', 'exposure', 'price', 'totalValue', 'posGroup', 'monthGain'];

  expandedElement: string[] = [];

  portfolio: FantasyPlayer[] = [];

  /** mat sort */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public leagueService: LeagueService,
    public configService: ConfigService,
    public portfolioService: PortfolioService
  ) { }

  ngOnInit(): void {
    this.portfolio = this.playersWithValue;
    this.portfolio.sort((a, b) =>
      this.portfolioService.playerHoldingMap[b.name_id]?.shares - this.portfolioService.playerHoldingMap[a.name_id]?.shares ||
      this.portfolioService.playerHoldingMap[b.name_id]?.totalValue - this.portfolioService.playerHoldingMap[a.name_id]?.totalValue)
    this.updateTableValues();
  }

  ngOnChanges(): void {
    this.portfolio = this.playersWithValue;
    this.portfolio.sort((a, b) =>
      this.portfolioService.playerHoldingMap[b.name_id]?.shares - this.portfolioService.playerHoldingMap[a.name_id]?.shares ||
      this.portfolioService.playerHoldingMap[b.name_id]?.totalValue - this.portfolioService.playerHoldingMap[a.name_id]?.totalValue);
    this.updateTableValues();
  }

  ngAfterViewInit(): void {
    this.setSortForTable();
  }

  /**
   * Wraps logic for updating and sorting table values
   */
  updateTableValues(): void {
    this.dataSource = new MatTableDataSource(this.portfolio);
    this.dataSource.sort = this.sort;
    this.setSortForTable();
  }

  /**
   * Wrapper for setting sort in the table
   */
  private setSortForTable(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'posGroup': {
          return this.portfolioService.positionGroupValueMap[item.position] != 0 ?
            ((this.portfolioService.playerHoldingMap[item.name_id]?.totalValue || 0) /
              this.portfolioService.positionGroupValueMap[item.position]) : 0
        }
        default: return this.portfolioService.playerHoldingMap[item.name_id]?.[property] || 0;
      }
    };
    this.dataSource.sort = this.sort;
  }

  /**
   * checks if list is expanded or not
   * @param element team power ranking
   * returns true of expanded
   */
  checkExpanded(element: FantasyPlayer): boolean {
    let flag = false;
    this.expandedElement.forEach(e => {
      if (e === element.name_id) {
        flag = true;
      }
    });
    return flag;
  }

  /**
   * handles when row is clicked
   * @param element team row that was clicked
   */
  pushPopElement(element: FantasyPlayer): void {
    const index = this.expandedElement.indexOf(element.name_id);
    if (index === -1) {
      this.expandedElement.push(element.name_id);
    } else {
      this.expandedElement.splice(index, 1);
    }
  }

  /**
   * toggle trend setting for column
   */
  toggleTrendSetting(): void {
    switch (this.monthTrendSetting) {
      case 'STD': {
        this.monthTrendSetting = 'SF';
        break;
      }
      default: {
        this.monthTrendSetting = 'STD';
        break;
      }
    }
  }

  /**
 * toggle trend setting for column
 */
  togglePriceSetting(): void {
    switch (this.priceSetting) {
      case 'SF/STD': {
        this.priceSetting = 'SF';
        break;
      }
      case 'SF': {
        this.priceSetting = 'STD';
        break;
      }
      default: {
        this.priceSetting = 'SF/STD';
        break;
      }
    }
  }

  /**
   * Returns a string for the selected player format
   * @param player to get formatted values for
   * @returns 
   */
  getPriceDisplay(player: FantasyPlayer): string {
    switch (this.priceSetting) {
      case 'SF/STD': {
        return `${player.sf_trade_value} / ${player.trade_value}`
      }
      case 'SF': {
        return `${player.sf_trade_value}`;
      }
      default: {
        return `${player.trade_value}`;
      }
    }
  }
}
