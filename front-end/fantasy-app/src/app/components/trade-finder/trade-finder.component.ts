import {Component, OnInit} from '@angular/core';
import {BaseComponent} from '../base-component.abstract';
import {LeagueSwitchService} from '../services/league-switch.service';
import {PlayerService} from '../../services/player.service';
import {TradeFinderService} from '../services/trade-finder.service';
import {SleeperService} from '../../services/sleeper.service';
import {KTCPlayer} from '../../model/KTCPlayer';
import {PowerRankingsService} from '../services/power-rankings.service';
import {TradePackage} from '../model/tradePackage';
import {ActivatedRoute} from '@angular/router';
import {ConfigService} from '../../services/init/config.service';

@Component({
  selector: 'app-trade-finder',
  templateUrl: './trade-finder.component.html',
  styleUrls: ['./trade-finder.component.css']
})
export class TradeFinderComponent extends BaseComponent implements OnInit {

  /**
   * list of currently generated trade packages
   */
  tradeList: TradePackage[] = [];

  /** list of team players */
  teamPlayers: KTCPlayer[] = [];

  /** list of team picks */
  teamPicks: KTCPlayer[] = [];

  /** is league a superflex league */
  isSuperflex: boolean;

  /** filter trade finder results by position */
  filterPosGroup: boolean[] = [true, true, true, true, true];

  /** Toggle the advanced filters  */
  showAdvancedSettings: boolean = false;

  constructor(
    public leagueSwitchService: LeagueSwitchService,
    public playerService: PlayerService,
    public sleeperService: SleeperService,
    private powerRankingsService: PowerRankingsService,
    private route: ActivatedRoute,
    public tradeFinderService: TradeFinderService,
    public configService: ConfigService
  ) {
    super();
  }

  ngOnInit(): void {
    if (this.playerService.playerValues.length === 0) {
      this.playerService.loadPlayerValuesForToday();
    } else {
      this.setUpTradeFinder();
    }
    this.addSubscriptions(this.playerService.$currentPlayerValuesLoaded.subscribe(() => {
        this.setUpTradeFinder();
      }),
      this.leagueSwitchService.leagueChanged.subscribe(() => {
        this.setUpTradeFinder();
      }),
      this.route.queryParams.subscribe(params => {
        this.leagueSwitchService.loadFromQueryParams(params);
      })
    );
  }

  /**
   * reset the trade finder component values
   */
  setUpTradeFinder(): void {
    this.tradeFinderService.selectedPlayers = [];
    this.tradeList = [];
    this.teamPlayers = this.filterPlayersByTeam();
    this.teamPicks = this.filterPicksByTeam();
    this.isSuperflex = this.sleeperService.selectedLeague?.isSuperflex;
  }

  /**
   * handles generating all the trade offers
   */
  generateTradeOffers(): void {
    this.tradeList = [];
    const trades = this.tradeFinderService.generateTradeFinderResults(
      this.tradeFinderService.selectedPlayers,
      this.tradeFinderService.selectedTeamUserId,
      this.isSuperflex,
      this.filterPosGroup
    );
    // filters trades with no players or duplicate trades out
    // TODO do we want to couple this logic in the trade finder service?
    this.tradeList = trades.filter(trade => trade.team2Assets.length > 0)
      .filter((value, index, self) =>
          index === self.findIndex((t) => (
            JSON.stringify(t.team2Assets) === JSON.stringify(value.team2Assets)
          ))
      );
  }

  /**
   * filter players by selected team
   */
  filterPlayersByTeam(): KTCPlayer[] {
    return this.playerService.playerValues.filter(player => {
      return player.owner?.userId === this.tradeFinderService.selectedTeamUserId;
    });
  }

  /**
   * filters draft capital by selected team
   */
  filterPicksByTeam(): KTCPlayer[] {
    return this.powerRankingsService.findTeamFromRankingsByUserId(this.tradeFinderService.selectedTeamUserId)?.picks?.players || [];
  }
}
