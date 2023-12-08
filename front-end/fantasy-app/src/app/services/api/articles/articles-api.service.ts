import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, fromEvent, throwError } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { ArticlesApiConfigService } from './articles-api-config.service';
import { ImageModel } from 'src/app/model/config/ImageModel';


@Injectable({
  providedIn: 'root'
})
export class ArticlesApiService {

  readonly USER_ID_PLACEHOLDER = ':userId';

  readonly userid = "Client-ID F97be5bb806758f";

  // had to use xhr request, because angular's POST won't send whole image
  private apiEndpoint = 'https://api.imgur.com/3/image';

  private headers = new HttpHeaders({
    Authorization: this.userid,
  });


  constructor(private http: HttpClient, private articlelsApiConfigService: ArticlesApiConfigService) {
  }

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

  uploadImage(image: any): Observable<any> {
    console.log(image);
    return this.readFile(image).pipe(
      switchMap(img => {
        let fd = new FormData();
        fd.append('image', img as any);
        console.log('post')
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
