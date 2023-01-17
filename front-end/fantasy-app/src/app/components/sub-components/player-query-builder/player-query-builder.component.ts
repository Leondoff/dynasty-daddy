import { Component, OnInit, Input } from '@angular/core';
import { QueryBuilderClassNames, QueryBuilderConfig } from 'angular2-query-builder';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { LeagueOwnerDTO } from 'src/app/model/league/LeagueOwnerDTO';
import { LeagueService } from 'src/app/services/league.service';

@Component({
  selector: 'app-player-query-builder',
  templateUrl: './player-query-builder.component.html',
  styleUrls: ['./player-query-builder.component.css']
})
export class PlayerQueryBuilderComponent implements OnInit {

  @Input()
  query = {};

  /**
   * query builder config fields
   */
  config: QueryBuilderConfig = {
    fields: {
      full_name: { name: 'Full Name', type: 'string' },
      first_name: { name: 'First Name', type: 'string' },
      last_name: { name: 'Last Name', type: 'string' },
      position: {
        name: 'Position',
        type: 'category',
        options: [
          { name: 'Quarterback', value: 'QB' },
          { name: 'Running back', value: 'RB' },
          { name: 'Wide Receiver', value: 'WR' },
          { name: 'Tight End', value: 'TE' },
          { name: 'Draft Picks', value: 'PI' },
        ]
      },
      age: { name: 'Age', type: 'number' },
      experience: { name: 'Experience', type: 'number' },
      team: {
        name: 'NFL Team',
        type: 'category',
        options: [
          { value: 'CAR', name: 'Carolina Panthers' },
          { value: 'NOS', name: 'New Orleans Saints' },
          { value: 'TBB', name: 'Tampa Bay Buccaneers' },
          { value: 'ATL', name: 'Atlanta Falcons' },
          { value: 'LAR', name: 'Los Angeles Rams' },
          { value: 'SEA', name: 'Seattle Seahawks' },
          { value: 'SFO', name: 'San Francisco 49ers' },
          { value: 'ARI', name: 'Arizona Cardinals' },
          { value: 'DAL', name: 'Dallas Cowboys' },
          { value: 'NYG', name: 'New York Giants' },
          { value: 'PHI', name: 'Philadelphia Eagles' },
          { value: 'WAS', name: 'Washington Football Team' },
          { value: 'GBP', name: 'Green Bay Packers' },
          { value: 'MIN', name: 'Minnesota Vikings' },
          { value: 'DET', name: 'Detroit Lions' },
          { value: 'CHI', name: 'Chicago Bears' },
          { value: 'KCC', name: 'Kansas City Chiefs' },
          { value: 'LVR', name: 'Las Vegas Raiders' },
          { value: 'LAC', name: 'Los Angeles Chargers' },
          { value: 'DEN', name: 'Denver Broncos' },
          { value: 'HOU', name: 'Houston Texans' },
          { value: 'TEN', name: 'Tennessee Titans' },
          { value: 'IND', name: 'Indianapolis Colts' },
          { value: 'JAC', name: 'Jacksonville Jaguars' },
          { value: 'CLE', name: 'Cleveland Browns' },
          { value: 'PIT', name: 'Pittsburgh Steelers' },
          { value: 'BAL', name: 'Baltimore Ravens' },
          { value: 'CIN', name: 'Cincinnati Bengals' },
          { value: 'BUF', name: 'Buffalo Bills' },
          { value: 'MIA', name: 'Miami Dolphins' },
          { value: 'NYJ', name: 'New York Jets' },
          { value: 'NEP', name: 'New England Patriots' },
          { value: 'FA', name: 'Free Agent' }
        ]
      },
      injury_status: {
        name: 'Injury Status', type: 'category',
        options: [
          { value: '', name: 'Healthy'},
          { value: 'Questionable', name: 'Questionable' },
          { value: 'Doubtful', name: 'Doubtful' },
          { value: 'Out', name: 'Out' },
          { value: 'IR', name: 'Injured Reserve' },
          { value: 'Sus', name: 'Suspended' },
          { value: 'PUP', name: 'Physically Unable to Perform' },
          { value: 'COV', name: 'Covid' },
          { value: 'NA', name: 'Not Available' }
        ]
      },
      sf_trade_value: { name: 'Trade Value (SF)', type: 'number' },
      trade_value: { name: 'Trade Value (STD)', type: 'number' },
      fc_sf_trade_value: { name: 'Trade Value (SF, FantasyCalc)', type: 'number' },
      fc_trade_value: { name: 'Trade Value (STD, FantasyCalc)', type: 'number' },
      ff_pts_ppr: { name: 'Fantasy Points (PPR)', type: 'number' },
      ff_pts_half_ppr: { name: 'Fantasy Points (Half PPR)', type: 'number' },
      ff_pts_standard: { name: 'Fantasy Points (STD)', type: 'number' },
      sf_position_rank: { name: 'Position Rank (SF)', type: 'number' },
      position_rank: { name: 'Position Rank (STD)', type: 'number' },
      avg_adp: { name: 'Average Positional ADP', type: 'number' },
      sf_change: { name: '% change in value (SF)', type: 'number' },
      standard_change: { name: '% change in value (STD)', type: 'number' },
      all_time_high_sf: { name: 'All Time Trade Value High (SF)', type: 'number' },
      all_time_low_sf: { name: 'All Time Trade Value Low (SF)', type: 'number' },
      all_time_high: { name: 'All Time Trade Value High (STD)', type: 'number' },
      all_time_low: { name: 'All Time Trade Value Low (STD)', type: 'number' },
      three_month_high_sf: { name: '3 Month Trade Value High (SF)', type: 'number' },
      three_month_low_sf: { name: '3 Month Trade Value Low (SF)', type: 'number' },
      three_month_high: { name: '3 Month Trade Value High (STD)', type: 'number' },
      three_month_low: { name: '3 Month Trade Value Low (STD)', type: 'number' },
      fc_sf_position_rank: { name: 'Position Rank (SF, FantasyCalc)', type: 'number' },
      fc_position_rank: { name: 'Position Rank (STD, FantasyCalc)', type: 'number' },
      fc_sf_change: { name: '% change in value (SF, FantasyCalc)', type: 'number' },
      fc_standard_change: { name: '% change in value (STD, FantasyCalc)', type: 'number' },
      fc_all_time_high_sf: { name: 'All Time Trade Value High (SF, FantasyCalc)', type: 'number' },
      fc_all_time_low_sf: { name: 'All Time Trade Value Low (SF, FantasyCalc)', type: 'number' },
      fc_all_time_high: { name: 'All Time Trade Value High (STD, FantasyCalc)', type: 'number' },
      fc_all_time_low: { name: 'All Time Trade Value Low (STD, FantasyCalc)', type: 'number' },
      fc_three_month_high_sf: { name: '3 Month Trade Value High (SF, FantasyCalc)', type: 'number' },
      fc_three_month_low_sf: { name: '3 Month Trade Value Low (SF, FantasyCalc)', type: 'number' },
      fc_three_month_high: { name: '3 Month Trade Value High (STD, FantasyCalc)', type: 'number' },
      fc_three_month_low: { name: '3 Month Trade Value Low (STD, FantasyCalc)', type: 'number' },
      ff_pass_att: { name: 'Pass Attempts', type: 'number' },
      ff_pass_cmp: { name: 'Pass Completions', type: 'number' },
      ff_cmp_pct: { name: 'Completion Percentage', type: 'number' },
      ff_pass_yd: { name: 'Passing Yards', type: 'number' },
      ff_pass_td: { name: 'Passing Touchdowns', type: 'number' },
      ff_pass_int: { name: 'Passing Interceptions', type: 'number' },
      ff_pass_rz_att: { name: 'Pass Attempts In Redzone', type: 'number' },
      ff_pass_sack: { name: 'Times Sacked', type: 'number'},
      ff_rush_att: { name: 'Rush Attempts', type: 'number'},
      ff_rush_yd: { name: 'Rushing Yards', type: 'number'},
      ff_rush_ypa: { name: 'Rushing Yards Per Attempt', type: 'number'},
      ff_rush_td: { name: 'Rushing Touchdowns', type: 'number'},
      ff_fum_lost: { name: 'Fumbles Lost', type: 'number'},
      ff_rec: { name: 'Receptions', type: 'number'},
      ff_rec_tgt: { name: 'Targets', type: 'number'},
      ff_rec_yd: { name: 'Receiving Yards', type: 'number'},
      ff_rec_td: { name: 'Receiving Touchdowns', type: 'number'},
      ff_rec_rz_tgt: { name: 'Targets in the Redzone', type: 'number'},
    }
  };

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
    { name: 'Trade Value (SF)', value: 'sf_trade_value', property: 'sf_trade_value' },
    { name: 'Trade Value (STD)', value: 'trade_value', property: 'trade_value' },
    { name: 'Fantasy Points', value: 'fantasy_points_desc', property: 'fantasy_points' },
    { name: 'Experience', value: 'experience_asc', property: 'experience' },
    { name: 'Age', value: 'experience_asc', property: 'experience' },
    { name: 'Position Rank (SF)', value: 'sf_position_rank', property: 'sf_position_rank' },
    { name: 'Position Rank (STD)', value: 'position_rank', property: 'position_rank' },
    { name: 'Average Positional ADP', value: 'avg_adp', property: 'avg_adp' },
    { name: '% change in value (SF)', value: 'sf_change', property: 'sf_change' },
    { name: '% change in value (STD)', value: 'standard_change', property: 'standard_change' },
  ];

  constructor(private leagueService: LeagueService) {

  }

  ngOnInit() {
    // add fantasy owners if league is logged in
    if (this.leagueService.isLeagueLoaded()) {
      this.config.fields.owner = {
        name: 'Fantasy Owner',
        type: 'category',
        options: this.generateSleeperOwnerList()
      };
    }
  }

  /**
 * generate owners value object to use in query
 * @return list of objects
 * @private
 */
  private generateSleeperOwnerList(): { value: LeagueOwnerDTO, name: string }[] {
    const list = [];
    for (const owner of this.leagueService.leagueTeamDetails) {
      list.push({ value: owner.owner, name: owner.owner.ownerName });
    }
    return list;
  }
}
