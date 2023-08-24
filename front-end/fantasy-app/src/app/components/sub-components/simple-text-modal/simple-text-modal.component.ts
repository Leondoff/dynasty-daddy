import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SimpleTextCategory } from "src/app/model/toolHelpModel";

@Component({
    selector: 'simple-text-modal',
    templateUrl: './simple-text-modal.component.html',
    styleUrls: ['./simple-text-modal.component.css']
})
export class SimpleTextModal implements OnInit {

    headerText: string = '';

    categoryList: SimpleTextCategory[] = [];

    constructor(
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: { headerText: string, categoryList: SimpleTextCategory[] }
    ) {}

    ngOnInit(): void {
        this.headerText = this.data.headerText;
        this.categoryList = this.data.categoryList;
    }

    /**
     * Open url
     */
    openURL(url: string): void {
        window.open(url, "_blank");
    }

    close(): void {
        this.dialog.closeAll();
    }
}
