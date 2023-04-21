import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LeagueService } from '../../services/league.service';
import { BaseComponent } from '../base-component.abstract';
import { ConfigService } from '../../services/init/config.service';
import { LeagueSwitchService } from '../services/league-switch.service';
import { LeaguePlatform } from 'src/app/model/league/FantasyPlatformDTO';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends BaseComponent implements OnInit {

  @Output()
  toggleMenu: EventEmitter<any> = new EventEmitter<any>();

  hasClosedHeader: boolean = false;

  leagueId: string = null;

  constructor(public leagueService: LeagueService,
    public configService: ConfigService,
    public leagueSwitchService: LeagueSwitchService) {
    super();
  }

  ngOnInit(): void {
    this.addSubscriptions(this.leagueSwitchService.leagueChanged$.subscribe(league => {
      this.leagueId = league.leagueId;
    }));
  }

  loadLeagueFromHeader(leagueId: string): void {
    const league = this.leagueService.leagueUser.leagues.find(l => l.leagueId == leagueId);
    if (league.leaguePlatform === LeaguePlatform.SLEEPER) {
      this.leagueSwitchService.loadLeague(league);
    } else {
      this.leagueSwitchService.loadLeagueWithLeagueId(league.leagueId, league.season || this.leagueService.selectedYear, league.leaguePlatform);
    }
  }

  toggle() {
      this.toggleMenu.emit();
  }
}
