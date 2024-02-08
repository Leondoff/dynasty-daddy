import { Component, EventEmitter, OnInit } from "@angular/core";
import { BaseComponent } from "../../base-component.abstract";
import { DraftService } from "../../services/draft.service";
import { LeagueService } from "src/app/services/league.service";
import { PlayerService } from "src/app/services/player.service";
import { DownloadService } from "src/app/services/utilities/download.service";
import { FantasyPlayer } from "src/app/model/assets/FantasyPlayer";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { LabelType, Options } from "@angular-slider/ngx-slider";
import { MatDialog } from "@angular/material/dialog";
import { ConfigService } from "src/app/services/init/config.service";
import { EditMockDraftModalComponent } from "../../modals/edit-mock-draft-modal/edit-mock-draft-modal.component";
import { LeagueTeam } from "src/app/model/league/LeagueTeam";
import { LeagueSwitchService } from "../../services/league-switch.service";
import { LeagueType } from "src/app/model/league/LeagueDTO";

@Component({
  selector: 'app-draft-toolbar',
  templateUrl: './draft-toolbar.component.html',
  styleUrls: ['./draft-toolbar.component.scss'],
})
export class DraftToolbarComponent extends BaseComponent implements OnInit {

  /** toggle toolbar */
  toggleTools: boolean = true;

  /** toggle search subject for debounce */
  searchSubject$: Subject<void> = new Subject<void>();

  /** selectable teams */
  selectableTeams: LeagueTeam[] = [];

  /** on clock team roster ids to name dict */
  onClockTeams: {} = {};

  /** draftboard players available */
  draftboardPlayers: FantasyPlayer[] = [];

  /** mock draft asset filters */
  mockDraftFilters: {} = {
    'QB': true,
    'RB': true,
    'WR': true,
    'TE': true,
    'DP': true,
    'Other': true,
  };

  /** draftboard page loaded */
  draftboardPage: number = 1;

  /** draftboard search val */
  draftboardSearchVal: string = '';

  /** scoring format options for trade db */
  public scoringFormat: number[] = [0, 0.5, 1.0, 2.0];

