import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ConfigService } from "src/app/services/init/config.service";

@Component({
    selector: 'app-create-preset-modal',
    templateUrl: './create-preset-modal.component.html',
    styleUrls: ['./create-preset-modal.component.scss']
})
export class CreatePresetModalComponent implements OnInit {

    presetName: string;

    constructor(public dialogRef: MatDialogRef<CreatePresetModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { presetNum: number },
        public configService: ConfigService) {

    }

    ngOnInit(): void {
        this.presetName = `Custom Preset #${this.data.presetNum + 1}`
    }

    /**
     * close dialog
     */ 
    close(): void {
        this.dialogRef.close('');
    }

    createPreset(): void {
        this.dialogRef.close(this.presetName)
    }
}