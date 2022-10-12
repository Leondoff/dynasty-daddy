import {Component, OnInit} from '@angular/core';
import {PlayerService} from '../../services/player.service';
import {BaseComponent} from '../base-component.abstract';
import {ConfigService} from '../../services/init/config.service';
import {ActivatedRoute} from '@angular/router';
import {LeagueSwitchService} from '../services/league-switch.service';
import {LeagueService} from '../../services/league.service';

@Component({
  selector: 'app-player-values',
  templateUrl: './player-values.component.html',
  styleUrls: ['./player-values.component.css']
})
export class PlayerValuesComponent extends BaseComponent implements OnInit {

  /** are players loaded */
  playersLoaded: boolean;

  constructor(public playerService: PlayerService,
              public configService: ConfigService,
              public leagueService: LeagueService,
              public leagueSwitchService: LeagueSwitchService,
              private route: ActivatedRoute) {
    super();
  }

  ngOnInit(): void {
    this.playersLoaded = (this.playerService.playerValues.length > 0);
    if (!this.playersLoaded) {
      this.playerService.loadPlayerValuesForToday();
    }
    this.addSubscriptions(this.playerService.$currentPlayerValuesLoaded.subscribe(() => {
        this.playersLoaded = true;
      }),
      this.route.queryParams.subscribe(params => {
        this.leagueSwitchService.loadFromQueryParams(params);
      })
    );
  }

}
