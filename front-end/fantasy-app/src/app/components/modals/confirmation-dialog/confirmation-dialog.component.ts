import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'confirm-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogModal {
    public confirmMessage: string;

    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogModal>,
        @Inject(MAT_DIALOG_DATA) public data: { title: string, description?: string } ) {
    }

    
    confirm(): void {
        this.dialogRef.close(true);
    }

    
    close(): void {
        this.dialogRef.close(false);
    }
}