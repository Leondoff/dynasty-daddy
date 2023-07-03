import { Injectable } from "@angular/core";
import { Status } from "../model/status";
import { FantasyPlayerApiService } from "src/app/services/api/fantasy-player-api.service";
import { Subject } from "rxjs";
import { LocalStorageDictionary } from "src/app/services/init/config.service";

@Injectable({
  providedIn: 'root'
})
export class GridGameService {

  status: Status = Status.LOADING;

  gridDict = {};

  validateGridSelection$: Subject<string> = new Subject<string>();

  gridResults: any[][] = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
  ];

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
        }
        localStorage.setItem(LocalStorageDictionary.GRIDIRON_ITEM, JSON.stringify({ grid: this.gridDict, guesses: this.guessesLeft, results: this.gridResults }))
        this.validateGridSelection$.next();
      });
  }
}