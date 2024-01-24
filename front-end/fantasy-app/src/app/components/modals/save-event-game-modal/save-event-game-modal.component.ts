import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'app-save-event-game-modal',
    templateUrl: './save-event-game-modal.component.html',
    styleUrls: ['./save-event-game-modal.component.scss']
})
export class SaveEventGameModal implements OnInit {

    name: string = '';

    eventCode: string = '';

    constructor(public dialogRef: MatDialogRef<SaveEventGameModal>) {

    }

    ngOnInit(): void {

    }

    /**
 * close dialog
 */
    close(): void {
        this.dialogRef.close('');
    }

    saveGame(): void {
        this.dialogRef.close({"name": this.name, "eventCode": this.eventCode});
    }
}