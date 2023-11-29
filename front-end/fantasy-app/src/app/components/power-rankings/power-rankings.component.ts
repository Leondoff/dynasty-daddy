import { Component, OnInit } from '@angular/core';
import { LeagueService } from '../../services/league.service';
import { PowerRankingTableView, PowerRankingsService } from '../services/power-rankings.service';
import { PlayerService } from '../../services/player.service';
import { BaseComponent } from '../base-component.abstract';
import { LeagueSwitchService } from '../services/league-switch.service';
import { delay } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { DownloadService } from 'src/app/services/utilities/download.service';
import { DisplayService } from 'src/app/services/utilities/display.service';
import { PageService } from 'src/app/services/utilities/page.service';
import { UntypedFormControl } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { CreatePresetModalComponent } from '../modals/create-preset-modal/create-preset-modal.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfigService } from 'src/app/services/init/config.service';
import { ConfirmationDialogModal } from '../modals/confirmation-dialog/confirmation-dialog.component';
import { LeagueType } from 'src/app/model/league/LeagueDTO';

@Component({
  selector: 'app-power-rankings',
  templateUrl: './power-rankings.component.html',
  styleUrls: ['./power-rankings.component.css']
})
export class PowerRankingsComponent extends BaseComponent implements OnInit {

  pageDescription = 'Our fantasy team ranker uses fantasy trade values and ADP to give you a complete fantasy football power rankings view.'

  /** Error generating power rankings message */
  creatingPRErrMsg = 'Error creating Power Rankings. Try again.'

  /** No league selected error message */
  noLeagueErrMsg = 'Unable to create rankings. Please select a league.'

  /** Power Rankings Presets */
  powerRankingsPresetOptions = [
    { type: PowerRankingTableView.TradeValues, display: 'Trade Value View' },
    { type: PowerRankingTableView.Starters, display: 'Contender View' },
    { type: PowerRankingTableView.Experimental, display: 'Experimental View', isClubOnly: true }
  ]

  /** form control for metrics dropdown */
  selectedMetrics = new UntypedFormControl();

  /** form control for data visualizations dropdown */
  selectedVisualizations = new UntypedFormControl();

  constructor(public leagueService: LeagueService,
    public userService: UserService,
    private configService: ConfigService,
    public powerRankingService: PowerRankingsService,
    private playersService: PlayerService,
    private downloadService: DownloadService,
    private displayService: DisplayService,
    private route: ActivatedRoute,
    private pageService: PageService,
    public leagueSwitchService: LeagueSwitchService,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<CreatePresetModalComponent>) {
    super();
    this.pageService.setUpPageSEO('Fantasy League Power Rankings | Dynasty Daddy',
      ['fantasy league ranker', 'fantasy football rankings', 'league power ranker',
        'fantasy power rankings', 'fantasy league analyzer', 'fantasy football league analyzer free',
        'fantasy league rankings', 'fantasy football power rankings'],
      this.pageDescription)
  }

  ngOnInit(): void {
    this.playersService.loadPlayerValuesForToday();
    // set the ranking market for the power rankings based off the selected market
    this.powerRankingService.rankingMarket = this.playersService.selectedMarket.valueOf();
    this.mapPowerRankings();
    // TODO potentially improve how this functions
    this.addSubscriptions(
      this.leagueSwitchService.leagueChanged$.pipe(delay(1500)).subscribe(() => {
        this.mapPowerRankings();
      }),
      this.route.queryParams.subscribe(params => {
        this.leagueSwitchService.loadFromQueryParams(params);
      }));
  }

