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
import { SimpleTextModal } from "../sub-components/simple-text-modal/simple-text-modal.component";

@Component({
    selector: 'grid-game',
    templateUrl: './grid-game.component.html',
    styleUrls: ['./grid-game.component.scss']
})
export class GridGameComponent extends BaseComponent implements OnInit {

    /** page description */
    pageDescription = 'Test your NFL player knowledge with NFL Immaculate Gridiron. Similar to the popular game immaculate grid, you must guess player who meet the two criteria that intersect on the grid. Player data is from 1999-2022 and a new puzzle is created every day at 8:00 AM EST.'

    /** team acc placeholder */
    TEAM_ACC_PLACEHOLDER = 'TEAM_ACC';

    /** nfl url */
    teamImgURL = 'https://a.espncdn.com/i/teamlogos/nfl/500/TEAM_ACC.png';

    /** college url */
    collegeImgURL = 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/TEAM_ACC.png';

    /** help menu bullet points */
    helpBullets =  [
        "Select a player for each cell that matches the criteria for that cell's row and column",
        "For a player to be considered valid for a team, he must've suited up for one NFL regular season game for that team",
        "If a cell is for a team and an award, the award must have been won after 1999 but doesn't have to be on the team",
        "If a cell is for a team and a season stat, the player you select must have recorded that stat after 1999 but doesn't have to be on the team",
        "If you select a player for a cell with a stat, that player must've accumulated that stat in a completed season from 1999 or later",
        "If you select a player for a cell with a college, that player must have been drafted from that college. If a player transfers colleges, the college they transfer to is the college.",
        "If a cell is for a college and a season stat, the player you select must have graduated from that college and accumulated that stat in the NFL (not in college).",
        "A player cannot be used twice",
        "You have 9 guesses to fill out the grid",
        "Each guess, whether correct or incorrect, counts as a guess",
        "You can guess active or inactive NFL players",
        "There is a new grid every day at 8 AM"
    ];

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
                    this.gridGameService.batchPersistGridResults();
                    this.openResults();
                }
            }));
        if (this.configService.getConfigOptionByKey(ConfigKeyDictionary.GRIDIRON_GRID)?.configValue) {
            this.initGridGame();
        }
    }

    /**
     * Open results modal
     */
    private openResults(): void {
        this.dialog.open(GridResultModalComponent, {
            minHeight: '350px',
            minWidth: this.configService.isMobile ? '200px' : '500px',
        });
    }

    /**
     * Init immaculate gridiron
     */
    private initGridGame(): void {
        this.gridGameService.calculateTotalSelections();
        this.gridGameService.gridDict = JSON.parse(this.configService.getConfigOptionByKey(ConfigKeyDictionary.GRIDIRON_GRID)?.configValue);
        const gridCache = JSON.parse(localStorage.getItem(LocalStorageDictionary.GRIDIRON_ITEM) || '{}');
        if (JSON.stringify(this.gridGameService.gridDict) === JSON.stringify(gridCache.grid)) {
            this.gridGameService.guessesLeft = gridCache.guesses;
            this.gridGameService.gridResults = gridCache.results;
            this.gridGameService.alreadyUsedPlayers = gridCache.alreadyUsedPlayers || [];
        } else {
            localStorage.removeItem(LocalStorageDictionary.GRIDIRON_ITEM)
        }
        this.gridGameService.status = Status.DONE;
        if (this.gridGameService.guessesLeft === 9) {
            this.openHowToPlay()
        }
    }

    /**
     * Return string for team img
     * @param row category object
     */
    getTeamImg(row: any): string {
        switch (row.type) {
            case 'college':
                return this.collegeImgURL.replace(this.TEAM_ACC_PLACEHOLDER, this.gridGameService.collegeLogoMap[row?.value])
            default:
                return this.teamImgURL.replace(this.TEAM_ACC_PLACEHOLDER, row?.value)
        }
    }

    /**
     * Open player search for grid
     * @param x cell x int
     * @param y cell y int
     */
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

    /**
     * Open twitter account
     */
    openTwitter(): void {
        window.open('https://twitter.com/nflgridirongame', '_blank');
    }

    /**
     * Retuns display name for award acc
     * @param award category string
     */
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

    /**
     * Get number string for stat
     * @param stat string stat
     */
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

    /**
     * Get stat category display name
     * @param stat string for stat category
     */
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
                return this.configService.isMobile ? 'Int Thrown' : 'Ints Thrown';
        }
    }

    /**
     * Open how to play modal
     */
    openHowToPlay(): void {
        this.dialog.open(SimpleTextModal
            , {
                minHeight: '350px',
                minWidth: this.configService.isMobile ? '200px' : '500px',
                data: {
                    headerText: 'How to play',
                    listText: this.helpBullets
                }
            }
        );
    }

    /** toggle mr unlimited mode */
    toggleUnlimitedMode(): void {
        this.gridGameService.unlimitedMode = !this.gridGameService.unlimitedMode
    }
}
