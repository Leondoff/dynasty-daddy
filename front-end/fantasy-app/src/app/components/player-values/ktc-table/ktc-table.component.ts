import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FantasyPlayer } from '../../../model/assets/FantasyPlayer';
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
  styleUrls: ['./ktc-table.component.css']
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

  /** mat paginator */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  /** mat sort */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /** columns to display */
  displayedColumns: string[] = [];

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
    this.refreshTableDetails();
  }

  ngOnChanges(): void {
    this.refreshTableDetails();
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
    this.dataSource = new MatTableDataSource(this.playerService.sortListOfPlayers(this.playerValueService.filteredPlayers, this.isSuperFlex));
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'halfppr':
          return this.playerService.getPlayerPointsByFormat(item.sleeper_id, this.leagueService.getLeagueScoringFormat());
        case 'change':
          return this.isSuperFlex ? item.sf_change : item.standard_change;
        case 'trade_value':
          return this.isSuperFlex ? item.sf_trade_value : item.trade_value;
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
    this.playerComparisonService.addPlayerToCharts(element);
    this.router.navigate(['players/comparison'],
      {
        queryParams: this.leagueSwitchService.buildQueryParams()
      }
    );
  }
}
