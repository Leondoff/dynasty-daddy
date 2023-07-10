import { Injectable } from "@angular/core";
import { Status } from "../model/status";
import { FantasyPlayerApiService } from "src/app/services/api/fantasy-player-api.service";
import { Observable, Subject, of } from "rxjs";
import { LocalStorageDictionary } from "src/app/services/init/config.service";
import { GridPlayer } from "../model/gridPlayer";
import { delay } from "rxjs/operators";

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

  isSelectedPlayerCorrect(player: GridPlayer, coords: number[]): void {
    this.verifySelectedPlayer(player, [this.gridDict['xAxis'][coords[0]], this.gridDict['yAxis'][coords[1]]]).subscribe(res =>{
      this.guessesLeft--;
      if (res) {
        const x = coords[0] + 1;
        const y = coords[1] + 1;
        this.gridResults[x][y] = { name: player.name, img: player.headshot_url };
        this.alreadyUsedPlayers.push(player.name);
      }
      localStorage.setItem(LocalStorageDictionary.GRIDIRON_ITEM, JSON.stringify({ grid: this.gridDict, guesses: this.guessesLeft, results: this.gridResults, alreadyUsedPlayers: this.alreadyUsedPlayers }))
      this.validateGridSelection$.next();
    })
  }

  loadGridPlayers(): void {
    if (this.gridPlayers.length === 0) {
      this.fantasyPlayersAPIService.getAllGridGamePlayers().subscribe(res => {
        this.gridPlayers = res;
      });
    }
  }

  verifySelectedPlayer(player: GridPlayer, categories: any[]): Observable<boolean> {
    let isValid = true;
    categories.forEach(category => {
      switch (category.type) {
        case 'jersey_number': {
          isValid = player?.jersey_numbers?.includes(category.value) && isValid;
          break;
        }
        case 'college': {
          isValid = player?.college === category.value && isValid;
          break;
        }
        case 'award': {
          isValid = JSON.stringify(player?.awards_json) !== JSON.stringify({}) && player?.awards_json?.[category.value] !== '' && isValid;
          break;
        }
        case 'stat': {
          isValid = player?.stats_json?.[category.value] && isValid;
          break;
        }
        default: {
          isValid = player?.teams?.includes(category.value) && isValid;
        }
      }
    });
    // need a delay otherwise results component wont load for some reason
    return of(isValid).pipe(delay(500));
  }
}
