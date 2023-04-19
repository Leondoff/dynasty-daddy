import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { BaseComponent } from '../base-component.abstract';
import { FantasyPlayer } from '../../model/assets/FantasyPlayer';
import { ConfigService } from '../../services/init/config.service';
import { LeagueService } from '../../services/league.service';
import { MatOptionSelectionChange } from '@angular/material/core';
import { LeagueSwitchService } from '../services/league-switch.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-player-statistics',
  templateUrl: './player-statistics.component.html',
  styleUrls: ['./player-statistics.component.css']
})
export class PlayerStatisticsComponent extends BaseComponent implements OnInit {

  /** is season or per game table stats */
  isPerGame: boolean = false;

  /** are players loaded */
  playersLoaded: boolean = false;

  /** show advanced table settings */
  showAdvancedSettings: boolean = false;

  /** filtered list of players for searching */
  filteredPlayers: FantasyPlayer[];

  /** if true change color of your team points */
  highlightYourTeam: boolean = true;

  /** if true change color of free agent points */
  highlightFreeAgents: boolean = false;

  /** position group filters, [qb, rb, wr/te] */
  posGroup: { value: string, displayName: string }[] = [{ value: 'qb', displayName: 'Quarterbacks' },
  { value: 'rb', displayName: 'Running Backs' }, { value: 'wr/te', displayName: 'Wide Receivers & Tight Ends' },
  { value: 'wr', displayName: 'Wide Receivers' }, { value: 'te', displayName: 'Tight Ends' }];

  /** selected position from dropdown */
  selectedPosition: string;

  /** search value from search box */
  searchVal: string;

  /** combo input property for chart */
  selectedMetrics: { value: string, displayName: string }[] = [!this.leagueService.selectedLeague?.isSuperflex ?
    { value: 'trade_value', displayName: 'Trade Value (SuperFlex)' }
    : { value: 'sf_trade_value', displayName: 'Trade Value (SuperFlex)' }, { value: 'pts_half_ppr', displayName: 'Fantasy Points (Half PPR)' }];

  /** binding to x select */
  selectedXMetric: { value: string, displayName: string };

  /** binding to y select */
  selectedYMetric: { value: string, displayName: string };

  /** selectable metrics */
  selectableMetrics: { value: string, displayName: string }[] = [];

  /** general metrics */
  generalMetrics: { value: string, displayName: string }[] = [
    { value: 'pts_half_ppr', displayName: 'Fantasy Points (Half PPR)' },
    { value: 'pts_half_ppr_per_game', displayName: 'Fantasy Points (Half PPR) Per Game' },
    { value: 'pts_ppr', displayName: 'Fantasy Points (PPR)' },
    { value: 'pts_ppr_per_game', displayName: 'Fantasy Points (PPR) Per Game' },
    { value: 'pts_std', displayName: 'Fantasy Points (Standard)' },
    { value: 'pts_std_per_game', displayName: 'Fantasy Points (Standard) Per Game' },
    { value: 'sf_trade_value', displayName: 'Trade Value (SuperFlex)' },
    { value: 'trade_value', displayName: 'Trade Value (Standard)' },
    { value: 'gp', displayName: 'Games Played' },
    { value: 'avg_adp', displayName: 'Average ADP' }
  ];

  /** passing metrics */
  passingMetrics: { value: string, displayName: string }[] = [
    { value: 'pass_att', displayName: 'Passing Attempts' },
    { value: 'pass_att_per_game', displayName: 'Passing Attempts Per Game' },
    { value: 'pass_cmp', displayName: 'Passing Completions' },
    { value: 'pass_cmp_per_game', displayName: 'Passing Completions Per Game' },
    { value: 'cmp_pct', displayName: 'Passing Percent' },
    { value: 'pass_yd', displayName: 'Passing Yards' },
    { value: 'pass_yd_per_game', displayName: 'Passing Yards Per Game' },
    { value: 'pass_td', displayName: 'Passing Touchdowns' },
    { value: 'pass_td_per_game', displayName: 'Passing Touchdowns Per Game' },
    { value: 'pass_int', displayName: 'Passing Interceptions' },
    { value: 'pass_int_per_game', displayName: 'Passing Interceptions Per Game' },
    { value: 'pass_rz_att', displayName: 'Passing Redzone Attempts' },
    { value: 'pass_rz_att_per_game', displayName: 'Passing Redzone Attempts Per Game' }
  ];

  /** selectable rushing metrics */
  rushingMetrics: { value: string, displayName: string }[] = [
    { value: 'rush_att', displayName: 'Rushing Attempts' },
    { value: 'rush_att_per_game', displayName: 'Rushing Attempts Per Game' },
    { value: 'rush_yd', displayName: 'Rushing Yards' },
    { value: 'rush_yd_per_game', displayName: 'Rushing Yards Per Game' },
    { value: 'rush_ypa', displayName: 'Rushing Yards Per Attempt' },
    { value: 'rush_td', displayName: 'Rushing Touchdowns' },
    { value: 'rush_yd_per_game', displayName: 'Rushing Touchdowns Per Game' },
  ];

  /** receiving Metrics */
  receivingMetrics: { value: string, displayName: string }[] = [
    { value: 'rec', displayName: 'Receptions' },
    { value: 'rec_per_game', displayName: 'Receptions Per Game' },
    { value: 'rec_tgt', displayName: 'Targets' },
    { value: 'rec_tgt_per_game', displayName: 'Targets Per Game' },
    { value: 'rec_yd', displayName: 'Receiving Yards' },
    { value: 'rec_yd_per_game', displayName: 'Receiving Yards Per Game' },
    { value: 'rec_ypr', displayName: 'Receiving Yards Per Rec' },
    { value: 'rec_td', displayName: 'Receiving Touchdowns' },
    { value: 'rec_td_per_game', displayName: 'Receiving Touchdowns Per Game' },
    { value: 'rec_rz_tgt', displayName: 'Receiving Red Zone Targets' },
    { value: 'rec_rz_tgt_per_game', displayName: 'Receiving Red Zone Targets Per Game' },
  ];

