import { Component, Inject, OnInit } from "@angular/core";
import { DraftService } from "../../services/draft.service";
import { PlayerService } from "src/app/services/player.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ConfigService } from "src/app/services/init/config.service";
import { LeagueService } from "src/app/services/league.service";
import { LeagueType } from "src/app/model/league/LeagueDTO";

@Component({
    selector: 'edit-draft-adp-modal',
    templateUrl: './edit-draft-adp-modal.component.html',
    styleUrls: ['./edit-draft-adp-modal.component.scss']
})
export class EditDraftADPModalComponent implements OnInit {

    /** scoring format options for trade db */
    public scoringFormat: number[] = [0, 0.5, 1.0, 2.0];

    /** tep format options for trade db */
    public tepFormat: number[] = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5];

    /** team format options for trade db */
    public teamFormat: number[] = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

    /** starter format options for trade db */
    public starterFormat: number[] = [6, 7, 8, 9, 10, 11, 12, 13, 14];

    /** league type format options for trade db */
    public leagueType: string[] = ['Dynasty', 'Redraft'];

    constructor(
        public draftService: DraftService,
        public playerService: PlayerService,
        public configService: ConfigService,
        public leagueService: LeagueService,
        public dialogRef: MatDialogRef<EditDraftADPModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { sleeperId: string }
    ) {

    }

    ngOnInit(): void {

    }

    useMyLeague(): void {
        this.draftService.adpLeagueTypeFormat =
            this.leagueService.selectedLeague.type === LeagueType.DYNASTY ? 'Dynasty' : 'Redraft';
        this.draftService.isSuperflex = this.leagueService.selectedLeague.isSuperflex ? true : false;
        this.draftService.adpScoringFormat
            .setValue([this.leagueService.selectedLeague.scoringSettings.rec || 1]);
        this.draftService.adpStartersFormat
            .setValue([this.leagueService.selectedLeague.starters || 9]);
        this.draftService.adpTeamFormat
            .setValue([this.leagueService.selectedLeague.totalRosters || 12]);
        this.draftService.adpTepFormat
            .setValue([this.leagueService.selectedLeague.scoringSettings.bonusRecTE || 0]);
    }

    close(): void {
        if (this.data?.sleeperId) {
            this.draftService.updatePlayerADPDetails$.next(this.data.sleeperId)
        } else {
            this.draftService.refreshADP();
        }
        this.dialogRef.close();
    }

}