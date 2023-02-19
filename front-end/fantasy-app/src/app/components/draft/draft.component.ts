import { Component, OnInit } from '@angular/core';
import { LeagueService } from '../../services/league.service';
import { PlayerService } from '../../services/player.service';
import { BaseComponent } from '../base-component.abstract';
import { DraftService } from '../services/draft.service';
import { LeagueSwitchService } from '../services/league-switch.service';
import { delay } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ConfigService } from 'src/app/services/init/config.service';
import { DownloadService } from 'src/app/services/utilities/download.service';
import { FantasyMarket } from 'src/app/model/assets/FantasyPlayer';
import { PowerRankingsService } from '../services/power-rankings.service';

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.css']
})
export class DraftComponent extends BaseComponent implements OnInit {

  /** rerender table when refreshed */
  resetTrigger: boolean = true;

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
    private powerRankingsService: PowerRankingsService,
    private downloadService: DownloadService,
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
    this.mockDraftService.mockDraftRounds = this.leagueService.selectedLeague.draftRounds || 4;
    this.mockDraftService.generateDraft();
    if (this.leagueService.completedDrafts.length > 0) {
      this.mockDraftService.selectedDraft = this.leagueService.completedDrafts[0];
    } else {
      this.mockDraftService.selectedDraft = this.mockDraftService.teamPicks.length > 0 ? 'upcoming' : null;
    }
  }

  /**
   * wraps mock draft service call to reset
   */
  resetMockDraft(): void {
    this.resetTrigger = !this.resetTrigger;
  }

  /**
   * Refresh mock draft player set
   */
  changeDraftPlayers(): void {
    this.mockDraftService.generateDraft();
    this.resetMockDraft();
  }

  /**
   * select market handle
   * @param market new market
   */
  onMarketChange(market): void {
    this.playerService.selectedMarket = market;
    if (this.mockDraftService.selectedDraft === 'upcoming') {
      this.changeDraftPlayers()
    }
  }

  /**
   * generate a mock draft
   */
  createMockDraft(): void {
    this.mockDraftService.teamPicks = [];
    this.mockDraftService.selectedDraft = 'upcoming';
    this.mockDraftService.mapDraftObjects(this.leagueService.leagueTeamDetails);
    this.resetMockDraft();
  }

  /**
   * Exports mock draft data to CSV file
   */
  exportMockDraft(): void {
    let playerValues = {};
    this.addSubscriptions(this.playerService.fetchTradeValuesForAllMarket().subscribe(values => {
      for (let market in FantasyMarket) {
        playerValues[market] = values[market];
      }
      const draftData: any[][] = []
      draftData.push([`Mock Draft for ${this.leagueService.selectedLeague.name} - ${this.mockDraftService.mockDraftRounds} Rounds - ${this.leagueService.selectedLeague.isSuperflex ? 'Superflex' : 'Standard (1 QB)'}`]);
      draftData.push([]);
      draftData.push([
        ['Pick', 'Team', 'Owner', 'Notes', 'Team Needs', 'Player', 'Position', 'Age', 'Avg Pos ADP', 'KeepTradeCut', 'FantasyCalc', 'Dynasty Process'],
      ]);
      this.mockDraftService.teamPicks.forEach((pick, ind) => {
        const player = this.mockDraftService.mockDraftSelectedPlayers[ind];
        const row = [pick.pickdisplay, pick.pickTeam, pick.pickOwner,
          pick.originalRosterId !== pick.rosterId ? `Traded from ${this.leagueService.getTeamByRosterId(pick.originalRosterId)?.owner.teamName}` : "",
          `${this.powerRankingsService.getTeamNeedsFromRosterId(pick.rosterId).join("-")}`];
        let playerRow = [];
        if (player) {
          playerRow = [player?.full_name, player?.position, player?.age,
            player?.avg_adp > 0 ? player?.avg_adp : '',
            this.leagueService.selectedLeague.isSuperflex ? 
            playerValues[0][player?.name_id]?.sf_trade_value || 0 :
             playerValues[0][player?.name_id]?.trade_value || 0,
             this.leagueService.selectedLeague.isSuperflex ? 
             playerValues[1][player?.name_id]?.sf_trade_value || 0 :
              playerValues[1][player?.name_id]?.trade_value || 0,
              this.leagueService.selectedLeague.isSuperflex ? 
              playerValues[2][player?.name_id]?.sf_trade_value || 0 :
               playerValues[2][player?.name_id]?.trade_value || 0
          ];
        }
        draftData.push(row.concat(playerRow));
      });
  
      const formattedDraftData = draftData.map(e => e.join(',')).join('\n');
  
      const filename = `${this.leagueService.selectedLeague.name.replace(/ /g, '_')}_Mock_Draft_${this.mockDraftService.mockDraftRounds}_Rounds_${new Date().toISOString().slice(0, 10)}.csv`;
  
      this.downloadService.downloadCSVFile(formattedDraftData, filename);
    }));
  }

}
