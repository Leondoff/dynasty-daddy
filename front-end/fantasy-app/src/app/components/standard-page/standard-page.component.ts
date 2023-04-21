import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/init/config.service';
import { LeagueSwitchService } from '../services/league-switch.service';

@Component({
  selector: 'app-standard-page',
  templateUrl: './standard-page.component.html',
  styleUrls: ['./standard-page.component.css']
})
export class StandardPageComponent implements OnInit {

  constructor(public configService: ConfigService,
    public leagueSwitchService: LeagueSwitchService) {
  }

  ngOnInit(): void {
  }

}
