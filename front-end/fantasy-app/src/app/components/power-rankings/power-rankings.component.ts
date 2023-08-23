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
import { LeagueType } from 'src/app/model/league/LeagueDTO';

@Component({
  selector: 'app-power-rankings',
  templateUrl: './power-rankings.component.html',
  styleUrls: ['./power-rankings.component.css']
})
export class PowerRankingsComponent extends BaseComponent implements OnInit {

  pageDescription = 'Team power rankings are determined by fantasy market player values and yearly player average ADP.'

  /** Error generating power rankings message */
  creatingPRErrMsg = 'Error creating Power Rankings. Try again.'

  /** No league selected error message */
  noLeagueErrMsg = 'Unable to create rankings. Please select a league.'

  /** Power Rankings Presets */
  powerRankingsPresetOptions = [
    { type: PowerRankingTableView.TradeValues, display: 'Trade Value View' },
    { type: PowerRankingTableView.Starters, display: 'Contender View' }
  ]

  /** form control for metrics dropdown */
  selectedMetrics = new UntypedFormControl();

  /** form control for data visualizations dropdown */
  selectedVisualizations = new UntypedFormControl();

  constructor(public leagueService: LeagueService,
    public powerRankingService: PowerRankingsService,
    private playersService: PlayerService,
    private downloadService: DownloadService,
    private displayService: DisplayService,
    private route: ActivatedRoute,
    private pageService: PageService,
    public leagueSwitchService: LeagueSwitchService) {
    super();
    this.pageService.setUpPageSEO('Fantasy League Power Rankings | Dynasty Daddy',
      ['fantasy league ranker', 'fantasy football rankings', 'league power ranker',
        'fantasy power rankings', 'fantasy league analyzer', 'fantasy footbal analyzer',
        'fantasy league rankings', 'fantasy football power rankings'],
      this.pageDescription)
  }

  ngOnInit(): void {
    this.playersService.loadPlayerValuesForToday();
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
    switch (type) {
      case 1:
        this.selectedVisualizations.setValue(['overall']);
        this.selectedMetrics.setValue(['team', 'owner', 'tier', 'starterRank', 'qbStarterRank', 'rbStarterRank', 'wrStarterRank', 'teStarterRank', 'flexStarterRank']);
        break;
      default:
        const cols = ['team', 'owner', 'tier', 'overallRank', 'starterRank', 'qbRank', 'rbRank', 'wrRank', 'teRank'];
        if (this.leagueService.selectedLeague.type === LeagueType.DYNASTY) {
          cols.push('draftRank');
        }
        this.selectedVisualizations.setValue(['overall']);
        this.selectedMetrics.setValue(cols);
    }
    this.refreshPowerRankingsView();
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
   * Refresh selected metrics and visualizations in service
   */
  refreshPowerRankingsView(): void {
    this.powerRankingService.powerRankingsTableCols = this.selectedMetrics.value;
    this.powerRankingService.powerRankingsVisualizations = this.selectedVisualizations.value;
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
}
