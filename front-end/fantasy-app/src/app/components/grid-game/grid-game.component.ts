import { Component, OnInit } from "@angular/core";
import { BaseComponent } from "../base-component.abstract";
import { ConfigKeyDictionary, ConfigService, LocalStorageDictionary } from "src/app/services/init/config.service";
import { Status } from "../model/status";
import { LeagueService } from "src/app/services/league.service";
import { GridGameService } from "../services/grid.service";
import { MatDialog } from "@angular/material/dialog";
import { SearchGridPlayerModal } from "../modals/search-grid-player-modal/search-grid-player-modal.component";
import { GridResultModalComponent } from "../modals/grid-result-modal/grid-result-modal.component";

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
        this.addSubscriptions(
            this.configService.configValuesLoaded$.subscribe(_ => {
                this.initGridGame();
            }),
            this.gridGameService.validateGridSelection$.subscribe(_ => {
                if (this.gridGameService.guessesLeft === 0) {
                    this.dialog.open(GridResultModalComponent
                        , {
                            minHeight: '350px',
                            minWidth: this.configService.isMobile ? '200px' : '500px'
                        }
                    );
                }
            }));
        if (this.configService.getConfigOptionByKey(ConfigKeyDictionary.GRIDIRON_GRID)?.configValue) {
            this.initGridGame()
        }
    }

    private initGridGame(): void {
        this.gridGameService.gridDict = JSON.parse(this.configService.getConfigOptionByKey(ConfigKeyDictionary.GRIDIRON_GRID)?.configValue)
        const gridCache = JSON.parse(localStorage.getItem(LocalStorageDictionary.GRIDIRON_ITEM) || '{}')
        if (JSON.stringify(this.gridGameService.gridDict) === JSON.stringify(gridCache.grid)) {
            this.gridGameService.guessesLeft = gridCache.guesses;
            this.gridGameService.gridResults = gridCache.results;
        } else {
            localStorage.removeItem(LocalStorageDictionary.GRIDIRON_ITEM)
        }
        this.gridGameService.status = Status.DONE;
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
