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
import { ArticlesApiService } from "src/app/services/api/articles/articles-api.service";
import { ArticlePreview } from "../model/articlePreview";
import { LeagueSwitchService } from "../services/league-switch.service";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ConfirmationDialogModal } from "../modals/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material/dialog";

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

    /** article columns */
    articleColumns: string[] = ['title', 'likes', 'status', 'updatedAt', 'actions'];

    /** league datasource */
    leagueDatasource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

    /** article datasource */
    articlesDatasource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

    /** mat paginator */
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    /** mat sort */
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    /** list of unsaved removed leagues ids */
    leaguesToRemove: string[] = [];

    /** status of changes */
    changesLoading: Status = Status.DONE;

    /** profile information */
    profileForm: FormGroup;

    constructor(
        public userService: UserService,
        public leagueService: LeagueService,
        public displayService: DisplayService,
        public leagueSwitchService: LeagueSwitchService,
        public articlesApiService: ArticlesApiService,
        public configService: ConfigService,
        public router: Router,
        private dialog: MatDialog,
        private formBuilder: FormBuilder
    ) {
        super();
    }

    ngOnInit(): void {
        this.userService.user.articles = [];
        this.displayColumns = this.configService.isMobile ?
            ['name', 'delete'] :
            ['name', 'type', 'year', 'teams', 'platform', 'delete'];
        if (this.userService.user) {
            this.profileForm = this.formBuilder.group({
                firstName: [this.userService.user.firstName, [Validators.required, Validators.maxLength(200), this.forbiddenNameValidator]],
                lastName: [this.userService.user.lastName, [Validators.required, Validators.maxLength(200), this.forbiddenNameValidator]],
                twitterHandle: [this.userService.user.twitterHandle, [Validators.maxLength(100)]],
                description: [this.userService.user.description, [Validators.maxLength(500)]]
            });
        }
    }

    ngAfterViewInit(): void {
        this.refreshTable();
        if (this.userService.user?.articles.length > 0) {
            this.refreshArticles();
        }
        this.addSubscriptions(this.userService.userLeaguesChanged$.pipe(delay(500)).subscribe(_ => {
            this.refreshTable();
            this.changesLoading = Status.DONE;
        }));
    }

    /**
     * refresh article table
     */
    refreshTable(): void {
        this.leagueDatasource = new MatTableDataSource(this.userService.user?.leagues || []);
        this.leagueDatasource.sort = this.sort;
        this.leagueDatasource.paginator = this.paginator;
    }

    /**
     * refresh article table
     */
    refreshArticles(): void {
        this.articlesDatasource = new MatTableDataSource(this.userService.user?.articles || []);
        this.articlesDatasource.paginator = this.paginator;
    }

    /**
     * Handles changes to tab selection
     * @param tab object on change
     */
    tabChanged(tab: any): void {
        if (tab.index === 1 && this.userService.user.articles.length === 0) {
            this.articlesApiService
                .getArticlesForUser(this.userService.user.userId)
                .subscribe(res => {
                    this.userService.user.articles = res;
                    this.refreshArticles();
                });
        }
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

    /**
     * Navigate to editing an article
     * @param article article to edit
     */
    editArticle(article: ArticlePreview): void {
        this.router.navigate(['../../articles/post'],
            {
                queryParams: this.leagueSwitchService.buildQueryParams({ 'articleId': article.articleId })
            }
        );
    }

    /**
     * Navigate to article page
     * @param article article to view
     */
    viewArticle(article: ArticlePreview): void {
        this.router.navigate(['../../articles/', article.articleId],
            {
                queryParams: this.leagueSwitchService.buildQueryParams()
            }
        );
    }

    /**
     * Delete article for user
     * @param article article preview object
     */
    deleteArticle(article: ArticlePreview): void {
        const dialogRef = this.dialog.open(ConfirmationDialogModal, {
            disableClose: true,
            autoFocus: true,
            data: {
                title: `Are you sure you want to delete ${article.title}?`
            }
        })
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.addSubscriptions(this.articlesApiService.deleteArticle(
                    article.articleId,
                    this.userService.user.userId,
                ).subscribe(_ => {
                    const indexToRemove = this.userService.user.articles
                        .findIndex(art => art.articleId === article.articleId);
                    this.userService.user.articles.splice(indexToRemove, 1);
                    this.refreshArticles();
                }));
            }
        });
    }

    /**
     * save profile info handler
     */
    saveProfileInfo(): void {
        if (this.profileForm.valid) {
            this.changesLoading = Status.LOADING;
            const { firstName, lastName, description, imageUrl, twitterHandle } = this.profileForm.value;
            this.userService.setUserProfileInfo(firstName, lastName, description, imageUrl, twitterHandle)
        }
    }

    // Custom validator for forbidden name
    forbiddenNameValidator(control: FormGroup) {
        const forbiddenNames = ['daddy', 'jeremy', 'timperio'];
        const value = control.value.toLowerCase();

        if (forbiddenNames.includes(value)) {
            return { forbiddenName: true };
        }

        return null;
    }
}
