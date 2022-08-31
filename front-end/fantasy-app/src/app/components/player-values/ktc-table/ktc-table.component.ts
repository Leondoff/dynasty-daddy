import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {KTCPlayer} from '../../../model/KTCPlayer';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {SleeperService} from '../../../services/sleeper.service';
import {PlayerService} from '../../../services/player.service';
import {PlayerComparisonService} from '../../services/player-comparison.service';
import {Router} from '@angular/router';
import {ConfigService} from '../../../services/init/config.service';
import {LeagueSwitchService} from '../../services/league-switch.service';
import {BaseComponent} from '../../base-component.abstract';
import {SleeperLeagueData} from '../../../model/SleeperUser';

@Component({
  selector: 'app-ktc-table',
  templateUrl: './ktc-table.component.html',
  styleUrls: ['./ktc-table.component.css']
})
export class KtcTableComponent extends BaseComponent implements OnInit, OnChanges {

  /** all players */
  @Input()
  players: KTCPlayer[];

  /** sleeper selected league */
  @Input()
  selectedLeague: SleeperLeagueData;

  /** mat paginator */
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  /** mat sort */
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  /** filtered list of players for searching */
  filteredPlayers: KTCPlayer[];

  /** position group filters, [qb, rb, wr, te, picks] */
  filterPosGroup: boolean[] = [true, true, true, true, true];

  /** columns to display */
  displayedColumns: string[] = [];

  /** is superflex or normal value */
  isSuperFlex: boolean;

  /** mat table datasource */
  dataSource: MatTableDataSource<KTCPlayer> = new MatTableDataSource<KTCPlayer>();

  /** show rookies in table */
  showRookies: boolean = false;

  /** show free agents, only show if league is loaded */
  showFreeAgents: boolean = false;

  /** search value from search box */
  searchVal: string;

  constructor(public sleeperService: SleeperService,
              public playerService: PlayerService,
              private playerComparisonService: PlayerComparisonService,
              public leagueSwitchService: LeagueSwitchService,
              private router: Router,
              public configService: ConfigService) {
    super();
  }

  ngOnInit(): void {
    this.refreshTableDetails();
    // determine sort on init vs on changes to prevent double sorting
    this.dataSource.sort.sort({
      id: this.isSuperFlex ? 'sf_trade_value' : 'trade_value',
      start: 'desc',
      disableClear: false
    });
  }

  ngOnChanges(): void {
    this.refreshTableDetails();
  }

  /**
   * refreshes the table
   */
  refreshTableDetails(): void {
    this.isSuperFlex = this.selectedLeague?.isSuperflex !== undefined ?
      this.selectedLeague?.isSuperflex : true;
    // create prototype of list and remove players with no value (no data points in over a year)
    this.filteredPlayers = this.playerService.cleanOldPlayerData(this.players);
    this.dataSource = new MatTableDataSource(this.filteredPlayers);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'halfppr':
          return this.playerService.playerStats[item.sleeper_id]?.pts_half_ppr;
        case 'change':
          return this.isSuperFlex ? item.sf_change : item.standard_change;
        case 'sf_trade_value':
          return item.sf_trade_value;
        case 'trade_value':
          return item.trade_value;
        case 'avg_adp':
          if (item.avg_adp == null) {
            return 'desc' === this.sort.direction ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
          }
          return Number(item.avg_adp);
        default:
          return item[property];
      }
    };
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.updateSuperFlex();
  }

  /**
   * update player filters, function is called when option is selected
   */
  updatePlayerFilters(): void {
    this.filteredPlayers = this.playerService.cleanOldPlayerData(this.players);
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
            && this.selectedLeague));
      });
    }
    this.paginator.pageIndex = 0;
    this.dataSource.data = this.filteredPlayers;
  }

  /**
   * toggle between superflex or regular trade values
   */
  updateSuperFlex(): void {
    this.displayedColumns = [];
    if (this.selectedLeague) {
      this.displayedColumns = this.configService.isMobile ? ['full_name', 'position', 'owner', this.isSuperFlex ? 'sf_trade_value' : 'trade_value'] : ['full_name', 'position', 'age', 'injury', 'owner', 'halfppr', 'avg_adp', this.isSuperFlex ? 'sf_trade_value' : 'trade_value', 'change', 'actions'];
    } else {
      this.displayedColumns = this.configService.isMobile ? ['full_name', 'position', 'halfppr', this.isSuperFlex ? 'sf_trade_value' : 'trade_value'] : ['full_name', 'position', 'age', 'injury', 'halfppr', 'avg_adp', this.isSuperFlex ? 'sf_trade_value' : 'trade_value', 'change', 'actions'];
    }
    this.dataSource.data = this.filteredPlayers;
  }

  /**
   * route ot player comparison page
   * @param element player to add to comparison
   */
  openPlayerComparison(element: KTCPlayer): void {
    this.playerComparisonService.addPlayerToCharts(element);
    this.router.navigate(['players/comparison'],
      {
        queryParams: this.leagueSwitchService.buildQueryParams()
      }
    );
  }
}
