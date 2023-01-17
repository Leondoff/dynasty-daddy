import {Component, OnInit} from '@angular/core';
import {LeagueService} from '../../services/league.service';
import {PlayerService} from '../../services/player.service';
import {BaseComponent} from '../base-component.abstract';
import {DraftService} from '../services/draft.service';
import {LeagueSwitchService} from '../services/league-switch.service';
import {delay} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';
import { ConfigService } from 'src/app/services/init/config.service';

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.css']
})
export class DraftComponent extends BaseComponent implements OnInit {

  /** rerender table when refreshed */
  resetTrigger: boolean = true;

  /** no drafts found error message */
  noDraftsErrMsg = 'Cannot find any drafts. Please select a league.';

  /** error loading draft from league message */
  errorLoadingMsg = 'Error generating draft. Please try reloading league.'

  constructor(public leagueService: LeagueService,
              public playerService: PlayerService,
              public leagueSwitchService: LeagueSwitchService,
              public configService: ConfigService,
              private route: ActivatedRoute,
              public mockDraftService: DraftService) {
    super();
  }

  ngOnInit(): void {
    if (this.leagueService.selectedLeague && this.playerService.playerValues.length !== 0) {
      this.initServices();
    } else {
      this.playerService.loadPlayerValuesForToday();
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
      this.playerService.playerValues,
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
