import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { LeagueService } from '../../../services/league.service';
import { ConfigService } from '../../../services/init/config.service';
import { LeagueFormatService } from '../../services/league-format.service';
import { QueryBuilderClassNames, QueryBuilderConfig } from 'angular2-query-builder';

@Component({
    selector: 'app-filter-league-format-modal',
    templateUrl: './filter-league-format-modal.component.html',
    styleUrls: ['./filter-league-format-modal.component.css']
})
export class FilterLeagueFormatModalComponent implements OnInit {

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
            lf_pts: { name: 'Fantasy Points', type: 'number' },
            lf_ppg: { name: 'Fantasy Points Per Game', type: 'number' },
            lf_worp: { name: 'WoRP', type: 'number' },
            lf_worppg: { name: 'WoRP Points Per Game', type: 'number' },
            lf_winP: { name: 'Player Win Percent', type: 'number' },
            lf_week: { name: 'Weeks Played', type: 'number' },
            lf_spikeHigh: { name: 'High Spike Week Count', type: 'number' },
            lf_spikeMid: { name: 'Mid Spike Week Count', type: 'number' },
            lf_spikeLow: { name: 'Low Spike Week Count', type: 'number' },
            lf_spikeHighP: { name: 'High Spike Week %', type: 'number' },
            lf_spikeMidP: { name: 'Mid Spike Week %', type: 'number' },
            lf_spikeLowP: { name: 'Low Spike Week %', type: 'number' },
            lf_opp: { name: 'Fantasy Opportunities', type: 'number' },
            lf_oppg: { name: 'Opportunities Per Game', type: 'number' },
            lf_ppo: { name: 'Points Per Opportunity', type: 'number' },
            lf_pps: { name: 'Points Per Snap', type: 'number' },
            lf_snpP: { name: 'Snap %', type: 'number' },
            lf_snppg: { name: 'Snaps Per Game', type: 'number' },
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
        public leagueFormatService: LeagueFormatService,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: { isGroup2: boolean },
        public leagueService: LeagueService,
        public configService: ConfigService) {
    }

    ngOnInit(): void {
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
        this.leagueFormatService.isAdvancedFiltered = true;
        this.leagueFormatService.pageIndex = 0;
        this.leagueFormatService.leagueFormatPlayerUpdated$.next();
        this.close();
    }

}
