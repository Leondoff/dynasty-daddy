import {Component, Inject, OnInit} from '@angular/core';
import {PlayerService} from '../../../services/player.service';
import {FantasyPlayer} from '../../../model/assets/FantasyPlayer';
import {PlayerComparisonService} from '../../services/player-comparison.service';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {LeagueService} from '../../../services/league.service';
import {QueryBuilderClassNames} from 'angular2-query-builder';
import {ConfigService} from '../../../services/init/config.service';
import { QueryService } from 'src/app/services/utilities/query.service';

@Component({
  selector: 'app-add-player-comparison-modal',
  templateUrl: './add-player-comparison-modal.component.html',
  styleUrls: ['./add-player-comparison-modal.component.css']
})
export class AddPlayerComparisonModalComponent implements OnInit {

  /** player search string */
  playerSearch = '';

  /** filtered search list */
  filteredList: FantasyPlayer[];

  /** query filtered list */
  queryList: FantasyPlayer[] = [];

  /** filter grouping options */
  filterPosGroup: boolean[];

  /** toggle between search and query mode */
  toggleQueryMode: boolean = false;

  /**
   * override styles for query builder
   */
  classNames: QueryBuilderClassNames = {
    row: 'query-row',
    rule: 'query-rule',
    ruleSet: 'query-ruleset',
    invalidRuleSet: 'query-error',
    emptyWarning: 'query-warning',
  };

  /** if true query results overwrite old selected players */
  toggleOverwritePlayers: boolean = true;

  /** has the query been run since last change */
  dirtyQuery: boolean = true;

  /** aggregate options */
  aggOptions = [
    {name: 'Trade Value (SF)', value: 'sf_trade_value', property: 'sf_trade_value'},
    {name: 'Trade Value (STD)', value: 'trade_value', property: 'trade_value'},
    {name: 'Fantasy Points', value: 'fantasy_points_desc', property: 'fantasy_points'},
    {name: 'Experience', value: 'experience_asc', property: 'experience'},
    {name: 'Age', value: 'experience_asc', property: 'experience'},
    {name: 'Position Rank (SF)', value: 'sf_position_rank', property: 'sf_position_rank'},
    {name: 'Position Rank (STD)', value: 'position_rank', property: 'position_rank'},
    {name: 'Average Positional ADP', value: 'avg_adp', property: 'avg_adp'},
    {name: '% change in value (SF)', value: 'sf_change', property: 'sf_change'},
    {name: '% change in value (STD)', value: 'standard_change', property: 'standard_change'},
  ];

  constructor(private playerService: PlayerService,
              public playerComparisonService: PlayerComparisonService,
              private queryService: QueryService,
              private dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: { isGroup2: boolean },
              public leagueService: LeagueService,
              public configService: ConfigService) {
  }

  ngOnInit(): void {
    this.filterPosGroup = [true, true, true, true, true, false];
    this.filteredList = this.playerService.playerValues.slice(0, 11);
  }

  /**
   * add player to comparison
   * @param player selected player to add
   */
  addPlayer(player: FantasyPlayer): void {
    let addable = true;
    if (this.playerComparisonService.isGroupMode && this.data.isGroup2) {
      for (const p of this.playerComparisonService.group2SelectedPlayers) {
        if (p.id === player.name_id) {
          addable = false;
        }
      }
    } else {
      for (const p of this.playerComparisonService.selectedPlayers) {
        if (p.id === player.name_id) {
          addable = false;
        }
      }
    }
    if (addable) {
      this.playerComparisonService.isGroupMode ? this.playerComparisonService.addPlayerToCharts(player, this.data.isGroup2)
        : this.playerComparisonService.addPlayerToCharts(player);
    }
  }

  /**
   * remove player from comparison
   * @param player player to remove
   * @param isGroup2 is group 2 or not
   */
  onRemove(player: FantasyPlayer, isGroup2: boolean = false): void {
    this.playerComparisonService.onRemove({name: player.full_name, data: [], id: player.name_id}, isGroup2);
  }

  /**
   * close dialog
   */
  finishAdding(): void {
    this.dialog.closeAll();
  }

  /**
   * update search filters
   */
  updatePlayerFilters(): void {
    this.filteredList = this.playerService.playerValues.slice(0);
    const filterOptions = ['QB', 'RB', 'WR', 'TE', 'PI'];
    if (this.filterPosGroup[5]) {
      this.filteredList = this.filteredList.filter(player => {
        if (player.experience === 0 && player.position !== 'PI') {
          return player;
        }
      });
    }
    for (let i = 0; i < this.filterPosGroup.length; i++) {
      if (!this.filterPosGroup[i]) {
        this.filteredList = this.filteredList.filter(player => {
          if (player.position !== filterOptions[i]) {
            return player;
          }
        });
      }
    }
    if (!this.playerSearch || this.playerSearch === '') {
      this.filteredList = this.filteredList.slice(0, 11);
    } else {
      this.filteredList = this.filteredList.filter((player) => {
        return player.full_name.toLowerCase().includes(this.playerSearch.toLowerCase())
          || player.position.toLowerCase().includes(this.playerSearch.toLowerCase())
          || player.team.toLowerCase().includes(this.playerSearch.toLowerCase())
          || (player.owner?.ownerName.toLowerCase().includes(this.playerSearch.toLowerCase()) && this.leagueService.selectedLeague);
      }).slice(0, 11);
    }
  }

  /**
   * runs query and updates query list of players that meet criteria
   */
  runQuery(): void {
    this.queryList = this.queryService.processRulesetForPlayer(this.playerService.playerValues.slice(), this.playerComparisonService.query);
    const agg = this.aggOptions.find(aggregate => aggregate.value === this.playerComparisonService.selectedAggregate);
    this.queryList = this.queryList.sort((a, b) => {
      if (agg.property === 'fantasy_points') {
        if (!this.playerComparisonService.isOrderByDesc) {
          return (this.playerService.playerStats[a.sleeper_id]?.pts_half_ppr || 0)
          - (this.playerService.playerStats[b.sleeper_id]?.pts_half_ppr || 0); }
        else { return (this.playerService.playerStats[b.sleeper_id]?.pts_half_ppr || 0)
          - (this.playerService.playerStats[a.sleeper_id]?.pts_half_ppr || 0); }
      }
      if (!this.playerComparisonService.isOrderByDesc) { return a[agg.property] - b[agg.property]; }
        else { return b[agg.property] - a[agg.property]; }
    });
    this.queryList = this.queryList.slice(0, this.playerComparisonService.limit);
    this.dirtyQuery = false;
  }

  /**
   * adds all query results to comp table
   */
  addQueryResults(): void {
    if (this.toggleOverwritePlayers) {
      this.data.isGroup2 ? this.playerComparisonService.group2SelectedPlayers = [] : this.playerComparisonService.selectedPlayers = [];
      this.playerComparisonService.refreshTable();
    }
    for (const player of this.queryList) {
      this.addPlayer(player);
    }
  }
}
