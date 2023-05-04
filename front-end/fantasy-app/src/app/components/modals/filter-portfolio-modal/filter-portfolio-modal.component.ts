import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { LeagueService } from '../../../services/league.service';
import { ConfigService } from '../../../services/init/config.service';
import { PortfolioService } from '../../services/portfolio.service';
import { Option, QueryBuilderClassNames, QueryBuilderConfig } from 'angular2-query-builder';

@Component({
  selector: 'app-portfolio-values-modal',
  templateUrl: './filter-portfolio-modal.component.html',
  styleUrls: ['./filter-portfolio-modal.component.css']
})
export class FilterPortfolioModalComponent implements OnInit {

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
      sf_trade_value: { name: 'Trade Value (SF)', type: 'number' },
      trade_value: { name: 'Trade Value (STD)', type: 'number' },
      ff_pts_ppr: { name: 'Fantasy Points (PPR)', type: 'number' },
      ff_pts_half_ppr: { name: 'Fantasy Points (Half PPR)', type: 'number' },
      ff_pts_standard: { name: 'Fantasy Points (STD)', type: 'number' },
      sf_position_rank: { name: 'Position Rank (SF)', type: 'number' },
      position_rank: { name: 'Position Rank (STD)', type: 'number' },
      avg_adp: { name: 'Average Positional ADP', type: 'number' },
      sf_change: { name: '% change in value (SF)', type: 'number' },
      standard_change: { name: '% change in value (STD)', type: 'number' },
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

  /** has the query been run since last change */
  dirtyQuery: boolean = true;

  constructor(
    public portfolioService: PortfolioService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { isGroup2: boolean },
    public leagueService: LeagueService,
    public configService: ConfigService) {
  }

  ngOnInit(): void {
    this.config.fields.fl_name = {
      name: 'League Name',
      type: 'category',
      options: this.getOptionsForLeague('name'),
    };
    this.config.fields.fl_leagueType = {
      name: 'League Type',
      type: 'category',
      options: this.getOptionsForLeague('leagueType'),
    };
    this.config.fields.fl_platformDisplay = {
      name: 'League Platform',
      type: 'category',
      options: this.getOptionsForLeague('platformDisplay'),
    };
    this.config.fields.fl_rosters = {
      name: 'League Team Count',
      type: 'category',
      options: this.getOptionsForLeague('rosters'),
    };
    this.config.fields.fl_startCount = {
      name: 'League Start Count',
      type: 'category',
      options: this.getOptionsForLeague('startCount'),
    };
    this.config.fields.fl_isSuperflex = {
      name: 'League QB Settings',
      type: 'category',
      options: this.getOptionsForLeague('isSuperflex'),
    };
  }

  /**
   * Return list of options for specific field.
   * These are dynamic based on logged in leagues.
   * @param field field to look up
   * @returns 
   */
  private getOptionsForLeague(field: string): Option[] {
    const uniqueValues = [];
    for (let key in this.portfolioService.leagueIdMap) {
      let value = this.portfolioService.leagueIdMap[key][field];
      if (!uniqueValues.includes(value)) {
        uniqueValues.push(value);
      }
    }
    const options = [];
    uniqueValues.forEach(val => {
      options.push({ value: val, name: val });
    });
    return options;
  }

  /**
   * close dialog
   */
  close(): void {
    this.dialog.closeAll();
  }

  /**
   * adds all query results to comp table
   */
  applyFilter(): void {
    this.portfolioService.advancedFiltering = true;
    this.portfolioService.portfolioValuesUpdated$.next();
    this.close();
  }

}
