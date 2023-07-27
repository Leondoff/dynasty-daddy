import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { ConfigService } from 'src/app/services/init/config.service';
import { LeagueService } from 'src/app/services/league.service';
import { ColorService } from 'src/app/services/utilities/color.service';

@Component({
    selector: 'app-league-format-table',
    templateUrl: './league-format-table.component.html',
    styleUrls: ['./league-format-table.component.scss']
})
export class LeagueFormatTableComponent implements OnInit, OnChanges {

    @Input()
    playerFormatDict: {};

    @Input()
    players: FantasyPlayer[];

    /** table cache */
    tableCache = {};

    // datasource for mat table
    dataSource: MatTableDataSource<FantasyPlayer> = new MatTableDataSource<FantasyPlayer>();

    /** mat sort */
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    /** mat paginator */
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    /** columns to display in table */
    columnsToDisplay = ['player', 'pos', 'team', 'worp', 'worppg', 'tradeValue', 'winP', 'week', 'spikeHigh', 'spikeMid', 'spikeLow', 'spikeHighP', 'spikeMidP', 'spikeLowP'];

    /** color gradient */
    perGradient: string[] = [];

    worpGradient: string[] = [];

    constructor(public configService: ConfigService,
        private colorService: ColorService,
        public leagueService: LeagueService) {

    }

    ngOnInit(): void {
        this.perGradient = this.colorService.getProbGradient();
        this.worpGradient = this.colorService.getColorGradientArray(60, '#581845', '#c59700');
        this.refreshTable();
    }

    ngOnChanges(): void {
        this.refreshTable();
    }

    private refreshTable(): void {
        this.dataSource = new MatTableDataSource(this.players);
        this.setSortForTable();
        this.players.forEach(p => {
            this.tableCache[p.name_id] = {
                worp: this.playerFormatDict[p.name_id]?.w?.worp,
                worppg: Math.round(this.playerFormatDict[p.name_id]?.w?.worp / this.playerFormatDict[p?.name_id]?.c?.week * 100) / 100,
                winP: this.playerFormatDict[p.name_id]?.w?.percent,
                week: this.playerFormatDict[p?.name_id]?.c?.week,
                spikeHigh: this.playerFormatDict[p?.name_id]?.c?.spikeHigh,
                spikeMid: this.playerFormatDict[p?.name_id]?.c?.spikeMid,
                spikeLow: this.playerFormatDict[p?.name_id]?.c?.spikeLow,
                spikeHighP: this.playerFormatDict[p?.name_id]?.c?.spikeHigh / this.playerFormatDict[p?.name_id]?.c?.week,
                spikeMidP: this.playerFormatDict[p?.name_id]?.c?.spikeMid / this.playerFormatDict[p?.name_id]?.c?.week,
                spikeLowP: this.playerFormatDict[p?.name_id]?.c?.spikeLow / this.playerFormatDict[p?.name_id]?.c?.week,
            }
        });
        this.dataSource.paginator = this.paginator;
    }

    private setSortForTable(): void {
        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
                case 'tradeValue': {
                    return this.leagueService.selectedLeague.isSuperflex ? item.sf_trade_value : item.trade_value;
                }
                default: return this.tableCache[item.name_id]?.[property] || 0;
            }
        };
        this.dataSource.sort = this.sort;
    }

    /**
     * return color in gradient for table
     * @param percent percent to get color for
     */
    getProbColor = (percent: number) =>
        this.perGradient[Math.round(percent * 100)];

    getWoRPColor = (worp: number) =>
        this.worpGradient[Math.round(worp * 10) + 10];
}
