import { Component, OnInit } from "@angular/core";
import { BaseComponent } from "../base-component.abstract";
import { ConfigKeyDictionary, ConfigService, LocalStorageDictionary } from "src/app/services/init/config.service";
import { Status } from "../model/status";
import { LeagueService } from "src/app/services/league.service";
import { GridGameService } from "../services/grid.service";
import { MatDialog } from "@angular/material/dialog";
import { SearchGridPlayerModal } from "../modals/search-grid-player-modal/search-grid-player-modal.component";
import { GridResultModalComponent } from "../modals/grid-result-modal/grid-result-modal.component";
import { PageService } from "src/app/services/utilities/page.service";
import { FantasyPlayerApiService } from "src/app/services/api/fantasy-player-api.service";

@Component({
    selector: 'grid-game',
    templateUrl: './grid-game.component.html',
    styleUrls: ['./grid-game.component.scss']
})
export class GridGameComponent extends BaseComponent implements OnInit {

    pageDescription = 'Test your NFL player knowledge with NFL Immaculate Gridiron. Similar to the popular game immaculate grid, you must guess player who meet the two criteria that intersect on the grid. Player data is from 1999-2022 and a new puzzle is created every day at 8:00 AM EST.'

    TEAM_ACC_PLACEHOLDER = 'TEAM_ACC';

    teamImgURL = 'https://a.espncdn.com/i/teamlogos/nfl/500/TEAM_ACC.png';

    collegeImgURL = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/TEAM_ACC.png'

    constructor(public configService: ConfigService,
        private leagueService: LeagueService,
        private dialog: MatDialog,
        private pageService: PageService,
        public gridGameService: GridGameService) {
        super();
        this.pageService.setUpPageSEO('NFL Immaculate Gridiron',
            ['nfl', 'immaculate', 'grid', 'trivia'],
            this.pageDescription)
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
        this.gridGameService.gridDict = JSON.parse(this.configService.getConfigOptionByKey(ConfigKeyDictionary.GRIDIRON_GRID)?.configValue);
        const gridCache = JSON.parse(localStorage.getItem(LocalStorageDictionary.GRIDIRON_ITEM) || '{}')
        if (JSON.stringify(this.gridGameService.gridDict) === JSON.stringify(gridCache.grid)) {
            this.gridGameService.guessesLeft = gridCache.guesses;
            this.gridGameService.gridResults = gridCache.results;
            this.gridGameService.alreadyUsedPlayers = gridCache.alreadyUsedPlayers || [];
        } else {
            localStorage.removeItem(LocalStorageDictionary.GRIDIRON_ITEM)
        }
        this.gridGameService.status = Status.DONE;
    }

    getTeamImg(row: any): string {
        switch (row.type) {
            case 'college':
                return this.collegeImgURL.replace(this.TEAM_ACC_PLACEHOLDER, this.gridGameService.collegeLogoMap[row?.value])
            default:
                return this.teamImgURL.replace(this.TEAM_ACC_PLACEHOLDER, row?.value)
        }
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

    openResults(): void {
        this.dialog.open(GridResultModalComponent
            , {
                minHeight: '350px',
                minWidth: this.configService.isMobile ? '200px' : '500px'
            }
        );
    }

    openTwitter(): void {
        window.open('https://twitter.com/nflgridirongame', '_blank');
    }

    getAwardDisplay(award: string): string {
        switch (award) {
            case 'roty':
                return 'ROTY';
            case 's_mvp':
                return 'Super Bowl MVP';
            default:
                return 'MVP';
        }
    }

    getStatThresholdDisplay(stat: string): string {
        if (stat.includes('1000')) {
            return '1000+';
        } else if (stat.includes('10')) {
            return '10+';
        } else if (stat.includes('40')) {
            return '40+';
        } else {
            return '4000+'
        }
    }

    getStatCategory(stat: string): string {
        switch (stat) {
            case 'rushTds10':
                return this.configService.isMobile ? 'Rush Tds' : 'Rushing Tds';
            case 'recTds10':
                return this.configService.isMobile ? 'Rec Tds' : 'Receiving Tds';
            case 'passTds40':
                return this.configService.isMobile ? 'Pass Tds' : 'Passing Tds';
            case 'rushYd1000':
                return this.configService.isMobile ? 'Rush Yds' : 'Rushing Yards';
            case 'recYd1000':
                return this.configService.isMobile ? 'Rec Yds' : 'Receiving Yards';
            case 'passYd4000':
                return this.configService.isMobile ? 'Pass Yds' : 'Passing Yards';
            default:
                return this.configService.isMobile ? 'Int' : 'Passing Ints';
        }
    }
}