  /** sack metrics */
  sackMetrics: { value: string, displayName: string }[] = [
    { value: 'pass_sack', displayName: 'Times Sacked' },
    { value: 'pass_sack_per_game', displayName: 'Times Sacked Per Game' },
  ];

  /** turnover Metrics */
  turnoverMetrics: { value: string, displayName: string }[] = [
    { value: 'fum_lost', displayName: 'Fumbles' },
    { value: 'fum_lost_per_game', displayName: 'Fumbles Per Game' }
  ];

  /** general metrics */
  expertADP: { value: string, displayName: string }[] = [
    { value: 'bb10_adp', displayName: 'BestBall10s ADP' },
    { value: 'fantasypro_adp', displayName: 'Fantasy Pros ADP' },
    { value: 'drafters_adp', displayName: 'Drafters ADP' },
    { value: 'underdog_adp', displayName: 'Underdog ADP' },
    { value: 'rtsports', displayName: 'Real Time Sports ADP' }
  ];

  constructor(public playerService: PlayerService,
    public configService: ConfigService,
    public leagueSwitchService: LeagueSwitchService,
    private route: ActivatedRoute,
    public leagueService: LeagueService) {
    super();
  }

  ngOnInit(): void {
    this.playersLoaded = (this.playerService.playerValues.length > 0);
    this.selectedPosition = 'qb';
    this.selectedXMetric = this.selectedMetrics[0];
    this.selectedYMetric = this.selectedMetrics[1];
    this.highlightYourTeam = !!this.leagueService.leagueUser;
    this.selectableMetrics = this.getSelectableMetrics(this.selectedPosition);
    if (this.playerService) {
      this.updatePlayerFilters();
    }
    if (!this.playersLoaded) { this.playerService.loadPlayerValuesForToday(); };
    this.addSubscriptions(this.playerService.currentPlayerValuesLoaded$.subscribe(() => {
      this.playersLoaded = true;
      this.updatePlayerFilters();
    }),
      this.leagueSwitchService.leagueChanged$.subscribe(() => {
        this.updatePlayerFilters();
      }),
      this.route.queryParams.subscribe(params => {
        this.leagueSwitchService.loadFromQueryParams(params);
      })
    );
  }

  /**
   * update player filters, function is called when option is selected
   */
  updatePlayerFilters(): void {
    this.filteredPlayers = this.playerService.playerValues.slice(0);
    this.filteredPlayers = this.filteredPlayers.filter(player => {
      return this.selectedPosition.includes(player.position.toLowerCase());
    });
    if (this.searchVal && this.searchVal.length > 0) {
      this.filteredPlayers = this.filteredPlayers.filter(player => {
        return (player.full_name.toLowerCase().indexOf(this.searchVal.toLowerCase()) >= 0
          || player.age?.toString().indexOf(this.searchVal) >= 0
          || ((player.owner?.ownerName.toLowerCase().indexOf(this.searchVal.toLowerCase()) >= 0)
            && this.leagueService.selectedLeague));
      });
    }
  }

  /**
   * handles when position categories are changed
   * @param event from select
   */
  updatePositionTable(event: any): void {
    this.selectedMetrics = [this.leagueService.selectedLeague?.isSuperflex === false ? { value: 'trade_value', displayName: 'Trade Value (Standard)' }
      : { value: 'sf_trade_value', displayName: 'Trade Value (SuperFlex)' }, { value: 'pts_half_ppr', displayName: 'Fantasy Points (Half PPR)' }];
    this.selectedXMetric = this.selectedMetrics[0];
    this.selectedYMetric = this.selectedMetrics[1];
    this.selectedPosition = event.value;
    this.selectableMetrics = this.getSelectableMetrics(this.selectedPosition);
    this.updatePlayerFilters();
  }

  /**
   * returns new list of available metrics for pos group
   * TODO refactor and create utility that return metrics
   * @param pos string
   * @private
   */
  private getSelectableMetrics(pos: string): { value: string, displayName: string }[] {
    const newMetrics = [];
    switch (pos) {
      case 'qb':
        return newMetrics.concat(
          this.generalMetrics,
          this.passingMetrics,
          this.rushingMetrics,
          this.sackMetrics,
          this.turnoverMetrics,
          this.expertADP
        );
      case 'rb':
        return newMetrics.concat(
          this.generalMetrics,
          this.rushingMetrics,
          this.turnoverMetrics,
          this.receivingMetrics,
          this.expertADP
        );            // wr/te
      default:
        return newMetrics.concat(
          this.generalMetrics,
          this.receivingMetrics,
          this.turnoverMetrics,
          this.expertADP
        );
    }
  }

  /**
   * handles updates to x and y chart
   * @param position 0 = x axis, 1 = y axis
   * @param metric new object
   * @param event select event to filter out no user input
   */
  updateSelectedMetrics(position: number, metric: { value: string; displayName: string }, event: MatOptionSelectionChange): void {
    if (event.isUserInput) {
      if (position === 0) {
        this.selectedXMetric = metric;
        this.selectedMetrics = [metric, this.selectedYMetric];
      } else {
        this.selectedYMetric = metric;
        this.selectedMetrics = [this.selectedXMetric, metric];
      }
    }
  }
}
