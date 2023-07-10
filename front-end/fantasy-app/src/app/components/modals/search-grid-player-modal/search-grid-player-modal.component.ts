import { Component, OnInit, Inject } from '@angular/core';
import { GridGameService } from '../../services/grid.service';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
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
        const condition = this.configService.getConfigOptionByKey('daily_grid_client')?.configValue == 'true'
        this.searchSubject$.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((searchVal: string) => {
            return !condition ? this.fantasyPlayerAPIService.getGridGamePlayersFromSearch(searchVal) : of([]);
          })
        ).subscribe(res => {
          if (!condition) {
            this.searchPlayers = res.filter(p => !this.gridGameService.alreadyUsedPlayers?.includes(p.id));
          } else {
            this.searchPlayers = this.gridGameService.gridPlayers.filter(p => p.name.toLowerCase().includes(this.searchVal.toLowerCase()) && !this.gridGameService.alreadyUsedPlayers?.includes(p.id)).slice(0, 20);
          }
        });
        
        // this.searchSubject$.subscribe(_ => {
        //     this.searchPlayers = this.gridGameService.gridPlayers.filter(p => p.name.toLowerCase().includes(this.searchVal.toLowerCase()) && !this.gridGameService.alreadyUsedPlayers?.includes(p.id)).slice(0, 20)
        // })
    }

    selectPlayer(player: any): void {
        this.gridGameService.isSelectedPlayerCorrect(player, this.data.coords);
        this.close();
    }

    /**
    * close dialog
    */
    close(): void {
        this.dialog.closeAll();
    }
}