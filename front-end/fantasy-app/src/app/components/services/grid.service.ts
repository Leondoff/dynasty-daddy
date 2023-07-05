import { Injectable } from "@angular/core";
import { Status } from "../model/status";
import { FantasyPlayerApiService } from "src/app/services/api/fantasy-player-api.service";
import { Subject } from "rxjs";
import { LocalStorageDictionary } from "src/app/services/init/config.service";
import { GridPlayer } from "../model/gridPlayer";

@Injectable({
  providedIn: 'root'
})
export class GridGameService {

  status: Status = Status.LOADING;

  /** grid info from the db */
  gridDict = {};

  /** validation subject */
  validateGridSelection$: Subject<string> = new Subject<string>();

  /** already used player ids */
  alreadyUsedPlayers = [];

  /** all players to choose from */
  gridPlayers: GridPlayer[] = [];

  /** selected results grid */
  gridResults: any[][] = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
  ];

  /** dict of college to espn id for img */
  collegeLogoMap = {
    'Michigan': 130,
    'Texas Christian': 2628,
    'Georgia': 61,
    'Ohio State': 194,
    'Florida': 57,
    'Alabama': 333,
    'Southern California': 30,
    'Louisiana State': 99,
    'Clemson': 228,
    'South Carolina': 2579,
    'North Carolina State': 152,
    'North Carolina': 153,
    'Wisconsin': 275,
    'Oregon': 2483,
    'Florida State': 52,
    'Texas': 251,
    'Oklahoma': 201,
    'Notre Dame': 87
  }

  /** guesses left to make */
  guessesLeft: number = 9;

  constructor(private fantasyPlayersAPIService: FantasyPlayerApiService) { }

  isSelectedPlayerCorrect(name: string, playerId: number, coords: number[]): void {
    this.fantasyPlayersAPIService
      .validateGridGameSelectedPlayer(playerId, [this.gridDict['xAxis'][coords[0]], this.gridDict['yAxis'][coords[1]]])
      .subscribe(res => {
        this.guessesLeft--;
        if (res.isValid) {
          const x = coords[0] + 1;
          const y = coords[1] + 1;
          this.gridResults[x][y] = { name, img: res.img };
          this.alreadyUsedPlayers.push(playerId);
        }
        localStorage.setItem(LocalStorageDictionary.GRIDIRON_ITEM, JSON.stringify({ grid: this.gridDict, guesses: this.guessesLeft, results: this.gridResults, alreadyUsedPlayers: this.alreadyUsedPlayers }))
        this.validateGridSelection$.next();
      });
  }

  // fetchGridPlayers(): void {
  //   this.fantasyPlayersAPIService.getAllGridGamePlayers().subscribe(res => {
  //     this.gridPlayers = res;
  //   })
  // }
}
