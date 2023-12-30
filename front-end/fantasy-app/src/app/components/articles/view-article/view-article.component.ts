import { Component, OnInit } from "@angular/core";
import { BaseComponent } from "../../base-component.abstract";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { ArticlesApiService } from "src/app/services/api/articles/articles-api.service";
import { ArticlePreview } from "../../model/articlePreview";
import { ConfigService } from "src/app/services/init/config.service";
import { DisplayService } from "src/app/services/utilities/display.service";
import { UserService } from "src/app/services/user.service";
import { ShareSocialsComponent } from "../../sub-components/share-socials/share-socials.component";
import { MatDialog } from "@angular/material/dialog";
import { PlayerService } from "src/app/services/player.service";
import { FantasyPlayer } from "src/app/model/assets/FantasyPlayer";
import { LeagueSwitchService } from "../../services/league-switch.service";
import { Status } from "../../model/status";

@Component({
    selector: 'app-view-article',
    templateUrl: './view-article.component.html',
    styleUrls: ['./view-article.component.scss'],
})
export class ViewArticleComponent extends BaseComponent implements OnInit {

    /** article id placeholder param */
    ARTICLE_ID_PARAM: string = 'articleId';

    /** artcle to read */
    article: ArticlePreview;

    /** article loading status */
    articleStatus: Status = Status.LOADING;

    /** linked players */
    linkedPlayers: FantasyPlayer[] = [];

    constructor(
        private activatedRoute: ActivatedRoute,
        public configService: ConfigService,
        public displayService: DisplayService,
        public userService: UserService,
        public dialog: MatDialog,
        public leagueSwitchService: LeagueSwitchService,
        public playerService: PlayerService,
        private articleApiService: ArticlesApiService
    ) {
        super();
    }

    ngOnInit(): void {
        this.playerService.loadPlayerValuesForToday();
        this.addSubscriptions(
            this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
                const articleId = params.get(this.ARTICLE_ID_PARAM);
                this.articleApiService.getFullArticle(articleId).subscribe(res => {
                    this.article = res;
                    if (this.playerService.playerValues.length > 0) {
                        this.linkedPlayers = this.article?.linkedPlayers
                            ?.map(p => this.playerService.getPlayerByNameId(p))
                            .slice(0, 8);
                    }
                    this.articleStatus = Status.DONE;
                });
            }),
            this.playerService.currentPlayerValuesLoaded$.subscribe(_ => {
                this.linkedPlayers = this.article?.linkedPlayers
                    ?.map(p => this.playerService.getPlayerByNameId(p))
                    .slice(0, 8);
            })
        );
    }

    /**
     * like article
     */
    likeArticle(): void {
        this.articleApiService.likeArticle(this.article.articleId, this.userService?.user?.userId, true)
            .subscribe(res => {
                this.article.isLiked = res;
            });
    }

    /**
     * Open share socials modal
     */
    openShareModal(): void {
        this.dialog.open(ShareSocialsComponent
            , {
                data: {
                    postTitle: this.article.title,
                    postUrl: window.location.href,
                    description: this.article.title
                }
            }
        );
    }

    /**
     * Open twitter account for author
     */
    openTwitter(): void {
        window.open('https://twitter.com/' + this.article.twitterHandle);
    }

}
