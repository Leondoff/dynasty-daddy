import {Component, OnInit} from '@angular/core';
import {LeagueService} from '../../services/league.service';
import {BaseComponent} from '../base-component.abstract';
import {ConfigService} from '../../services/init/config.service';
import {LeagueSwitchService} from '../services/league-switch.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent extends BaseComponent implements OnInit {


  constructor(public leagueService: LeagueService,
              public configService: ConfigService,
              private router: Router,
              public leagueSwitchService: LeagueSwitchService) {
    super();
  }

  ngOnInit(): void {
  }

  openLeague(): void {
    window.open('https://sleeper.com/leagues/' + this.leagueService.selectedLeague.leagueId + '/team', '_blank');
  }
}
