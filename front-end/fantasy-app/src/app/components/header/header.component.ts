import {Component, OnInit} from '@angular/core';
import {LeagueService} from '../../services/league.service';
import {BaseComponent} from '../base-component.abstract';
import {ConfigService} from '../../services/init/config.service';
import {LeagueSwitchService} from '../services/league-switch.service';
import { LeagueDTO } from 'src/app/model/league/LeagueDTO';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent extends BaseComponent implements OnInit {

  hasClosedHeader: boolean = false;

  constructor(public leagueService: LeagueService,
              public configService: ConfigService,
              public leagueSwitchService: LeagueSwitchService) {
    super();
  }

  ngOnInit(): void {
  }

  loadLeagueFromHeader(league: LeagueDTO): void {
    this.leagueSwitchService.loadLeagueWithLeagueId(league.leagueId, league.season || this.leagueService.selectedYear, league.leaguePlatform);
  }
  
}
