import { Injectable } from '@angular/core'
import { PatreonApiService } from './api/patreon/patreon-api.service';
import { environment } from 'src/environments';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private patreonClientId = environment.patreonClientId;

    private patreonRedirectUri = environment.loginRedirect;

    constructor(
        private patreonApiService: PatreonApiService
    ) {}

    async loginWithPatreon(): Promise<void> {
        // Redirect the user to the Patreon OAuth authorization URL
        window.location.href = this.getPatreonAuthorizationUrl();
    }

    async handleOAuthCallback(): Promise<any> {
        // Extract the OAuth code from the URL query parameters
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
            // Use Axios to exchange the OAuth code for an access token
            this.patreonApiService.getTokenFromPatreonToken(code).subscribe(accessToken => {
                console.log(accessToken) 
            })
        }

        return null;
    }

    private getPatreonAuthorizationUrl(): string {
        const authUrl = 'https://www.patreon.com/oauth2/authorize';

        const queryParams = new URLSearchParams({
            client_id: this.patreonClientId,
            redirect_uri: this.patreonRedirectUri,
            response_type: 'code',
        });

        return `${authUrl}?${queryParams.toString()}`;
    }
}
