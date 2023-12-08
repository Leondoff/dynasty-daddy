import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ArticlesApiConfigService {

  private _postArticleEndpoint = '';

  private _getArticlesForUserEndpoint = '';

  private _getTrendingArticlesEndpoint = '';

  get postArticleEndpoint(): string {
    return this._postArticleEndpoint;
  }

  set postArticleEndpoint(value: string) {
    this._postArticleEndpoint = value;
  }

  get getArticlesForUserEndpoint(): string {
    return this._getArticlesForUserEndpoint;
  }

  set getArticlesForUserEndpoint(value: string) {
    this._getArticlesForUserEndpoint = value;
  }

  get getTrendingArticlesEndpoint(): string {
    return this._getTrendingArticlesEndpoint;
  }

  set getTrendingArticlesEndpoint(value: string) {
    this._getTrendingArticlesEndpoint = value;
  }
}
