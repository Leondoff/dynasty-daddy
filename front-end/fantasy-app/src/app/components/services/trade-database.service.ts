import { Injectable } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/operators';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { TradeDatabaseItem } from 'src/app/model/assets/TradeDatabase';
import { FantasyPlayerApiService } from 'src/app/services/api/fantasy-player-api.service';

@Injectable({
  providedIn: 'root'
})
export class TradeDatabaseService {

  /** form control for scoring filter dropdown */
  selectedScoringFormat = new UntypedFormControl([0, 0.5, 1.0]);

  /** form control for scoring filter dropdown */
  selectedTepFormat = new UntypedFormControl([0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5]);

  /** form control for scoring filter dropdown */
  selectedQbFormat = new UntypedFormControl([1, 2]);

  /** form control for scoring filter dropdown */
  selectedStartersFormat = new UntypedFormControl( [6, 7, 8, 9, 10, 11, 12, 13, 14]);

  /** form control for scoring filter dropdown */
  selectedLeagueTypeFormat = new UntypedFormControl('Dynasty');

  /** form control for scoring filter dropdown */
  selectedTeamFormat = new UntypedFormControl([4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]);

  /** Side A players in trade search */
  sideAPlayers: FantasyPlayer[] = [];

  /** Side B players in trade search */
  sideBPlayers: FantasyPlayer[] = [];

  /** trade results */
  tradeSearchResults: TradeDatabaseItem[] = [];

  /** trade database page */
  tradePage: number = 1;

  constructor(private fantasyPlayerApiService: FantasyPlayerApiService) {
  }

  /**
   * Search observable with formatted message from service
   * @param page page number
   * @param pageLength length of a page
   */
  searchTradeDatabase(page: number, pageLength: number): Observable<TradeDatabaseItem[]>  {
    return this.fantasyPlayerApiService.searchTradeDatabase(
      this.sideAPlayers.map(p => p.position == 'PI' ? p.name_id : p.sleeper_id),
      this.sideBPlayers.map(p => p.position == 'PI' ? p.name_id : p.sleeper_id),
      this.selectedQbFormat.value,
      this.selectedStartersFormat.value,
      this.selectedTeamFormat.value,
      this.selectedLeagueTypeFormat.value,
      this.selectedScoringFormat.value,
      this.selectedTepFormat.value,
      page,
      pageLength
      ).pipe(
        catchError((error) => {
          console.error('An error occurred:', error);
          throw error; // Rethrow the error to propagate it to the component
        })
      );
    }

}
