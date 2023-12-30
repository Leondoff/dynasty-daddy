import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ArticlesApiConfigService {

  private _postArticleEndpoint = '';

  private _getArticlesForUserEndpoint = '';

  private _searchArticlesEndpoint = '';

  private _likeArticleEnpoint = '';

  private _fullArticleEndpoint = '';

  private _deleteArticleEndpoint = '';

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

  get searchArticlesEndpoint(): string {
    return this._searchArticlesEndpoint;
  }

  set searchArticlesEndpoint(value: string) {
    this._searchArticlesEndpoint = value;
  }

  get likeArticleEnpoint(): string {
    return this._likeArticleEnpoint;
  }

  set likeArticleEnpoint(value: string) {
    this._likeArticleEnpoint = value;
  }

  get fullArticleEndpoint(): string {
    return this._fullArticleEndpoint;
  }

  set fullArticleEndpoint(value: string) {
    this._fullArticleEndpoint = value;
  }

  get deleteArticleEndpoint(): string {
    return this._deleteArticleEndpoint;
  }

  set deleteArticleEndpoint(value: string) {
    this._deleteArticleEndpoint = value;
  }
}
