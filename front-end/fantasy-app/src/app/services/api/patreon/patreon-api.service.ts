import { Injectable } from "@angular/core";
import { PatreonAPIConfigService } from "./patreon-api-config.service";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PatreonApiService {

    constructor(
        private http: HttpClient,
        private patreonApiConfigService: PatreonAPIConfigService
    ) {

    }

    getTokenFromPatreonToken(code: string): Observable<any> {
        return this.http.get<any>(this.patreonApiConfigService.getTokenForCodeEndpoint + '?code=' + code).pipe(map(
            (token: any) => {
                return token;
            }
        ));
    }

}
