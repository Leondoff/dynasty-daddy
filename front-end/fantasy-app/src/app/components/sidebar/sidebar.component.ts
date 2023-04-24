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

  constructor(public leagueService: LeagueService,
    public playerService: PlayerService,
    public configService: ConfigService,
    public leagueSwitchService: LeagueSwitchService) {
    super();
  }

  ngOnInit(): void {
    this.addSubscriptions(this.playerService.playerValuesUpdated$.subscribe(() => {
      this.formatTrendingPlayers();
    }),
      this.playerService.currentPlayerValuesLoaded$.subscribe(() => {
        this.formatTrendingPlayers();
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
  private formatTrendingPlayers(): void {
    this.isSuperflex = this.leagueService?.selectedLeague?.isSuperflex || true;
    const trendingPlayers = this.playerService.playerValues.slice()
      .filter(p => (this.isSuperflex ? p.sf_trade_value > 1000 : p.trade_value > 1000) &&
        p.position != 'PI');
    this.fallingPlayers = trendingPlayers.sort((a, b) =>
      this.isSuperflex ? a.sf_change - b.sf_change : a.standard_change - b.standard_change).slice(0, 5);
    this.risingPlayers = trendingPlayers.sort((a, b) =>
      this.isSuperflex ? b.sf_change - a.sf_change : b.standard_change - a.standard_change).slice(0, 5);
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
  }

  /**
   * Open roster review form
   */
  goToRosterReview(): void {
    window.open("https://forms.gle/7Uud44CMJbccrjAw7", "_blank");
  }
}
