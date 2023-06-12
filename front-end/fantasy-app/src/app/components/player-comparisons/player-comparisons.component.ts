import {AfterViewInit, Component} from '@angular/core';
import {PlayerService} from '../../services/player.service';
import {BaseComponent} from '../base-component.abstract';
import {MatDialog} from '@angular/material/dialog';
import {AddPlayerComparisonModalComponent} from '../modals/add-player-comparison-modal/add-player-comparison-modal.component';
import {PlayerComparisonService} from '../services/player-comparison.service';
import {LeagueService} from '../../services/league.service';
import {moveItemInArray} from '@angular/cdk/drag-drop';
import {ConfigService} from '../../services/init/config.service';
import {FantasyPlayer} from '../../model/assets/FantasyPlayer';
import {ActivatedRoute} from '@angular/router';
import {LeagueSwitchService} from '../services/league-switch.service';

@Component({
  selector: 'app-player-comparisons',
  templateUrl: './player-comparisons.component.html',
  styleUrls: ['./player-comparisons.component.css']
})
export class PlayerComparisonsComponent extends BaseComponent implements AfterViewInit {

  constructor(public playerService: PlayerService,
              public leagueService: LeagueService,
              private dialog: MatDialog,
              public playerComparisonService: PlayerComparisonService,
              private route: ActivatedRoute,
              public leagueSwitchService: LeagueSwitchService,
              public configService: ConfigService) {
    super();
  }

  /**
   * active players filtered from players service
   */
  activePlayers: FantasyPlayer[] = [];

  ngAfterViewInit(): void {
    if (this.leagueService.isLeagueLoaded()) {
      this.playerComparisonService.isSuperFlex = this.leagueService.selectedLeague?.isSuperflex;
    }
    if (this.playerService.playerValues.length === 0) { this.playerService.loadPlayerValuesForToday(); }

    this.filterActivePlayers();
    this.addSubscriptions(this.playerService.currentPlayerValuesLoaded$.subscribe(() => {
      this.filterActivePlayers();
      if (this.playerComparisonService.lineChartData
        && this.playerComparisonService.selectedPlayers[0] === undefined) {
        this.resetPlayerCompPlayers();
      }
    }),
      this.route.queryParams.subscribe(params => {
        this.leagueSwitchService.loadFromQueryParams(params);
      })
    );
    if (this.playerComparisonService.selectedPlayers.length === 0
      && this.playerComparisonService.selectedPlayers[0] === undefined) {
      this.resetPlayerCompPlayers();
    }
  }

  /**
   * filter player list to use active only players
   * @private
   */
  private filterActivePlayers(): void {
    this.activePlayers = this.playerService.playerValues.filter(player => {
      const yesterdayDate = new Date().getTime() - 1000 * 60 * 60 * 24;
      const isCurrent = new Date(player.most_recent_data_point).setHours(0, 0, 0, 0) >= new Date(yesterdayDate).setHours(0, 0, 0, 0);
      if (isCurrent) {
        return player;
      }
    });
  }

  /**
   * selects random player to add to list
   * @param stars if true choose top 50 valuable player
   * @private
   * returns player number
   */
  private getRandomPlayer(stars: boolean = false): number {
    return Math.floor(Math.random() * (stars ? 50 : this.activePlayers.length - 1)) + 1;
  }

  /**
   * launches add new player modal
   * @param isGroup2 is group mode enabled
   */
  addNewPlayerModal(isGroup2: boolean = false): void {
    this.dialog.open(AddPlayerComparisonModalComponent, {
      height: '700px',
      width: '800px',
      data: {
        isGroup2,
        selectedMarket: this.playerService.selectedMarket
      }
    });
  }

  /**
   * reorder players from drag and drop
   * @param event
   */
  drop(event: any): void {
    if (event.previousIndex !== event.currentIndex && !this.playerComparisonService.isGroupMode) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.playerComparisonService.refreshTable(this.playerService.selectedMarket);
    }
  }

  /**
   * resets data in play comp table
   */
  resetPlayerComp(): void {
    this.playerComparisonService.selectedPlayers = [];
    this.playerComparisonService.group2SelectedPlayers = [];
    this.playerComparisonService.refreshTable(this.playerService.selectedMarket);
  }

  /**
   * helper function to reset players in player comparison table
   * @private
   */
  private resetPlayerCompPlayers(): void {
    if (this.activePlayers.length > 0) {
      const playerNum = this.getRandomPlayer(true);
      this.playerComparisonService.addPlayerToCharts(this.activePlayers[playerNum], false, this.playerService.selectedMarket);
      this.playerComparisonService.addPlayerToCharts(this.activePlayers[playerNum + 1], false, this.playerService.selectedMarket);
    }
  }

  onMarketChange($event): void {
    this.playerService.selectedMarket = $event;
  }
}
