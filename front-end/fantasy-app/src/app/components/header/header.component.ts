import {Component, OnInit} from '@angular/core';
import {SleeperService} from '../../services/sleeper.service';
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


  constructor(public sleeperService: SleeperService,
              public configService: ConfigService,
              private router: Router,
              public leagueSwitchService: LeagueSwitchService) {
    super();
  }

  ngOnInit(): void {
  }

  openLeague(): void {
    window.open('https://sleeper.com/leagues/' + this.sleeperService.selectedLeague.leagueId + '/team', '_blank');
  }
}
