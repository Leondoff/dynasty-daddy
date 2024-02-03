import { Component, Inject, OnInit } from "@angular/core";
import { DraftService } from "../../services/draft.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { LeagueService } from "src/app/services/league.service";
import { LeagueType } from "src/app/model/league/LeagueDTO";
import { FantasyMarket } from "src/app/model/assets/FantasyPlayer";
import { PlayerService } from "src/app/services/player.service";
import { ConfigService } from "src/app/services/init/config.service";

@Component({
    selector: 'app-edit-mock-draft-modal',
    templateUrl: './edit-mock-draft-modal.component.html',
    styleUrls: ['./edit-mock-draft-modal.component.scss']
})
export class EditMockDraftModalComponent implements OnInit {

    mockDraftRounds: number;

    mockDraftOrder: number;

    mockDraftPlayerType: number;

    mockTeamCount: number = 12;

    isSuperFlex: boolean;

    liveDraftTeams: string[];

    selectedMockDraftTeam: number = 1;

    selectedMarket: number;

    mockLeagueType: number = 0;

    constructor(
        public dialogRef: MatDialogRef<EditMockDraftModalComponent>,
        public leagueService: LeagueService,
        @Inject(MAT_DIALOG_DATA) public data: { isLive: boolean },
        public draftService: DraftService,
        private playerService: PlayerService,
        private configService: ConfigService,
    ) {

    }

    ngOnInit(): void {
        this.mockDraftRounds = this.leagueService.selectedLeague?.type === LeagueType.DYNASTY ? 5 : 30;
        this.mockDraftOrder = this.leagueService.selectedLeague?.type === LeagueType.DYNASTY ? 0 : 1;
        this.mockDraftPlayerType = this.leagueService.selectedLeague?.type === LeagueType.DYNASTY ? 0 : 2;
        this.isSuperFlex = this.leagueService.selectedLeague ? this.leagueService.selectedLeague.isSuperflex : true;
        this.mockTeamCount = this.leagueService.selectedLeague ? this.leagueService.selectedLeague.totalRosters : this.draftService.mockTeamCount;
        this.liveDraftTeams = this.leagueService.selectedLeague ? this.leagueService.leagueTeamDetails.slice().sort((a, b) => a.roster.rosterId - b.roster.rosterId).map(p =>
            p.owner.ownerName
        ) : Array.from({ length: this.mockTeamCount }, (_, index) => `Team ${index + 1}`);
        this.selectedMarket = this.playerService.selectedMarket;
    }

    createMockDraft(isLive: boolean = false): void {
        this.draftService.mockDraftRounds = this.mockDraftRounds;
        this.draftService.mockDraftOrder = this.mockDraftOrder;
        this.draftService.mockDraftPlayerType = this.mockDraftPlayerType;
        this.draftService.isSuperflex = this.isSuperFlex;
        this.draftService.mockTeamCount = this.mockTeamCount;
        this.draftService.selectedDraft = 'upcoming';
        this.draftService.generateDraft();
        this.draftService.createMockDraft();
        this.draftService.updateDraft$.next();
        if (isLive)
            this.draftService.startLiveDraft();
        if (this.configService.isMobile)
            this.configService.toggleToolbar$.next(false);
        this.close();
    }

    close = () => this.dialogRef.close();

    updateMockTeams(): void {
        if (this.mockTeamCount > 16) this.mockTeamCount = 16;
        if (this.mockTeamCount < 8) this.mockTeamCount = 8;
        this.liveDraftTeams = Array.from({ length: this.mockTeamCount }, (_, index) => `Team ${index + 1}`);
    }

    /**
     * select market handle
     * @param market new market
     */
    onMarketChange(market: FantasyMarket): void {
        this.playerService.selectedMarket = market;
    }

    updateMarket(): void {
        if (this.mockLeagueType === 0 && [4,5].includes(this.selectedMarket)) this.selectedMarket = 0;
        if (this.mockLeagueType === 1 && [0,1,2,3].includes(this.selectedMarket)) this.selectedMarket = 5;
    }

}