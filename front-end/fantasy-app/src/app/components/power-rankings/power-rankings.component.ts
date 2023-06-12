import { Component, OnInit } from '@angular/core';
import { LeagueService } from '../../services/league.service';
import { PowerRankingsService } from '../services/power-rankings.service';
import { PlayerService } from '../../services/player.service';
import { BaseComponent } from '../base-component.abstract';
import { LeagueSwitchService } from '../services/league-switch.service';
import { delay } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { DownloadService } from 'src/app/services/utilities/download.service';
import { DisplayService } from 'src/app/services/utilities/display.service';

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
    private downloadService: DownloadService,
    private displayService: DisplayService,
    private route: ActivatedRoute,
    public leagueSwitchService: LeagueSwitchService) {

    super();
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
        'WR Starter Rank', 'WR Starter Value', 'TE Starter Rank', 'TE Starter Value'],
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
      ]);
    });

    const formattedPowerRankings = powerRankingData.map(e => e.join(',')).join('\n');

    const filename = `${this.leagueService.selectedLeague.name.replace(/ /g, '_')}_Power_Rankings_${new Date().toISOString().slice(0, 10)}.csv`;

    this.downloadService.downloadCSVFile(formattedPowerRankings, filename)
  }
}
