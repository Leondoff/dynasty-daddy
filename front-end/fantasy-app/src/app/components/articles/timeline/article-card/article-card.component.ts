import { Component, Input, OnInit } from "@angular/core";
import { ArticlePreview } from "src/app/components/model/articlePreview";
import { LeagueSwitchService } from "src/app/components/services/league-switch.service";
import { ArticlesApiService } from "src/app/services/api/articles/articles-api.service";
import { UserService } from "src/app/services/user.service";
import { DisplayService } from "src/app/services/utilities/display.service";

@Component({
    selector: 'article-card',
    templateUrl: './article-card.component.html',
    styleUrls: ['./article-card.component.scss'],
})
export class ArticleCardComponent implements OnInit {

    @Input()
    article: ArticlePreview

    likeCounter: number = 0;

    constructor(public articleApiService: ArticlesApiService,
        public leagueSwitchService: LeagueSwitchService,
        public displayService: DisplayService, 
        private userService: UserService) {

    }

    ngOnInit(): void {
        this.likeCounter = this.article?.likes || 0;
    }

    /**
     * like article
     */
    likeArticle(): void {
        this.articleApiService.likeArticle(this.article.articleId, this.userService?.user?.userId)
        .subscribe(res => {
            // toggle like counter
            if (res) {
                this.likeCounter++;
            } else if (this.likeCounter > 0) {
                this.likeCounter--;
            }
            this.article.isLiked = res;
        });
    }

    isNewArticle = () => 
        this.displayService.getDaysSinceDateString(this.article.postedAt) <= 3;
}
