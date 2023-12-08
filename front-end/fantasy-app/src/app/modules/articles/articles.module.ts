import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CreateArticleComponent } from "src/app/components/articles/create-article/create-article.component";
import { SharedModule } from "../shared/shared.module";
import { QuillModule } from "ngx-quill";

@NgModule({
    imports: [
      CommonModule,
      SharedModule,
      RouterModule.forChild([
        { path: 'post', component: CreateArticleComponent },
      ]),
      QuillModule.forRoot(),
    ],
    declarations: [
        CreateArticleComponent
    ]
  })
  export class ArticlesModule {
  }
  