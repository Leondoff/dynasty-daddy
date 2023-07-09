import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";


@Component({
    selector: 'simple-text-modal',
    templateUrl: './simple-text-modal.component.html',
    styleUrls: ['./simple-text-modal.component.css']
})
export class SimpleTextModal implements OnInit {

    headerText: string = '';

    listText: string[] = [];

    constructor(
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: { headerText: string, listText: string[] }
    ) {}

    ngOnInit(): void {
        this.headerText = this.data.headerText;
        this.listText = this.data.listText;
    }

    close(): void {
        this.dialog.closeAll();
    }
}
