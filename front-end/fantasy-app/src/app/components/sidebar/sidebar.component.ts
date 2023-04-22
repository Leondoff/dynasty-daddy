import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LeagueService } from '../../services/league.service';
import { ConfigService } from '../../services/init/config.service';
import { LeagueSwitchService } from '../services/league-switch.service';
import { PlayerService } from 'src/app/services/player.service';
import { BaseComponent } from '../base-component.abstract';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent extends BaseComponent implements OnInit {

  @Output()
  toggleMenu: EventEmitter<any> = new EventEmitter<any>();

  risingPlayers: FantasyPlayer[] = [];

  fallingPlayers: FantasyPlayer[] = [];

  isSuperflex: boolean = true;

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
      })
    );
  }

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

  toggle() {
    this.toggleMenu.emit();
  }
}
