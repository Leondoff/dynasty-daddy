import {Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { delay } from 'rxjs/operators';
import { LeagueService } from 'src/app/services/league.service';
import { PlayerService } from 'src/app/services/player.service';
import { BaseComponent } from '../base-component.abstract';
import { LeagueSwitchService } from '../services/league-switch.service';
import { WrappedService } from '../services/wrapped.service';

@Component({
    selector: 'app-wrapped',
    templateUrl: './wrapped.component.html',
    styleUrls: ['./wrapped.component.css']
})
  export class WrappedComponent extends BaseComponent implements OnInit {

    enabled: boolean = false;

    /** no league selected error message */
    noLeagueErrMsg = 'Cannot load Dynasty Daddy Wrapped. Please select league.';

    /** a league that hasn't been started error message */
    leagueNotStartedErrMsg = 'League has not started yet so could not generate Wrapped. Please load previous league to view Wrapped.';

    constructor(public wrappedService: WrappedService,
       public leagueService: LeagueService,
       private playersService: PlayerService,
       private leagueSwitchService: LeagueSwitchService,
       private route: ActivatedRoute) {
        super();
    }
    
    ngOnInit(): void {
      this.wrappedService.frameNumber = 0;
      this.playersService.loadPlayerValuesForToday();
      // TODO potentially improve how this functions
      this.addSubscriptions(this.leagueSwitchService.leagueChanged$.pipe(delay(1500)).subscribe(() => {
            this.enabled = true;
          }
        ),
        this.route.queryParams.subscribe(params => {
          this.leagueSwitchService.loadFromQueryParams(params);
        }));
    }

}
