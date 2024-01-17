import { Component, OnInit } from "@angular/core";
import { DraftService } from "../../services/draft.service";
import { MatDialogRef } from "@angular/material/dialog";
import { LeagueService } from "src/app/services/league.service";
import { LeagueType } from "src/app/model/league/LeagueDTO";

@Component({
    selector: 'app-edit-mock-draft-modal',
    templateUrl: './edit-mock-draft-modal.component.html',
    styleUrls: ['./edit-mock-draft-modal.component.scss']
})
export class EditMockDraftModalComponent implements OnInit {

    mockDraftRounds: number;

    mockDraftOrder: number;

    mockDraftPlayerType: number;

    isSuperFlex: boolean;

    constructor(
        public dialogRef: MatDialogRef<EditMockDraftModalComponent>,
        public leagueService: LeagueService,
        public draftService: DraftService
    ) {

    }

    ngOnInit(): void {
        this.mockDraftRounds = this.leagueService.selectedLeague?.type === LeagueType.DYNASTY ? 5 : 30;
        this.mockDraftOrder = this.leagueService.selectedLeague?.type === LeagueType.DYNASTY ? 0 : 1;
        this.mockDraftPlayerType = this.leagueService.selectedLeague?.type === LeagueType.DYNASTY ? 0 : 2;
        this.isSuperFlex = this.leagueService.selectedLeague ? this.leagueService.selectedLeague.isSuperflex : true;
    }

    createMockDraft(): void {
        this.draftService.mockDraftRounds = this.mockDraftRounds;
        this.draftService.mockDraftOrder = this.mockDraftOrder;
        this.draftService.mockDraftPlayerType = this.mockDraftPlayerType;
        this.draftService.isSuperflex = this.isSuperFlex;
        this.draftService.selectedDraft = 'upcoming';
        this.draftService.generateDraft();
        this.draftService.createMockDraft();
        this.draftService.updateDraft$.next();
        this.close();
    }

    close = () => this.dialogRef.close();

}