import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FantasyMarket, FantasyPlayer } from '../../../model/assets/FantasyPlayer';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LeagueService } from '../../../services/league.service';
import { PlayerService } from '../../../services/player.service';
import { PlayerComparisonService } from '../../services/player-comparison.service';
import { Router } from '@angular/router';
import { ConfigService } from '../../../services/init/config.service';
import { LeagueSwitchService } from '../../services/league-switch.service';
import { BaseComponent } from '../../base-component.abstract';
import { LeagueDTO } from "../../../model/league/LeagueDTO";
import { PlayerValueService } from '../../services/player-value.service';

@Component({
  selector: 'app-ktc-table',
  templateUrl: './ktc-table.component.html',
  styleUrls: ['./ktc-table.component.scss']
})
export class KtcTableComponent extends BaseComponent implements OnInit, OnChanges {

  /** all players */
  @Input()
  players: FantasyPlayer[];

  /** selected league */
  @Input()
  selectedLeague: LeagueDTO;

  /** is superflex or normal value */
  @Input()
  isSuperFlex: boolean;

  @Input()
  fantasyMarket: FantasyMarket;

  /** mat paginator */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  /** mat sort */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /** columns to display */
  displayedColumns: string[] = [];

  /** playerValues Table caches certain values for players */
  playerInfoCache: {}

  /** mat table datasource */
  dataSource: MatTableDataSource<FantasyPlayer> = new MatTableDataSource<FantasyPlayer>();

  constructor(public leagueService: LeagueService,
    public playerService: PlayerService,
    public playerValueService: PlayerValueService,
    private playerComparisonService: PlayerComparisonService,
    public leagueSwitchService: LeagueSwitchService,
    private router: Router,
    public configService: ConfigService) {
    super();
  }

  ngOnInit(): void {
    // this.refreshTableDetails();
  }

  ngOnChanges(): void {
    this.refreshTableDetails();
    this.generatePlayerTableCache();
  }

  /**
   * refreshes the table
   */
  refreshTableDetails(): void {
    if (this.leagueService.selectedLeague != null) {
      this.displayedColumns = this.configService.isMobile ? ['full_name', 'position', 'owner', 'trade_value'] : ['full_name', 'position', 'age', 'injury', 'owner', 'halfppr', 'avg_adp', 'trade_value', 'change', 'actions'];
    } else {
      this.displayedColumns = this.configService.isMobile ? ['full_name', 'position', 'trade_value'] : ['full_name', 'position', 'age', 'injury', 'halfppr', 'avg_adp', 'trade_value', 'change', 'actions'];
    }
    this.dataSource = new MatTableDataSource(this.playerService.sortListOfPlayers(this.playerValueService.filteredPlayers, this.isSuperFlex, this.fantasyMarket));
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'halfppr':
          return this.playerInfoCache[item.name_id].points;
        case 'change':
          return this.playerInfoCache[item.name_id].change;
        case 'trade_value':
          return this.playerInfoCache[item.name_id].value;
        case 'avg_adp':
          if (item.avg_adp === 0) {
            return 'desc' === this.sort.direction ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
          }
          return item.avg_adp;
        default:
          return item[property];
      }
    };
    this.dataSource.paginator = this.paginator;
    this.dataSource.paginator.pageIndex = this.playerValueService.pageIndex;
    this.dataSource.sort = this.sort;
  }

  /**
   * route ot player comparison page
   * @param element player to add to comparison
   */
  openPlayerComparison(element: FantasyPlayer): void {
    this.playerComparisonService.addPlayerToCharts(element, false, this.fantasyMarket);
    this.router.navigate(['players/comparison'],
      {
        queryParams: this.leagueSwitchService.buildQueryParams()
      }
    );
  }

  generatePlayerTableCache(): void {
    this.playerInfoCache = {}
    this.playerService.playerValues.forEach(player => {
      this.playerInfoCache[player.name_id] = {
        isHigh: this.isMonthHighOrLow(player, true),
        isLow: this.isMonthHighOrLow(player, false),
        change: this.playerService.getTradeValue(player, this.isSuperFlex, this.playerService.selectedMarket, 'change'),
        value: this.playerService.getTradeValue(player, this.isSuperFlex, this.fantasyMarket),
        points: this.playerService.getPlayerPointsByFormat(player.sleeper_id, this.leagueService.getLeagueScoringFormat()),
        rank: this.playerService.getTradeValue(player, this.isSuperFlex, this.fantasyMarket, 'rank')
      }
    });
  }

  /**
   * wrapper function that will determine if the player is at 3 month high/low or not
   * @param player player to check
   * @param isHigh boolean return
   * @returns 
   */
  isMonthHighOrLow(player: FantasyPlayer, isHigh: boolean): boolean {
    const curValue = this.playerService.getTradeValue(player, this.isSuperFlex);
    if (isHigh) {
      const threeMonthHigh = this.playerService.getTradeValue(player, this.isSuperFlex, this.playerService.selectedMarket, 'three_month_high');
      return curValue === threeMonthHigh;
    } else {
      const threeMonthLow = this.playerService.getTradeValue(player, this.isSuperFlex, this.playerService.selectedMarket, 'three_month_low');
      return curValue === threeMonthLow;
    }
  }
}
