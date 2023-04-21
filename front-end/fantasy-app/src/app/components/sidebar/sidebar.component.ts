import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { LeagueService } from '../../services/league.service';
import { ConfigService } from '../../services/init/config.service';
import { LeagueSwitchService } from '../services/league-switch.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Output()
  toggleMenu: EventEmitter<any> = new EventEmitter<any>();

  constructor(public leagueService: LeagueService,
    public configService: ConfigService,
    public leagueSwitchService: LeagueSwitchService) {
  }

  ngOnInit(): void {}

  toggle() {
    this.toggleMenu.emit();
  }
}
