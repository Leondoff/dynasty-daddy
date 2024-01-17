import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LeagueService } from '../../services/league.service';
import { PlayerService } from '../../services/player.service';
import { BaseComponent } from '../base-component.abstract';
import { DraftService } from '../services/draft.service';
import { LeagueSwitchService } from '../services/league-switch.service';
import { delay } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ConfigService } from 'src/app/services/init/config.service';
import { PageService } from 'src/app/services/utilities/page.service';
import { LeagueType } from 'src/app/model/league/LeagueDTO';

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.css']
})
export class DraftComponent extends BaseComponent implements OnInit {

  pageDescription = 'Prepare for your fantasy season with the Dynasty Daddy Mock Draft Tool. Sync with your league and filter out results to gain an edge. Or look at completed drafts to see who came out on top.';

  /** show advanced settings  */
  showAdvancedSettings: boolean = false;

  /** no drafts found error message */
  noDraftsErrMsg = 'Cannot find any drafts. Please select a league.';

  /** error loading draft from league message */
  errorLoadingMsg = 'Error generating draft. Please try reloading league.'

  constructor(public leagueService: LeagueService,
    public playerService: PlayerService,
    public leagueSwitchService: LeagueSwitchService,
    public configService: ConfigService,
    private route: ActivatedRoute,
    private pageService: PageService,
    private cdr: ChangeDetectorRef,
    public mockDraftService: DraftService) {
    super();
    this.pageService.setUpPageSEO('Draft Center',
      ['mock draft tool', 'fantasy football mock draft', 'fantasy draft simulator', 'fantasy football draft kit',
      'fantasy football draft', 'fantasy mock draft simulator', 'fantasy draft', 'draft cheatsheet', 'fantasy cheatsheet'],
      this.pageDescription)
  }

  ngOnInit(): void {
    if (this.playerService.playerValues.length !== 0) {
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
      }),
      this.playerService.currentPlayerValuesLoaded$.pipe(delay(1000)).subscribe(_ => {
        this.initServices();
      })
    );
  }

  /**
   * initializes mock draft service
   * @private
   */
  private initServices(): void {
    this.mockDraftService.clearFilters();
    if (this.leagueService.selectedLeague) {
      this.mockDraftService.mockDraftRounds = this.leagueService.selectedLeague.type === LeagueType.DYNASTY ? 5 : 30;
      this.mockDraftService.mockDraftOrder = this.leagueService.selectedLeague.type === LeagueType.DYNASTY ? 0 : 1;
      this.mockDraftService.mockDraftPlayerType = this.leagueService.selectedLeague.type === LeagueType.DYNASTY ? 0 : 2;
    }
    this.mockDraftService.isSuperflex = this.leagueService.selectedLeague ?
      this.leagueService.selectedLeague?.isSuperflex : this.mockDraftService.isSuperflex;
    this.mockDraftService.selectedDraft = this.leagueService.completedDrafts?.length > 0 ? this.leagueService.completedDrafts[0] : 'upcoming';
    this.mockDraftService.generateDraft();
    if (this.mockDraftService.selectedDraft === 'upcoming')
      this.mockDraftService.createMockDraft();
    this.cdr.detectChanges();
  }

  /**
   * Checks if current season is this year for displaying mock draft
   */
  isCurrentSeason(): boolean {
    return Number(this.leagueService.selectedLeague.season) >= new Date().getFullYear()
  }

}
