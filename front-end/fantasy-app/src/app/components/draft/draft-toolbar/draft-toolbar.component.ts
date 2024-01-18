import { Component, EventEmitter, OnInit } from "@angular/core";
import { BaseComponent } from "../../base-component.abstract";
import { DraftService } from "../../services/draft.service";
import { LeagueService } from "src/app/services/league.service";
import { PlayerService } from "src/app/services/player.service";
import { DownloadService } from "src/app/services/utilities/download.service";
import { FantasyMarket } from "src/app/model/assets/FantasyPlayer";
import { PowerRankingsService } from "../../services/power-rankings.service";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { LabelType, Options } from "@angular-slider/ngx-slider";
import { MatDialog } from "@angular/material/dialog";
import { ConfigService } from "src/app/services/init/config.service";
import { EditMockDraftModalComponent } from "../../modals/edit-mock-draft-modal/edit-mock-draft-modal.component";
import { LeagueTeam } from "src/app/model/league/LeagueTeam";
import { LeagueSwitchService } from "../../services/league-switch.service";

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

  selectableTeams: LeagueTeam[] = [];

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
    private powerRankingsService: PowerRankingsService,
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
        this.draftService.updateDraft$.next(false);
      }),
      this.leagueSwitchService.leagueChanged$.subscribe(_ => {
        this.setUpSelectableTeams();
      })
    );
  }

  setUpSelectableTeams(): void {
    this.selectableTeams = this.leagueService.selectedLeague ?
      this.leagueService.leagueTeamDetails :
      Array.from({ length: 12 }, (_, index) => new LeagueTeam(null, null).createMockTeam(index + 1));
    this.draftService.overrideRosterId = this.selectableTeams[0].roster.rosterId || 1;
  }

  filterChanged(refresh: boolean = false): void {
    this.draftService.updateDraft$.next(refresh);
  }

  clearTextSearch(): void {
    this.draftService.searchVal = '';
  }

  handleToggleToolbar = () =>
    this.configService.isMobile ? this.configService.toggleToolbar$.next() : this.toggleTools = !this.toggleTools;

  openMockDraftModal(): void {
    this.dialog.open(EditMockDraftModalComponent
      , {
        minHeight: '200px',
        minWidth: this.configService.isMobile ? '300px' : '500px',
        autoFocus: true,
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
  onMarketChange(market: FantasyMarket): void {
    this.playerService.selectedMarket = market;
    if (this.draftService.selectedDraft === 'upcoming') {
      this.draftService.generateDraft();
    }
  }

  /**
   * toggles trade pick mode for mock draft
   */
  toggleTradePickMode(): void {
    this.draftService.isOrderMode = !this.draftService.isOrderMode
    this.draftService.updateDraft$.next();
  }

  /**
   * Exports mock draft data to CSV file
   */
  exportMockDraft(): void {
    const draftData: any[][] = []
    draftData.push([`Mock Draft for ${this.leagueService.selectedLeague.name} - ${this.draftService.mockDraftRounds} Rounds - ${this.leagueService.selectedLeague.isSuperflex ? 'Superflex' : 'Standard (1 QB)'}`]);
    draftData.push([]);
    draftData.push([
      ['Pick', 'Team', 'Owner', 'Notes', 'Team Needs', 'Player', 'Position', 'Age', 'Trade Value'],
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
      pick.originalRosterId !== pick.rosterId ? `Traded from ${this.leagueService.getTeamByRosterId(pick.originalRosterId)?.owner.teamName}` : "",
      `${this.powerRankingsService.getTeamNeedsFromRosterId(pick.rosterId).join("-")}`];
      let playerRow = [];
      if (player) {
        playerRow = [player?.full_name, player?.position, player?.age,
        this.draftService.isSuperflex ? player?.sf_trade_value : player?.trade_value
        ];
      }
      draftData.push(row.concat(playerRow));
    });

    const formattedDraftData = draftData.map(e => e.join(',')).join('\n');

    const filename = `${this.leagueService.selectedLeague.name.replace(/ /g, '_')}_Mock_Draft_${this.draftService.mockDraftRounds}_Rounds_${new Date().toISOString().slice(0, 10)}.csv`;

    this.downloadService.downloadCSVFile(formattedDraftData, filename);
  }

}