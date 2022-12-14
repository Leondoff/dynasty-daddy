import {Component, OnInit} from '@angular/core';
import {LeagueService} from '../../services/league.service';
import {PowerRankingsService} from '../services/power-rankings.service';
import {PlayerService} from '../../services/player.service';
import {BaseComponent} from '../base-component.abstract';
import {LeagueSwitchService} from '../services/league-switch.service';
import {delay} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-power-rankings',
  templateUrl: './power-rankings.component.html',
  styleUrls: ['./power-rankings.component.css']
})
export class PowerRankingsComponent extends BaseComponent implements OnInit {

  /** Error generating power rankings message */
  creatingPRErrMsg = 'Error creating Power Rankings. Try again.'

  /** No league selected error message */
  noLeagueErrMsg = 'Unable to create rankings. Please select a league.'

  constructor(public leagueService: LeagueService,
              public powerRankingService: PowerRankingsService,
              private playersService: PlayerService,
              private route: ActivatedRoute,
              public leagueSwitchService: LeagueSwitchService) {

    super();
  }

  ngOnInit(): void {
    this.playersService.loadPlayerValuesForToday();
    this.mapPowerRankings();
    // TODO potentially improve how this functions
    this.addSubscriptions(this.leagueSwitchService.leagueChanged$.pipe(delay(1500)).subscribe(() => {
          this.mapPowerRankings();
        }
      ),
      this.route.queryParams.subscribe(params => {
        this.leagueSwitchService.loadFromQueryParams(params);
      }));
  }

  mapPowerRankings(): void {
    // TODO ugly fix for race condition on adding upcoming draft picks to playoff calculator
    if (this.leagueService.upcomingDrafts.length !== 0) {
      this.powerRankingService.reset();
      this.powerRankingService.mapPowerRankings(
        this.leagueService.leagueTeamDetails,
        this.playersService.playerValues,
        this.leagueService.selectedLeague.leaguePlatform
      );
    }
  }
}
