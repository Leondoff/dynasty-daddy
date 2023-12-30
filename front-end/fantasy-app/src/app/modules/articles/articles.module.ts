import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CreateArticleComponent } from "src/app/components/articles/create-article/create-article.component";
import { SharedModule } from "../shared/shared.module";
import { QuillModule } from "ngx-quill";
import { TimelineComponent } from "src/app/components/articles/timeline/timeline.component";
import { ArticleCardComponent } from "src/app/components/articles/timeline/article-card/article-card.component";
import { ViewArticleComponent } from "src/app/components/articles/view-article/view-article.component";

@NgModule({
    imports: [
      CommonModule,
      SharedModule,
      RouterModule.forChild([
        { path: 'post', component: CreateArticleComponent },
        { path: 'timeline', component: TimelineComponent },
        { path: ':articleId', component: ViewArticleComponent },
      ]),
      QuillModule.forRoot(),
    ],
    declarations: [
        CreateArticleComponent,
        TimelineComponent,
        ArticleCardComponent,
        ViewArticleComponent
    ]
  })
  export class ArticlesModule {
  }
  