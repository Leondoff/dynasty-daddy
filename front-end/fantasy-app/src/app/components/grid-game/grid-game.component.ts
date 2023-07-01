import { Component, OnInit } from "@angular/core";
import { BaseComponent } from "../base-component.abstract";
import { ConfigService } from "src/app/services/init/config.service";
import { Status } from "../model/status";
import { LeagueService } from "src/app/services/league.service";
import { GridGameService } from "../services/grid.service";
import { MatDialog } from "@angular/material/dialog";
import { SearchGridPlayerModal } from "../modals/search-grid-player-modal/search-grid-player-modal.component";

@Component({
    selector: 'grid-game',
    templateUrl: './grid-game.component.html',
    styleUrls: ['./grid-game.component.scss']
})
export class GridGameComponent extends BaseComponent implements OnInit {

    TEAM_ACC_PLACEHOLDER = 'TEAM_ACC';

    teamImgURL = 'https://a.espncdn.com/i/teamlogos/nfl/500/TEAM_ACC.png';

    constructor(private configService: ConfigService,
        private leagueService: LeagueService,
        private dialog: MatDialog,
        public gridGameService: GridGameService) {
        super();
    }

    ngOnInit(): void {
        if (this.leagueService.leagueStatus === 'LOADING') {
            this.gridGameService.status = Status.LOADING;
            this.leagueService.leagueStatus = 'NONE';
        }
        this.configService.configValuesLoaded$.subscribe(_ => {
            this.gridGameService.status = Status.DONE;
            this.gridGameService.gridDict = JSON.parse(this.configService.getConfigOptionByKey('daily_grid')?.configValue)
        })
    }

    getTeamImg(teamAcc: string): string {
        return this.teamImgURL.replace(this.TEAM_ACC_PLACEHOLDER, teamAcc)
    }

    openPlayerSearch(x: number, y: number): void {
        this.dialog.open(SearchGridPlayerModal
            , {
                minHeight: '350px',
                minWidth: this.configService.isMobile ? '200px' : '500px',
                data: {
                    coords: [x, y]
                }
            }
        );
    }
}
