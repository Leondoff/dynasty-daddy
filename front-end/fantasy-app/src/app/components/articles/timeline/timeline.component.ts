import { Component, OnInit } from "@angular/core";
import { BaseComponent } from "../../base-component.abstract";
import { ArticlesApiService } from "src/app/services/api/articles/articles-api.service";
import { ArticlePreview } from "../../model/articlePreview";
import { Status } from "../../model/status";
import { debounceTime, delay } from "rxjs/operators";
import { ConfigService } from "src/app/services/init/config.service";
import { UserService } from "src/app/services/user.service";
import { Subject } from "rxjs";

@Component({
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent extends BaseComponent implements OnInit {

    /** supported categories */
    articleCategories: string[] = ['Start/Sit', 'Redraft Strategy', 'Dynasty Strategy', 'Player Discussion', 'Injuries', 'Rookies', 'IDP', 'Dynasty Daddy', 'Other'];

    /** articles to search from */
    articles: ArticlePreview[] = [];

    /** selected category toggle */
    selectedCategory: string = 'Trending';

    /** loading status of search */
    articlesStatus: Status = Status.LOADING;

    /** search value for input */
    searchVal: string = '';

    /** toggle search subject for debounce */
    searchSubject$: Subject<void> = new Subject<void>();

    /** page number for articles */
    page: number = 1;

    constructor(public articlesApiService: ArticlesApiService,
        public userService: UserService,
        public configService: ConfigService) {
        super()
    }

    ngOnInit(): void {
        this.addSubscriptions(
            this.searchSubject$.pipe(
                debounceTime(500)
            ).subscribe(_ => {
                this.resetSearch();
                this.updateArticleSearchResults();
            })
        );
        this.updateArticleSearchResults();
    }

    /**
     * Toggle category to filter on
     * @param category to toggle string
     */
    toggleSelectedCategory(category): void {
        this.resetSearch();
        this.selectedCategory = category;
        this.updateArticleSearchResults();
    }

    /**
     * fetches articles to display in backend
     */
    updateArticleSearchResults(): void {
        this.articlesStatus = Status.LOADING;
        this.articlesApiService.searchArticles(this.selectedCategory, this.searchVal, this.userService?.user?.userId, this.page).pipe(delay(200)).subscribe(art => {
            this.articles.push(...art);
            this.articlesStatus = Status.DONE;
        });
    }

    /**
     * clear text input result
     */
    clearTextSearch(): void {
        this.searchVal = '';
        this.resetSearch();
        this.updateArticleSearchResults();
    }

    loadMoreArticles(): void {
        this.page++;
        this.updateArticleSearchResults();
    }

    private resetSearch(): void {
        this.page = 1;
        this.articles = [];
    }
}
