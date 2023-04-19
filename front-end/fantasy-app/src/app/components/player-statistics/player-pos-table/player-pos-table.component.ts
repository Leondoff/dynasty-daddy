import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FantasyPlayer } from '../../../model/assets/FantasyPlayer';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LeagueService } from '../../../services/league.service';
import { ConfigService } from '../../../services/init/config.service';
import { PlayerService } from '../../../services/player.service';
import { PlayerComparisonService } from '../../services/player-comparison.service';
import { Router } from '@angular/router';
import { LeagueSwitchService } from "../../services/league-switch.service";

@Component({
  selector: 'app-player-pos-table',
  templateUrl: './player-pos-table.component.html',
  styleUrls: ['./player-pos-table.component.scss']
})
export class PlayerPosTableComponent implements OnInit, OnChanges {

  /** all players */
  @Input()
  players: FantasyPlayer[];

  /** selection position group */
  @Input()
  selectedPosition: string;

  /** mat paginator */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  /** mat sort */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /** columns to display */
  displayedColumns: string[] = [];

  /** is stats per game or season  */
  @Input()
  isPerGame: boolean = false;

  /** general box score cols */
  generalBoxScore = ['full_name', 'points'];

  /** passing box score */
  passingBoxScore = ['pass_att', 'pass_cmp', 'cmp_pct', 'pass_yd', 'pass_td', 'pass_int', 'pass_rz_att'];

  /** rushing box score */
  rushingBoxScore = ['rush_att', 'rush_yd', 'rush_ypa', 'rush_td'];

  /** sack box score */
  sackBoxScore = ['pass_sack'];

  /** turnover box score */
  turnoverBoxScore = ['fum_lost'];

  /** receiving Box score */
  receivingBoxScore = ['rec', 'rec_tgt', 'rec_yd', 'rec_ypr', 'rec_td', 'rec_rz_tgt'];

  /** is superflex or normal value */
  isSuperFlex: boolean;

  /** mat table datasource */
  dataSource: MatTableDataSource<FantasyPlayer> = new MatTableDataSource<FantasyPlayer>();

  constructor(public leagueService: LeagueService,
    public configService: ConfigService,
    public playerService: PlayerService,
    public leagueSwitchService: LeagueSwitchService,
    private playerComparisonService: PlayerComparisonService,
    public router: Router
  ) {
  }

  ngOnInit(): void {
    this.refreshTable();
  }

  ngOnChanges(): void {
    this.refreshTable();
  }

  refreshTable(): void {
    this.dataSource = new MatTableDataSource(this.players);
    const scoringFormat = this.leagueService.getLeagueScoringFormat();
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'points':
          return this.playerService.playerStats[item.sleeper_id]?.[scoringFormat];
        case 'sf_trade_value':
          return item.sf_trade_value;
        case 'trade_value':
          return item.trade_value;
        case 'full_name':
          return item.full_name;
        case 'cmp_pct':
          return this.playerService.playerStats[item.sleeper_id]?.cmp_pct / this.playerService.playerStats[item.sleeper_id]?.gp;
        default:
          if (!this.selectedPosition.includes(item.position.toLowerCase())) return 0;
          return this.isPerGame
            ? Math.round(Number(this.playerService.playerStats[item.sleeper_id]?.[property] / this.playerService.playerStats[item.sleeper_id]?.gp) * 100 || 0) / 100
            : this.playerService.playerStats[item.sleeper_id]?.[property];
      }
    };
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.setDisplayColumns();
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

  /**
   * set display column order based on player position
   * @private
   */
  private setDisplayColumns(): void {
    this.displayedColumns = [];
    switch (this.selectedPosition) {
      case 'qb':
        this.displayedColumns = this.displayedColumns.concat(
          this.generalBoxScore,
          this.passingBoxScore,
          this.sackBoxScore,
          this.turnoverBoxScore,
          ['actions']
        );
        break;
      case 'rb':
        this.displayedColumns = this.displayedColumns.concat(
          this.generalBoxScore,
          this.rushingBoxScore,
          this.receivingBoxScore,
          this.turnoverBoxScore,
          ['actions']
        );
        break;
      case 'wr/te' || 'wr' || 'te':
        this.displayedColumns = this.displayedColumns.concat(
          this.generalBoxScore,
          this.receivingBoxScore,
          this.turnoverBoxScore,
          ['actions']
        );
        break;
      default:
        this.displayedColumns = this.displayedColumns.concat(
          this.generalBoxScore,
          this.receivingBoxScore,
          this.turnoverBoxScore,
          ['actions']
        );
    }
  }

  /**
   * get percent rounded
   * @param percent
   */
  roundPercent(percent: number) {
    return Math.round(percent);
  }
}
