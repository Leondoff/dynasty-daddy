import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base-component.abstract';
import { LeagueSwitchService } from '../services/league-switch.service';
import { PlayerService } from '../../services/player.service';
import { TradeFinderService } from '../services/trade-finder.service';
import { LeagueService } from '../../services/league.service';
import { FantasyPlayer } from '../../model/assets/FantasyPlayer';
import { PowerRankingsService } from '../services/power-rankings.service';
import { TradePackage } from '../model/tradePackage';
import { ActivatedRoute } from '@angular/router';
import { ConfigService } from '../../services/init/config.service';
import { LeagueType } from 'src/app/model/league/LeagueDTO';
import { UntypedFormControl } from '@angular/forms';

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
  teamPlayers: FantasyPlayer[] = [];

  /** list of team picks */
  teamPicks: FantasyPlayer[] = [];

  /** is league a superflex league */
  isSuperflex: boolean;

  /** form control for selected teams dropdown */
  includedTeams = new UntypedFormControl();

  /** available teams to filter out */
  availableTeams: any[] = [];

  /** filter trade finder results by position */
  filterPosGroup: boolean[] = [true, true, true, true, true];

  /** Toggle the advanced filters  */
  showAdvancedSettings: boolean = false;

  /** error message to display if league isn't selected */
  errorHeaderMsg = 'Unable to find trades. Please Select League.'

  constructor(
    public leagueSwitchService: LeagueSwitchService,
    public playerService: PlayerService,
    public leagueService: LeagueService,
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
    this.addSubscriptions(this.playerService.currentPlayerValuesLoaded$.subscribe(() => {
      this.setUpTradeFinder();
    }),
      this.leagueSwitchService.leagueChanged$.subscribe(() => {
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
    this.availableTeams = this.setAvailableTeams()
    this.includedTeams.setValue(this.availableTeams);
    this.teamPlayers = this.filterPlayersByTeam();
    this.teamPicks = this.filterPicksByTeam();
    this.isSuperflex = this.leagueService.selectedLeague?.isSuperflex;
    if (this.leagueService.selectedLeague) {
      this.filterPosGroup[4] = this.leagueService.selectedLeague.type !== LeagueType.DYNASTY ? false : true;
    }
  }

  /**
   * handles generating all the trade offers
   */
  generateTradeOffers(): void {
    this.tradeList = [];
    const excludedTeams = this.availableTeams
    .filter(team => !this.includedTeams.value.includes(team))
    .map(team => team.userId)
    const trades = this.tradeFinderService.generateTradeFinderResults(
      this.tradeFinderService.selectedPlayers,
      this.tradeFinderService.selectedTeamUserId,
      this.isSuperflex,
      this.filterPosGroup,
      excludedTeams,
      this.playerService.selectedMarket
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
  filterPlayersByTeam(): FantasyPlayer[] {
    return this.playerService.playerValues.filter(player => {
      return player.owner?.userId === this.tradeFinderService.selectedTeamUserId;
    });
  }

  setAvailableTeams(): any[] {
    const teams = [];
    this.leagueService.leagueTeamDetails.forEach(team => {
      if (team.owner.userId != this.tradeFinderService.selectedTeamUserId) {
        teams.push({ display: team.owner.teamName, userId: team.owner.userId, isDisabled: false })
      }
    });
    return teams;
  }

  /**
   * filters draft capital by selected team
   */
  filterPicksByTeam(): FantasyPlayer[] {
    return this.powerRankingsService.findTeamFromRankingsByUserId(this.tradeFinderService.selectedTeamUserId)?.picks?.players || [];
  }

  /**
   * handles updating the selected market
   * @param $event changed market value
   */
  onMarketChange($event): void {
    this.playerService.selectedMarket = $event;
    this.generateTradeOffers()
  }
}
