import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, fromEvent, throwError } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { ArticlesApiConfigService } from './articles-api-config.service';
import { ImageModel } from 'src/app/model/config/ImageModel';
import { ArticlePreview } from 'src/app/components/model/articlePreview';


@Injectable({
  providedIn: 'root'
})
export class ArticlesApiService {

  /** placeholder for userid to replace */
  readonly USER_ID_PLACEHOLDER = ':userId';

  /** placeholder for articleId to replace */
  readonly ARTICLE_ID_PLACEHOLDER = ':articleId';

  /** user id for imgur auth */
  readonly userid = "Client-ID F97be5bb806758f";

  // had to use xhr request, because angular's POST won't send whole image
  private apiEndpoint = 'https://api.imgur.com/3/image';

  /** headers object for imgur */
  private headers = new HttpHeaders({
    Authorization: this.userid,
  });

  constructor(private http: HttpClient,
    private articlelsApiConfigService: ArticlesApiConfigService) {
  }

  /**
   * Post new or edits to an articles
   * @param id article id if editing
   * @param userId user to link to
   * @param title string title for article
   * @param titleImg url of title image
   * @param postContent html string of content
   * @param keywords keywords array of strings
   * @param linkedPlayers linked players to article
   * @param category string of category set
   * @param status string of status to post
   */
  postArticle(
    id: number = null,
    userId: string,
    title: string,
    titleImg: string,
    postContent: string,
    keywords: string[],
    linkedPlayers: string[],
    category: string,
    status: string
  ): Observable<any> {
    return this.http.post<any>(this.articlelsApiConfigService.postArticleEndpoint.replace(this.USER_ID_PLACEHOLDER, userId),
      { id, title, titleImg, postContent, keywords, linkedPlayers, category, status }
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  /**
   * Search articles from database
   * @param category string of category to filter on
   * @param search string search value
   * @param userId string user id
   * @param page page number
   * @param pageLength length of page
   */
  searchArticles(
    category: string = '',
    search: string = '',
    userId: string = '',
    page: number = 1,
    pageLength: number = 8
  ): Observable<ArticlePreview[]> {
    return this.http.post<ArticlePreview[]>(this.articlelsApiConfigService.searchArticlesEndpoint,
      { category, search, userId, page, pageLength }
    ).pipe(
      map((res: any) => {
        return res.map(r => new ArticlePreview(r));
      })
    );
  }

  /**
   * Like article or unlike if already liked
   * @param articleId number for the article id
   * @param userId string of user id linking it
   */
  likeArticle(
    articleId: number,
    userId: string,
    isActive: boolean = null
  ): Observable<boolean> {
    return this.http.post<boolean>(this.articlelsApiConfigService.likeArticleEnpoint,
      { articleId, userId, isActive }
    ).pipe(
      map((res: boolean) => {
        return res;
      })
    );
  }

    /**
   * Delete an article for a user
   * @param articleId number for the article id
   * @param userId string of user id linking it
   */
    deleteArticle(
      articleId: number,
      userId: string
    ): Observable<number> {
      return this.http.post<number>(this.articlelsApiConfigService.deleteArticleEndpoint,
        { userId, articleId }
      ).pipe(
        map((res: number) => {
          return res;
        })
      );
    }

  /**
   * Get full article from article id
   * @param articleId number of article id
   */
  getFullArticle(
    articleId: string
  ): Observable<ArticlePreview> {
    return this.http.get<ArticlePreview>(
      this.articlelsApiConfigService.fullArticleEndpoint + articleId
    ).pipe(
      map((res) => {
        return new ArticlePreview(res);
      })
    )
  }

  /**
   * Get all articles for user
   * @param userId to fetch articles for
   */
  getArticlesForUser(
    userId: string
  ): Observable<ArticlePreview[]> {
    return this.http.get<ArticlePreview[]>(
      this.articlelsApiConfigService.getArticlesForUserEndpoint + userId
    ).pipe(
      map((res) => {
        return res.map(r => new ArticlePreview(r));
      })
    )
  }

  /**
   * Upload an image to imgur and return reference
   * @param image to upload
   */
  uploadImage(image: any): Observable<any> {
    return this.readFile(image).pipe(
      switchMap(image => {
        const fmtImg = image as string
        let img = fmtImg.substring(fmtImg.indexOf(',') + 1);
        let fd = new FormData();
        fd.append('image', img as any);
        return this.http.post(this.apiEndpoint, fd, { headers: this.headers });
      })
    );
  }

  private readFile(file: File): Observable<string | ArrayBuffer> {
    return from(new Promise<string | ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = e => {
        resolve((e.target as FileReader).result);
      };

      reader.onerror = e => {
        console.error(`FileReader failed on file ${file.name}.`);
        reject(null);
      };

      if (!file) {
        console.error('No file to read.');
        reject(null);
      }

      reader.readAsDataURL(file);
    }));
  }

  // get specify image from imgur api 
  getImage(id: string): Observable<ImageModel> {
    const Header = new HttpHeaders({
      'Authorization': this.userid
    })
    return this.http.get<ImageModel>('https://api.imgur.com/3/image/' + id, { headers: Header });
  }
}
