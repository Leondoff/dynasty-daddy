import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable()
export class PwaService {

    promptEvent: any;

    constructor(private updates: SwUpdate) {
        if (updates.isEnabled) {
            this.updates.available.subscribe((event) => {
                this.promptUserToUpdate();
            });

            // Check for updates every 6 hours (6 * 60 * 60 seconds)
            setInterval(() => {
                this.checkForUpdates();
            }, 6 * 60 * 60 * 1000);
        }
    }

    public checkForUpdates(): void {
        this.updates.checkForUpdate();
    }

    private promptUserToUpdate(): void {
        if (confirm('A new version is available. Update now?')) {
            document.location.reload();
        }
    }
}
