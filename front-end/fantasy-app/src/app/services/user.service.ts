import { Injectable } from '@angular/core'
import { PatreonApiService } from './api/patreon/patreon-api.service';
import { environment } from 'src/environments';
import { PatreonUser } from '../model/user/User';
import { Status } from '../components/model/status';
import { LeagueService } from './league.service';
import { LeagueDTO } from '../model/league/LeagueDTO';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SimpleTextModalComponent } from '../components/sub-components/simple-text-modal/simple-text-modal.component';
import { ConfigService } from './init/config.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private patreonClientId = environment.patreonClientId;

    private patreonRedirectUri = environment.loginRedirect;

    /** emits changes when changes to the user are made */
    userLeaguesChanged$: Subject<void> = new Subject<void>();

    /** user data of patreon user */
    user: PatreonUser = null;

    /** error message from log in */
    errMsg: string = '';

    /** loading status */
    loading: Status = Status.DONE;

    constructor(
        private leagueService: LeagueService,
        private patreonApiService: PatreonApiService,
        private dialog: MatDialog,
        private configService: ConfigService
    ) { }

    async loginWithPatreon(): Promise<void> {
        // Redirect the user to the Patreon OAuth authorization URL
        window.location.href = this.getPatreonAuthorizationUrl();
    }

    async handleOAuthCallback(): Promise<any> {
        this.errMsg = '';
        // Extract the OAuth code from the URL query parameters
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
            // Use Axios to exchange the OAuth code for an access token
            this.loading = Status.LOADING;
            this.patreonApiService.getUserFromPatreon(code).subscribe(
                (user) => {
                    this.user = user;
                    this.updateLeagueUser();
                    this.loading = Status.DONE;
                    if (this.user.leagues.length === 0) {
                        this.configService.loadDocumentation('dynasty_daddy_club')
                            .subscribe(data => {
                                this.dialog.open(SimpleTextModalComponent
                                    , {
                                        minHeight: '350px',
                                        minWidth: this.configService.isMobile ? '200px' : '500px',
                                        data: {
                                            headerText: 'How to Add Leagues',
                                            categoryList: data
                                        }
                                    }
                                );
                            });
                    }
                },
                (error) => {
                    this.loading = Status.DONE;
                    if (error.status === 401) {
                        this.errMsg = 'No membership is found for this account.';
                    }
                }
            );
        }

        return null;
    }

    private getPatreonAuthorizationUrl(): string {
        const authUrl = 'https://www.patreon.com/oauth2/authorize';

        const queryParams = new URLSearchParams({
            client_id: this.patreonClientId,
            redirect_uri: this.patreonRedirectUri,
            response_type: 'code',
            scope: 'identity identity.memberships'
        });

        return `${authUrl}?${queryParams.toString()}`;
    }

    /**
     * Add leagues to DD Club account
     * @param leagues leagues to add
     */
    addLeaguesToPatreonUser(leagues: LeagueDTO[]): void {
        const formattedLeagues = leagues.map(l => l.toPatreonLeagueObj());
        const combinedList = this.combineLeagueArrays(this.user?.leagues || [], formattedLeagues);
        this.setLeaguesForUser(combinedList);
    }

    /**
     * Sets the patreon user with the leagues
     * @param leagues leagues to set
     */
    setLeaguesForUser(leagues: any[]): void {
        this.patreonApiService.addLeaguesToUser(leagues, this.user.userId).subscribe(res => {
            this.user.leagues = leagues;
            this.updateLeagueUser();
            this.userLeaguesChanged$.next();
        });
    }

    /**
     * Sets the power rankings presets for user
     * @param presets leagues to set
     */
    setPRPresetsForUser(presets: any[]): void {
        this.patreonApiService.addPRPresetsToUser(presets, this.user.userId).subscribe(res => {
            this.user.prPresets = presets;
        });
    }

    /**
     * Sets the league format presets for user
     * @param presets leagues to set
     */
    setLFPresetsForUser(presets: any[]): void {
        this.patreonApiService.addLFPresetsToUser(presets, this.user.userId).subscribe(res => {
            this.user.lfPresets = presets;
        });
    }

    /**
     * update user profile information
     * @param firstName string for name
     * @param lastName string for last name
     * @param description user description
     * @param imageUrl image url for image on imgur/patreon
     * @param twitterHandle twitter handle
     */
    setUserProfileInfo(firstName: string, lastName: string, description: string, imageUrl: string = this.user.imageUrl, twitterHandle: string): void {
        this.patreonApiService.updateUserProfileInformation(
            this.user.userId, firstName, lastName, description, imageUrl, twitterHandle
        ).subscribe(res => {
            this.user.firstName = firstName;
            this.user.lastName = lastName;
            this.user.description = description;
            this.user.imageUrl = imageUrl;
            this.user.twitterHandle = twitterHandle;
            this.userLeaguesChanged$.next();
        });
    }

    /**
     * Helper function to update a league user
     * object with the patreon user data
     */
    private updateLeagueUser(): void {

        const userData = {
            username: this.user.firstName + ' ' + this.user.lastName,
            user_id: this.user.userId,
            avatar: this.user.imageUrl
        }
        const leagues = this.user.leagues.map(l => new LeagueDTO().fromPatreon(l));

        this.leagueService.leagueUser = { leagues: leagues, userData: userData, leaguePlatform: 0 };
    }

    /**
     * Combine leagues for a club user
     * @param array1 list of existing leagues
     * @param array2 list of leagues to add
     */
    private combineLeagueArrays(array1: any[], array2: any[]) {
        // Create a map to store items by a unique key
        const map = new Map();

        // Helper function to add an item to the map
        function addItemToMap(item) {
            const key = `${item.id}-${item.season}-${item.platform}`;
            if (!map.has(key)) {
                map.set(key, item);
            }
        }

        // Iterate through the first array and add items to the map
        array1.forEach(addItemToMap);

        // Iterate through the second array and add items to the map
        array2.forEach(addItemToMap);

        // Convert the map values back to an array
        const combinedArray = Array.from(map.values());

        return combinedArray;
    }
}
