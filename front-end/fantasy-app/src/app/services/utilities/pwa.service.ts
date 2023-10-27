import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable()
export class PwaService {

    promptEvent: any;

    constructor(private swUpdate: SwUpdate) {
        this.swUpdate.available.subscribe(event => {
            if (this.askUserToUpdate()) {
                window.location.reload();
            }
        });

        // window.addEventListener('beforeinstallprompt', event => {
        //     this.promptEvent = event;
        // });
    }

    private askUserToUpdate(): boolean {
        return confirm('Do you wat to update to the latest version?');
    }
}
