import { Component, OnInit, Inject } from '@angular/core';
import { GridGameService } from '../../services/grid.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { FantasyPlayerApiService } from 'src/app/services/api/fantasy-player-api.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ConfigService } from 'src/app/services/init/config.service';

@Component({
    selector: 'search-grid-player-modal',
    templateUrl: './search-grid-player-modal.component.html',
    styleUrls: ['./search-grid-player-modal.component.scss']
})
export class SearchGridPlayerModal implements OnInit {

    searchSubject$: Subject<string> = new Subject<string>();

    searchPlayers: any[] = [];

    searchVal: string = '';

    constructor(public gridGameService: GridGameService,
        public configService: ConfigService,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: { coords: any[] },
        private fantasyPlayerAPIService: FantasyPlayerApiService) { }

    ngOnInit(): void {
        this.searchSubject$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap((searchVal: string) => {
                return this.fantasyPlayerAPIService.getGridGamePlayersFromSearch(searchVal)
            })
        ).subscribe(res => {
            this.searchPlayers = res.filter(p => !this.gridGameService.alreadyUsedPlayers?.includes(p.id));
        });
    }

    selectPlayer(player: any): void {
        this.gridGameService.isSelectedPlayerCorrect(player.name, player.id, this.data.coords);
        this.close();
    }

    /**
    * close dialog
    */
    close(): void {
        this.dialog.closeAll();
    }

}