import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { BaseComponent } from "../base-component.abstract";
import { UserService } from "src/app/services/user.service";
import { ConfigService } from "src/app/services/init/config.service";
import { DisplayService } from "src/app/services/utilities/display.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { Status } from "../model/status";
import { LeagueService } from "src/app/services/league.service";
import { delay } from "rxjs/operators";

@Component({
    selector: 'app-user-settings',
    templateUrl: './user-settings.component.html',
    styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent extends BaseComponent implements OnInit, AfterViewInit {

    /** page desription */
    pageDescription: string = 'Manage you Dynasty Daddy Club account settings and leagues assigned to it.';

    /** display columns */
    displayColumns: string[] = ['name', 'type', 'year', 'teams', 'platform', 'delete'];

    /** league datasource */
    leagueDatasource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

    /** mat paginator */
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    /** mat sort */
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    /** list of unsaved removed leagues ids */
    leaguesToRemove: string[] = [];

    /** status of changes */
    changesLoading: Status = Status.DONE;

    constructor(
        public userService: UserService,
        public leagueService: LeagueService,
        public displayService: DisplayService,
        public configService: ConfigService
    ) {
        super();
    }

    ngOnInit(): void {
        this.displayColumns = this.configService.isMobile ? 
        ['name', 'delete'] :
        ['name', 'type', 'year', 'teams', 'platform', 'delete'];
    }

    ngAfterViewInit(): void {
        this.refreshTable();
        this.addSubscriptions(this.userService.userLeaguesChanged$.pipe(delay(500)).subscribe(_ => {
            this.refreshTable();
            this.changesLoading = Status.DONE;
        }));
    }

    refreshTable(): void {
        this.leagueDatasource = new MatTableDataSource(this.userService.user?.leagues || []);
        this.leagueDatasource.sort = this.sort;
        this.leagueDatasource.paginator = this.paginator;
    }

    /**
     * add league to delete list
     */
    deleteLeague = (leagueId: string) =>
        this.leaguesToRemove.push(leagueId);

    /**
     * Undo deleted league
     * @param leagueId league id
     */
    undoDeleteLeague = (leagueId: string) =>
        this.leaguesToRemove = this.leaguesToRemove.filter(l => l != leagueId);

    /** 
     * is league in deleted list
     * @param league id
     */
    isLeagueDeleted = (leagueId: string) =>
        this.leaguesToRemove.find(l => l == leagueId) !== undefined;

    /**
     * update changes for a user
     */
    saveChanges(): void {
        this.changesLoading = Status.LOADING;
        const leagues = this.leagueDatasource.data
            .filter(l => !this.leaguesToRemove.includes(l.id))
        this.userService.setLeaguesForUser(leagues);
    }
}
