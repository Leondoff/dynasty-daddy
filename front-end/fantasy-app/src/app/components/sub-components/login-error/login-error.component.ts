import { Component, OnInit, Input } from '@angular/core';
import { LeagueService } from 'src/app/services/league.service';
import { LeagueSwitchService } from '../../services/league-switch.service';

@Component({
  selector: 'app-login-error',
  templateUrl: './login-error.component.html',
  styleUrls: ['./login-error.component.css']
})
export class LoginErrorComponenet implements OnInit {

  @Input()
  errorHeader = 'Please select a league.';

  constructor(public leagueService: LeagueService, public leagueSwitchService: LeagueSwitchService) {

  }

  ngOnInit() {

  }
}