  /** tep format options for trade db */
  public tepFormat: number[] = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5];

  /** team format options for trade db */
  public teamFormat: number[] = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

  /** starter format options for trade db */
  public starterFormat: number[] = [6, 7, 8, 9, 10, 11, 12, 13, 14];

  /** league type format options for trade db */
  public leagueType: string[] = ['Dynasty', 'Redraft'];

  manualRefresh: EventEmitter<void> = new EventEmitter<void>();
  ageOptions: Options = {
    floor: 21,
    ceil: 40,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return "<b>Age:</b> " + value;
        case LabelType.High:
          return "<b>Age:</b> " + value;
        default:
          return "" + value;
      }
    }
  };

  expOptions: Options = {
    floor: 0,
    ceil: 23,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return "<b>Exp:</b> " + value;
        case LabelType.High:
          return "<b>Exp:</b> " + value;
        default:
          return "" + value;
      }
    }
  };

  constructor(
    public draftService: DraftService,
    private leagueService: LeagueService,
    private playerService: PlayerService,
    private downloadService: DownloadService,
    private dialog: MatDialog,
    public configService: ConfigService,
    private leagueSwitchService: LeagueSwitchService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.setUpSelectableTeams();
    this.addSubscriptions(
      this.searchSubject$.pipe(
        debounceTime(500)
      ).subscribe(_ => {
        this.draftService.updateDraft$.next();
      }),
      this.leagueSwitchService.leagueChanged$.subscribe(_ => {
        this.setUpSelectableTeams();
      }), this.draftService.liveDraftStatus$
        .subscribe(status => {
          if (status != 'end') {
            this.draftboardPlayers = this.draftService.mockPlayers;
            this.filterDraftboard();
          }
        })
    );
  }

  setUpSelectableTeams(): void {
    this.selectableTeams = this.leagueService.selectedLeague ?
      this.leagueService.leagueTeamDetails :
      Array.from({ length: this.draftService.mockTeamCount }, (_, index) => new LeagueTeam(null, null).createMockTeam(index + 1));
    this.draftService.overrideRosterId = this.selectableTeams[0].roster.rosterId || 1;
    this.selectableTeams.forEach(t => {
      this.onClockTeams[t.roster.rosterId] = t.owner.ownerName;
    });
  }

  filterChanged = (refresh: boolean = false) =>
    this.draftService.updateDraft$.next(refresh ? 'refresh' : '');

  clearTextSearch = () =>
    this.draftService.searchVal = '';

  handleToggleToolbar = () =>
    this.configService.isMobile ? this.configService.toggleToolbar$.next() : this.toggleTools = !this.toggleTools;

  openMockDraftModal(isLive: boolean = false): void {
    this.dialog.open(EditMockDraftModalComponent
      , {
        minHeight: '200px',
        minWidth: this.configService.isMobile ? '300px' : '500px',
        autoFocus: true,
        data: {
          isLive
        }
      }
    );
  }

  /**
   * Refresh mock draft player set
   */
  changeDraftPlayers(): void {
    this.draftService.generateDraft();
  }

  /**
   * select market handle
   * @param market new market
   */
  onMarketChange(market: any): void {
    this.draftService.fantasyMarket = market;
    if (market.valueOf() < 100) {
      this.playerService.selectedMarket = market;
      if (this.draftService.selectedDraft === 'upcoming') {
        this.changeDraftPlayers();
      }
    } else {
      this.draftService.refreshADP();
    }
  }

  /**
   * use my league setting for draft adp
   */
  useMyLeague(): void {
    this.draftService.adpLeagueTypeFormat =
      this.leagueService.selectedLeague.type === LeagueType.DYNASTY ? 'Dynasty' : 'Redraft';
    this.draftService.isSuperflex = this.leagueService.selectedLeague.isSuperflex ? true : false;
    this.draftService.adpScoringFormat
      .setValue([this.leagueService.selectedLeague.scoringSettings.rec || 1]);
    this.draftService.adpStartersFormat
      .setValue([this.leagueService.selectedLeague.starters || 9]);
    this.draftService.adpTeamFormat
      .setValue([this.leagueService.selectedLeague.totalRosters || 12]);
    this.draftService.adpTepFormat
      .setValue([this.leagueService.selectedLeague.scoringSettings.bonusRecTE || 0]);
  }


  /**
   * toggles trade pick mode for mock draft
   */
  toggleTradePickMode(): void {
    this.draftService.isOrderMode = !this.draftService.isOrderMode
    if (this.draftService.isOrderMode && this.draftService.mockPlayers.length > 0)
      this.draftService.pauseEvent();
    else if (!this.draftService.isOrderMode && this.draftService.mockPlayers.length > 0)
      this.draftService.resumeEvent();
    this.draftService.updateDraft$.next();
  }

  /**
   * clear text search draftboard
   */
  clearTextSearchDraftboard(): void {
    this.draftboardSearchVal = '';
    this.filterDraftboard();
  }

  /**
   * filter draftboard results
   */
  filterDraftboard = () =>
    this.draftboardPlayers = this.draftService.mockPlayers.filter(p =>
      this.mockDraftFilters[p?.position] ||
      !['QB', 'RB', 'WR', 'TE'].includes(p?.position) && this.mockDraftFilters[5]
    ).filter(p => p.full_name.toLowerCase().indexOf(this.draftboardSearchVal.toLowerCase()) >= 0);

  /**
   * toggle pause draft
   */
  togglePause = () => this.draftService.isPaused ? this.draftService.resumeEvent() : this.draftService.pauseEvent();

  /**
   * Exports mock draft data to CSV file
   */
  exportMockDraft(): void {
    const draftData: any[][] = []
    const name = this.leagueService?.selectedLeague?.name || 'Dynasty Daddy';
    draftData.push([`Mock Draft ${this.leagueService?.selectedLeague ? 'for ' + this.leagueService?.selectedLeague?.name : ''} - ${this.draftService.mockDraftRounds} Rounds - ${this.draftService.isSuperflex ? 'Superflex' : 'Standard (1 QB)'}`]);
    draftData.push([]);
    draftData.push([
      ['Pick', 'Team', 'Owner', 'Notes', 'Player', 'Position', 'Age', 'Trade Value'],
    ]);
    const playerList = this.draftService.selectedDraft == 'upcoming' ?
      this.draftService.getDraftOrder() :
      this.draftService.teamPicks.map(p =>
        this.playerService.getPlayerByPlayerPlatformId(
          p.playerId,
          this.leagueService.selectedLeague.leaguePlatform
        ) || null);
    this.draftService.teamPicks.forEach((pick, ind) => {
      const player = playerList[ind];
      const row = [pick.pickdisplay, pick.pickTeam, pick.pickOwner,
      pick.originalRosterId !== pick.rosterId ? `Traded from ${this.leagueService.getTeamByRosterId(pick.originalRosterId)?.owner?.teamName || 'Team ' + pick.rosterId}` : ""];
      let playerRow = [];
      if (player) {
        playerRow = [player?.full_name, player?.position, player?.age,
        this.draftService.isSuperflex ? player?.sf_trade_value : player?.trade_value
        ];
      }
      draftData.push(row.concat(playerRow));
    });

    const formattedDraftData = draftData.map(e => e.join(',')).join('\n');

    const filename = `${name.replace(/ /g, '_')}_Mock_Draft_${this.draftService.mockDraftRounds}_Rounds_${new Date().toISOString().slice(0, 10)}.csv`;

    this.downloadService.downloadCSVFile(formattedDraftData, filename);
  }

  /**
   * helper to reload adp for draft
   */
  reloadADP(): void {
    this.draftService.refreshADP();
    if (this.configService.isMobile)
      this.configService.toggleToolbar$.next(false);
  }
}