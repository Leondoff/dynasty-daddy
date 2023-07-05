import { Component, OnInit, Inject } from '@angular/core';
import { GridGameService } from '../../services/grid.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ConfigService } from 'src/app/services/init/config.service';

@Component({
    selector: 'search-grid-player-modal',
    templateUrl: './search-grid-player-modal.component.html',
    styleUrls: ['./search-grid-player-modal.component.scss']
})
export class SearchGridPlayerModal implements OnInit {

    searchPlayers: any[] = [];

    searchVal: string = '';

    constructor(public gridGameService: GridGameService,
        public configService: ConfigService,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: { coords: any[] }) { }

    ngOnInit(): void { }

    selectPlayer(player: any): void {
        this.gridGameService.isSelectedPlayerCorrect(player.name, player.id, this.data.coords);
        this.close();
    }

    filterPlayers(): void {
        this.searchPlayers = this.gridGameService.gridPlayers
            .filter(p => p.name.toLowerCase().includes(this.searchVal) && !this.gridGameService.alreadyUsedPlayers.includes(p.id))
            .slice(0, 8);
    }

    /**
    * close dialog
    */
    close(): void {
        this.dialog.closeAll();
    }

}