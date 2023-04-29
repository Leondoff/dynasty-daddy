import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LeagueService } from '../../services/league.service';
import { ConfigService } from '../../services/init/config.service';
import { LeagueSwitchService } from '../services/league-switch.service';
import { PlayerService } from 'src/app/services/player.service';
import { BaseComponent } from '../base-component.abstract';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { LeagueTeam } from 'src/app/model/league/LeagueTeam';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent extends BaseComponent implements OnInit {

  @Output()
  toggleMenu: EventEmitter<any> = new EventEmitter<any>();

  /** rising players array for trending player */
  risingPlayers: FantasyPlayer[] = [];

  /** falling players array for trending player */
  fallingPlayers: FantasyPlayer[] = [];

  /** player values to display */
  isSuperflex: boolean = true;

  /** sidebar search value */
  searchVal: string = '';

  /** filtered players for sidebar */
  filteredPlayers: FantasyPlayer[] = [];

  /** filtered teams for sidebar */
  filteredTeams: LeagueTeam[] = [];

  /** roster review link */
  ROSTER_REVIEW_LINK: string = 'https://forms.gle/7Uud44CMJbccrjAw7';

  /** preferred creators that show up in the side bar */
  filteredCreators: any[] = [];

  /** is the trending tab by number */
  isTrendingByNumber: boolean = true;

  constructor(public leagueService: LeagueService,
    public playerService: PlayerService,
    public configService: ConfigService,
    public leagueSwitchService: LeagueSwitchService) {
    super();
  }

  ngOnInit(): void {
    this.addSubscriptions(this.playerService.playerValuesUpdated$.subscribe(() => {
      this.formatTrendingPlayers(this.isTrendingByNumber);
    }),
      this.playerService.currentPlayerValuesLoaded$.subscribe(() => {
        this.formatTrendingPlayers(this.isTrendingByNumber);
        this.filterSidebarResults();
      }),
      this.leagueSwitchService.leagueChanged$.subscribe(() => {
        this.filterSidebarResults();
      })
    );
  }

  /**
   * calculate trending players for sidebar
   */
  private formatTrendingPlayers(isByNumber: boolean = true): void {
    this.isTrendingByNumber = isByNumber;
    this.isSuperflex = this.leagueService?.selectedLeague?.isSuperflex || true;
    const trendingPlayers = this.playerService.playerValues.slice()
      .filter(p => (this.isSuperflex ? p.sf_trade_value > 1000 : p.trade_value > 1000) &&
        p.position != 'PI');
    // set trending based on order by players
    if (!this.isTrendingByNumber) {
      this.fallingPlayers = trendingPlayers.sort((a, b) =>
        this.isSuperflex ? a.sf_change - b.sf_change : a.standard_change - b.standard_change).slice(0, 5);
      this.risingPlayers = trendingPlayers.sort((a, b) =>
        this.isSuperflex ? b.sf_change - a.sf_change : b.standard_change - a.standard_change).slice(0, 5);
    } else {
      this.fallingPlayers = trendingPlayers.sort((a, b) =>
        this.isSuperflex ? (a.sf_trade_value - a.last_month_value_sf) - (b.sf_trade_value - b.last_month_value_sf) :
          (a.trade_value - a.last_month_value) - (b.trade_value - b.last_month_value)).slice(0, 5);
      this.risingPlayers = trendingPlayers.sort((a, b) =>
        this.isSuperflex ? (b.sf_trade_value - b.last_month_value_sf) - (a.sf_trade_value - a.last_month_value_sf) :
          (b.trade_value - b.last_month_value) - (a.trade_value - a.last_month_value)).slice(0, 5);
    }
  }

  /**
   * Returns trending value to display
   * @param player player to get value for
   * @returns 
   */
  getTrendingValue(player: FantasyPlayer): string {
    if (this.isSuperflex) {
      return this.isTrendingByNumber ? (player.sf_trade_value - player.last_month_value_sf).toString() : `${player.sf_change}%`
    } else {
      return this.isTrendingByNumber ? (player.trade_value - player.last_month_value).toString() : `${player.standard_change}%`
    }
  }

  /**
   * toggle sidebar menu
   */
  toggle() {
    this.toggleMenu.emit();
  }

  /**
   * filter Sidebar results
   */
  filterSearch(): void {
    this.filterSidebarResults();
  }

  /**
   * reset search value to empty string
   */
  resetSearchValue(): void {
    this.searchVal = '';
    this.filterSidebarResults();
  }

  /**
   * Returns true if term contains search value
   * @param title string to filter on
   */
  isInSearch(title: string): boolean {
    return title?.toLowerCase().includes(this.searchVal?.toLowerCase());
  }

  /**
   * Update the sidebar filters for players and teams
   */
  private filterSidebarResults(): void {
    this.filteredPlayers = this.playerService.playerValues
      .filter(p => this.isInSearch(p.full_name) ||
        this.isInSearch(p.position) ||
        this.isInSearch(p.owner?.ownerName) ||
        this.isInSearch(p.owner?.teamName)).slice(0, 10);
    this.filteredTeams = this.searchVal == '' ?
      this.leagueService.leagueTeamDetails.slice() :
      this.leagueService.leagueTeamDetails.filter(t => this.isInSearch(t.owner?.ownerName) || this.isInSearch(t.owner?.teamName));
    this.filteredCreators = this.configService.preferredCreators.slice(0, this.configService.preferredCreators.length - 1).filter(c => this.isInSearch(c.alt))
  }

  /**
   * Open roster review form
   */
  openUrl(url: string = this.ROSTER_REVIEW_LINK): void {
    window.open(url, "_blank");
  }
}
