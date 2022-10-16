import {Component, OnInit} from '@angular/core';
import {LeagueService} from '../../services/league.service';
import {PlayerService} from '../../services/player.service';
import {BaseComponent} from '../base-component.abstract';
import {MockDraftService} from '../services/mock-draft.service';
import {LeagueSwitchService} from '../services/league-switch.service';
import {delay} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.css']
})
export class DraftComponent extends BaseComponent implements OnInit {

  /** rerender table when refreshed */
  resetTrigger: boolean = true;

  constructor(public leagueService: LeagueService,
              private playersService: PlayerService,
              public leagueSwitchService: LeagueSwitchService,
              private route: ActivatedRoute,
              public mockDraftService: MockDraftService) {
    super();
  }

  ngOnInit(): void {
    if (this.leagueService.selectedLeague && this.playersService.playerValues.length !== 0) {
      this.initServices();
    } else {
      this.playersService.loadPlayerValuesForToday();
    }
    this.addSubscriptions(
      this.leagueSwitchService.leagueChanged$.pipe(delay(1000)).subscribe(() => {
          this.initServices();
        }
      ),
      this.route.queryParams.subscribe(params => {
        this.leagueSwitchService.loadFromQueryParams(params);
      })
    );
  }

  /**
   * initializes mock draft service
   * @private
   */
  private initServices(): void {
    this.mockDraftService.generateDraft(
      this.playersService.playerValues,
      this.leagueService.selectedLeague.isSuperflex,
      this.leagueService.upcomingDrafts[0]?.playerType
    );
    this.mockDraftService.mapDraftObjects(this.leagueService.leagueTeamDetails);
    if (this.mockDraftService.teamPicks.length > 0) {
      this.mockDraftService.selectedDraft = 'upcoming';
    } else {
      this.mockDraftService.selectedDraft = this.leagueService.completedDrafts[0] || null;
    }
  }

  /**
   * wraps mock draft service call to reset
   */
  resetMockDraft(): void {
    this.mockDraftService.resetDraftList();
    this.resetTrigger = !this.resetTrigger;
  }

}