  /**
   * Load presets for power rankings
   * @param type preset to load
   */
  loadPreset(type: number = 0): void {
    this.powerRankingService.loadPRPreset(type);
    this.powerRankingService.powerRankingsVisualizations = this.selectedVisualizations.value;
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

  /**
   * Export non-expanded power rankings to csv
   */
  exportPowerRankings(): void {
    const powerRankingData: any[][] = []
    powerRankingData.push([`League Power Rankings for ${this.leagueService.selectedLeague.name}`]);
    powerRankingData.push([]);
    powerRankingData.push([
      ['Team', 'Owner', 'Tier', 'Overall Rank', 'Overall Value', 'Starter Rank',
        'Starter Value', 'QB Rank', 'QB Value', 'RB Rank', 'RB Value', 'WR Rank',
        'WR Value', 'TE Rank', 'TE Value', 'Draft Capital Rank', 'Draft Capital Value',
        'QB Starter Rank', 'QB Starter Value', 'RB Starter Rank', 'RB Starter Value',
        'WR Starter Rank', 'WR Starter Value', 'TE Starter Rank', 'TE Starter Value',
        'FLEX Starter Rank', 'FLEX Starter Value'],
    ]);

    this.powerRankingService.powerRankings.forEach(team => {
      powerRankingData.push([
        team.team.owner.teamName,
        team.team.owner.ownerName,
        this.displayService.getTierFromNumber(team.tier),
        team.overallRank,
        this.leagueService.selectedLeague?.isSuperflex ? team.sfTradeValueOverall : team.tradeValueOverall,
        team.starterRank,
        team.adpValueStarter,
        team.roster[0].rank,
        this.leagueService.selectedLeague?.isSuperflex ? team.roster[0].sfTradeValue : team.roster[0].tradeValue,
        team.roster[1].rank,
        this.leagueService.selectedLeague?.isSuperflex ? team.roster[1].sfTradeValue : team.roster[1].tradeValue,
        team.roster[2].rank,
        this.leagueService.selectedLeague?.isSuperflex ? team.roster[2].sfTradeValue : team.roster[2].tradeValue,
        team.roster[3].rank,
        this.leagueService.selectedLeague?.isSuperflex ? team.roster[3].sfTradeValue : team.roster[3].tradeValue,
        team.picks.rank,
        this.leagueService.selectedLeague?.isSuperflex ? team.picks.sfTradeValue : team.picks.tradeValue,
        team.roster[0].starterRank,
        Math.round(team.roster[0].starterValue * 10) / 10,
        team.roster[1].starterRank,
        Math.round(team.roster[1].starterValue * 10) / 10,
        team.roster[2].starterRank,
        Math.round(team.roster[2].starterValue * 10) / 10,
        team.roster[3].starterRank,
        Math.round(team.roster[3].starterValue * 10) / 10,
        team.flexStarterRank,
        Math.round(team.flexStarterValue * 10) / 10,
      ]);
    });

    const formattedPowerRankings = powerRankingData.map(e => e.join(',')).join('\n');

    const filename = `${this.leagueService.selectedLeague.name.replace(/ /g, '_')}_Power_Rankings_${new Date().toISOString().slice(0, 10)}.csv`;

    this.downloadService.downloadCSVFile(formattedPowerRankings, filename)
  }

  /**
   * create a custom preset
   */
  createPreset(): void {
    if (this.userService.user) {
      const dialogRef = this.dialog.open(CreatePresetModalComponent
        , {
          minHeight: '200px',
          minWidth: this.configService.isMobile ? '300px' : '500px',
          autoFocus: true,
          data: {
            presetNum: this.userService?.user?.prPresets?.length || 0
          }
        }
      );
      dialogRef.afterClosed().subscribe(result => {
        if (result != '') {
          const highestId = this.userService.user.prPresets?.reduce((maxId, preset) => {
            return preset.id > maxId ? preset.id : maxId;
          }, 9);
          const preset = {
            id: highestId + 1,
            charts: this.powerRankingService.powerRankingsVisualizations || ['overall'],
            table: this.powerRankingService.selectedMetrics.value,
            name: result
          }
          this.userService.user.prPresets.push(preset)
          this.userService.setPRPresetsForUser(this.userService.user.prPresets);
          this.loadCustomPreset(preset);
        }
      });
    }
  }

  /**
   * Loads a custom preset
   * @param preset preset to load
   */
  loadCustomPreset(preset: any): void {
    this.powerRankingService.selectedMetrics.setValue(preset.table);
    this.powerRankingService.powerRankingsVisualizations = preset.charts;
    this.powerRankingService.powerRankingsTableView = preset.id;
  }

  /**
   * Saves changes to a custom preset
   */
  saveChangesToCustomPreset(): void {
    const presetInd = this.userService.user.prPresets.findIndex(p => p.id == this.powerRankingService.powerRankingsTableView);
    this.userService.user.prPresets[presetInd].charts = this.powerRankingService.powerRankingsVisualizations || ['overall'];
    this.userService.user.prPresets[presetInd].table = this.powerRankingService.selectedMetrics.value;
    this.userService.setPRPresetsForUser(this.userService.user.prPresets);
  }

  /**
   * Delete a custom preset
   */
  deleteCustomPreset(): void {
    const presetInd = this.userService.user.prPresets.findIndex(p => p.id == this.powerRankingService.powerRankingsTableView);
    const dialogRef = this.dialog.open(ConfirmationDialogModal, {
      disableClose: true,
      autoFocus: true,
      data: {
        title: `Are you sure you want to delete the ${this.userService.user.prPresets[presetInd].name} Preset?`
      }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.user.prPresets.splice(presetInd, 1);
        this.userService.setPRPresetsForUser(this.userService.user.prPresets);
        if (presetInd > 0) {
          this.loadCustomPreset(this.userService.user.prPresets[presetInd - 1]);
        } else {
          this.powerRankingService.loadPRPreset(this.leagueService.selectedLeague.type === LeagueType.DYNASTY ? 0 : 1);
        }
      }
    });
  }
}
