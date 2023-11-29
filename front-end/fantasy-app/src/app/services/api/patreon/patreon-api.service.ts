import { Injectable } from "@angular/core";
import { PatreonAPIConfigService } from "./patreon-api-config.service";
import { HttpClient } from "@angular/common/http";
import { catchError, map } from "rxjs/operators";
import { Observable, throwError } from "rxjs";
import { PatreonUser } from "src/app/model/user/User";

@Injectable({
    providedIn: 'root'
})
export class PatreonApiService {

    constructor(
        private http: HttpClient,
        private patreonApiConfigService: PatreonAPIConfigService
    ) {

    }

    getUserFromPatreon(code: string): Observable<PatreonUser> {
        return this.http.get<any>(this.patreonApiConfigService.getUserFromPatreonEndpoint + '?code=' + code).pipe(
            map((user: any) => {
                return new PatreonUser(user);
            }),
            catchError((error) => {
                return throwError(error);
            })
        );
    }

    addLeaguesToUser(leagues: any[], userId: string): Observable<any> {
        return this.http.post<any>(this.patreonApiConfigService.addLeaguesToUserEndpoint, { leagues, "id": userId }).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    addPRPresetsToUser(presets: any[], userId: string): Observable<any> {
        return this.http.post<any>(this.patreonApiConfigService.addPRPresetsToUserEndpoint, { presets, "id": userId }).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    addLFPresetsToUser(presets: any[], userId: string): Observable<any> {
        return this.http.post<any>(this.patreonApiConfigService.addLFPresetsToUserEndpoint, { presets, "id": userId }).pipe(
            map((res: any) => {
                return res;
            })
        );
    }
}
