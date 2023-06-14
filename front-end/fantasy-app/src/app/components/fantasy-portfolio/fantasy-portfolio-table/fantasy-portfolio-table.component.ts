import { Component, OnInit, Input, OnChanges, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { ConfigService } from 'src/app/services/init/config.service';
import { LeagueService } from 'src/app/services/league.service';
import { PortfolioService } from '../../services/portfolio.service';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { LeagueSwitchService } from '../../services/league-switch.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogModal } from '../../modals/confirmation-dialog/confirmation-dialog.component';
import { MflService } from 'src/app/services/api/mfl/mfl.service';

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

  /** list of players in portfolio */
  portfolio: FantasyPlayer[] = [];

  /** mat sort */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public leagueService: LeagueService,
    public configService: ConfigService,
    private leagueSwitchService: LeagueSwitchService,
    private route: Router,
    private dialog: MatDialog,
    private mflService: MflService,
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

  openLeague(leagueId: string): void {
    this.leagueSwitchService.loadLeagueWithLeagueId(
      leagueId,
      this.portfolioService.leagueIdMap[leagueId].year,
      this.portfolioService.leagueIdMap[leagueId].platform
    )
    this.route.navigate(['/league/rankings']);
  }

  /**
   * Drop player in MFL league
   * @param leagueId MFL league id
   * @param playerId MFL player id
   */
  dropPlayer(leagueId: string, playerId: string): void {
    const player = this.playersWithValue.find(p => p.name_id == playerId);
    const dialogRef = this.dialog.open(ConfirmationDialogModal, {
      disableClose: true,
      autoFocus: true,
      data: {
        title: `Are you sure you want to drop ${player.full_name} in ${this.portfolioService.leagueIdMap[leagueId]?.name}?`
      }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mflService.postWaiverTransaction$(
          leagueId,
          '2023',
          null,
          player.mfl_id,
          this.portfolioService.portfolioMFLUserId
        ).subscribe(_ => {
          this.portfolioService.playerHoldingMap[playerId]?.cutLeagues.push(leagueId);
        })
      }
    })
  }

  isPlayerCut = (nameId: string, leagueId: string) => {
    return this.portfolioService.playerHoldingMap[nameId]?.cutLeagues.includes(leagueId)
  }
}
