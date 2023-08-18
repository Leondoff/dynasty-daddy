import { Component, OnInit, OnChanges, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { ConfigService } from 'src/app/services/init/config.service';
import { LeagueService } from 'src/app/services/league.service';
import { ColorService, TierColorPalette } from 'src/app/services/utilities/color.service';
import { LeagueSwitchService } from '../../services/league-switch.service';
import { LeagueFormatService, WoRPTiers } from '../../services/league-format.service';

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

    // datasource for mat table
    dataSource: MatTableDataSource<FantasyPlayer> = new MatTableDataSource<FantasyPlayer>();

    /** mat sort */
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    /** mat paginator */
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    /** columns to display in table */
    @Input()
    selectedCols: string[];

    columnsToDisplay: string[];

    /** color gradient */
    perGradient: string[] = [];

    constructor(public configService: ConfigService,
        public leagueSwitchService: LeagueSwitchService,
        public leagueFormatService: LeagueFormatService,
        private colorService: ColorService,
        public leagueService: LeagueService) {

    }

    ngOnInit(): void {
        this.perGradient = this.colorService.getProbGradient();
        this.refreshTable();
    }

    ngOnChanges(): void {
        this.refreshTable();
    }

    private refreshTable(): void {
        this.columnsToDisplay = [...this.selectedCols, 'actions'];
        this.dataSource = new MatTableDataSource(this.players);
        this.setSortForTable();
        this.players.forEach(p => {
            this.leagueFormatService.tableCache[p.name_id] = {
                player: p.full_name,
                pos: p.position,
                team: p.team,
                owner: p?.owner?.ownerName || '-',
                tradeValue: this.leagueService.selectedLeague.isSuperflex ? p.sf_trade_value : p.trade_value,
                pts: this.playerFormatDict[p.name_id]?.c?.pts,
                ppg: Math.round(this.playerFormatDict[p.name_id]?.c?.pts / this.playerFormatDict[p?.name_id]?.c?.week * 100) / 100,
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
                opp: this.playerFormatDict[p?.name_id]?.c?.opp,
                oppg: this.playerFormatDict[p?.name_id]?.c?.week != 0 ?
                    this.playerFormatDict[p?.name_id]?.c?.opp / this.playerFormatDict[p?.name_id]?.c?.week : 0,
                ppo: this.playerFormatDict[p?.name_id]?.c?.opp != 0 ?
                    this.playerFormatDict[p?.name_id]?.c?.pts / this.playerFormatDict[p?.name_id]?.c?.opp : 0,
                pps: this.playerFormatDict[p?.name_id]?.c?.snp != 0 ? this.playerFormatDict[p?.name_id]?.c?.pts /
                    this.playerFormatDict[p?.name_id]?.c?.snp : 0,
                snpP: this.playerFormatDict[p?.name_id]?.c?.snp /
                    this.playerFormatDict[p?.name_id]?.c?.tmSnp,
                snppg:
                    this.playerFormatDict[p?.name_id]?.c?.week != 0 ?
                        this.playerFormatDict[p?.name_id]?.c?.snp / this.playerFormatDict[p?.name_id]?.c?.week : 0,
                worpTier: this.playerFormatDict[p?.name_id]?.w?.worpTier,
                worpTierDisplay: this.getWoRPTierName(this.playerFormatDict[p?.name_id]?.w?.worpTier),
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
                default: return this.leagueFormatService.tableCache[item.name_id]?.[property] || 0;
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

    getWoRPTierName(tier: WoRPTiers): string {
        switch (tier) {
            case WoRPTiers.LeagueWinner:
                return this.configService.isMobile ? 'Breaker' : 'League Breaker';
            case WoRPTiers.Elite:
                return 'Elite';
            case WoRPTiers.Starter:
                return 'Starter';
            case WoRPTiers.Clogger:
                return this.configService.isMobile ? 'Clogger' : 'Roster Clogger';
            case WoRPTiers.Bench:
                return this.configService.isMobile ? 'Bench' : 'Bench Piece';
            default:
                return 'Waiver';
        }
    }

    getWoRPColor = (tier: WoRPTiers) =>
        TierColorPalette[tier]
}
