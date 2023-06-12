import { Component, OnInit } from '@angular/core';
import { LeagueService } from '../../services/league.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LeagueTeam } from '../../model/league/LeagueTeam';
import { PowerRankingsService } from '../services/power-rankings.service';
import { PlayerService } from '../../services/player.service';
import { FantasyPlayer } from '../../model/assets/FantasyPlayer';
import { PlayerComparisonService } from '../services/player-comparison.service';
import { TransactionsService } from '../services/transactions.service';
import { TransactionUI } from '../model/transaction';
import { ConfigService } from '../../services/init/config.service';
import { BaseComponent } from '../base-component.abstract';
import { LeagueSwitchService } from '../services/league-switch.service';
import { DisplayService } from '../../services/utilities/display.service';
import { MatchupService } from '../services/matchup.service';
import { NflService } from 'src/app/services/utilities/nfl.service';
import { standardDeviation, variance } from 'simple-statistics';

@Component({
  selector: 'app-fantasy-team-details',
  templateUrl: './fantasy-team-details.component.html',
  styleUrls: ['./fantasy-team-details.component.css']
})
export class FantasyTeamDetailsComponent extends BaseComponent implements OnInit {

  /** selected fantasy team */
  selectedTeam: LeagueTeam;

  /** full list of team activites */
  teamActivity: TransactionUI[] = [];

  /** filtered list of team activities */
  filterTeamActivity: TransactionUI[] = [];

  /** roster of players */
  roster: FantasyPlayer[] = [];

  /** Season insights map for displayed stats */
  seasonInsights: {} = null;

  /** team position group aggregate map */
  teamAggregates: {} = null;

  /** activity filter */
  activitySearchVal: string;

  /** show more activities */
  activityShowMore: boolean = false;

  /** if false page is not loaded yet */
  pageLoaded: boolean = false;

  constructor(public leagueService: LeagueService,
    private route: ActivatedRoute,
    public powerRankingsService: PowerRankingsService,
    public playerService: PlayerService,
    private playerComparisonService: PlayerComparisonService,
    private router: Router,
    private matchUpService: MatchupService,
    private nflService: NflService,
    public leagueSwitchService: LeagueSwitchService,
    public transactionsService: TransactionsService,
    public displayService: DisplayService,
    private playersService: PlayerService,
    public configService: ConfigService) {
    super();
  }

  ngOnInit(): void {
    this.playersService.loadPlayerValuesForToday();
    this.addSubscriptions(
      this.route.queryParams.subscribe(params => {
        this.leagueSwitchService.loadFromQueryParams(params);
      }),
      this.matchUpService.matchUpsLoaded$.subscribe(() => {
        this.getSelectedTeam();
      })
    );
    if (this.leagueService.isLeagueLoaded() && this.leagueService.selectedLeague) {
      this.getSelectedTeam();
    }
  }

  /**
   * returns a list of the biggest risers/fallers
   * @param isRiser true if rising/false if fallers
   */
  getBiggestMovers(isRiser: boolean): FantasyPlayer[] {
    const tempRoster = this.roster?.slice();
    return tempRoster.filter(player => {
      return (this.leagueService?.selectedLeague?.isSuperflex ? player.sf_trade_value : player.trade_value) > 1000;
    }).sort((a, b) => {
      if (isRiser) {
        return (this.leagueService?.selectedLeague?.isSuperflex ? b.sf_change - a.sf_change : b.standard_change - a.standard_change);
      } else {
        return (this.leagueService?.selectedLeague?.isSuperflex ? a.sf_change - b.sf_change : a.standard_change - b.standard_change);
      }
    }).slice(0, 5);
  }

  getSelectedTeam(): void {
    this.roster = [];
    const ownerName = this.route.snapshot.paramMap.get('ownerName');
    // get selected team from sleeper data
    const teamIndex = this.leagueService.leagueTeamDetails.map(e => e.owner?.ownerName).indexOf(ownerName);
    this.selectedTeam = this.leagueService.leagueTeamDetails[teamIndex];
    // generate roster and sort
    for (const playerPlatformId of this.selectedTeam.roster.players) {
      const player = this.playerService.getPlayerByPlayerPlatformId(playerPlatformId, this.leagueService.selectedLeague.leaguePlatform);
      if (player) {
        this.roster.push(player);
      }
    }
    this.roster.sort((a, b) => {
      return this.leagueService?.selectedLeague?.isSuperflex ?
        b.sf_trade_value - a.sf_trade_value : b.trade_value - a.trade_value;
    });

    this.pageLoaded = true;
    this.seasonInsights = this.setSeasonInsights();
    this.teamAggregates = this.getTeamPositionAggregates();
    this.loadTransactionHistory();
  }

  /**
   * Get position aggregations for team
   * @returns map of team position aggregates
   */
  getTeamPositionAggregates(): {} {
    const positions = ['OV', 'QB', 'RB', 'WR', 'TE'];
    const aggMap = {};
    for (const pos of positions) {
      const playerGroup = pos === 'OV' ? this.roster.slice() : this.roster.slice().filter(it => it.position === pos)
      aggMap[pos + '_value'] = playerGroup.reduce((s, player) => s + (this.leagueService?.selectedLeague?.isSuperflex ? player.sf_trade_value : player.trade_value), 0);
      const lastMonth = playerGroup.reduce((s, player) => s + (this.leagueService.selectedLeague.isSuperflex ? player.last_month_value_sf : player.last_month_value), 0)
      aggMap[pos + '_change'] = lastMonth > 0 ? Math.round(((aggMap[pos + '_value'] / lastMonth) - 1) * 100) : '-';
      aggMap[pos + '_avg_age'] = Math.round(playerGroup.reduce((s, player) => s + player.age, 0) / playerGroup.length * 10) / 10;
    }
    return aggMap;
  }

  loadTransactionHistory(): void {
    // generates team activities and cleans data for display
    this.teamActivity = this.transactionsService.generateTeamTransactionHistory(this.selectedTeam);
    this.filterTeamActivity = !this.activityShowMore ? this.teamActivity.slice(0, 5) : this.teamActivity;
  }

  /**
   * open player comparison page
   * @param selectedPlayer selected player
   */
  openPlayerComparison(selectedPlayer: FantasyPlayer): void {
    this.playerComparisonService.addPlayerToCharts(selectedPlayer);
    this.router.navigate(['players/comparison'],
      {
        queryParams: this.leagueSwitchService.buildQueryParams()
      }
    );
  }

  /**
   * filters activities based on search preferences
   */
  updateActivityFilter(): void {
    if (this.activitySearchVal && this.activitySearchVal.length > 0) {
      const fullFilteredList = this.teamActivity.filter(activity => {
        return (activity.adds.findIndex(add => add.playerName.toLowerCase().includes(this.activitySearchVal.toLowerCase())) >= 0
          || activity.drops.findIndex(drop => drop.playerName.toLowerCase().includes(this.activitySearchVal.toLowerCase())) >= 0
          || activity.type.toLowerCase().includes(this.activitySearchVal.toLowerCase())
          || activity.headerDisplay.toLowerCase().includes(this.activitySearchVal.toLowerCase()));
      });
      this.activityShowMore ? this.filterTeamActivity = fullFilteredList.slice() : this.filterTeamActivity = fullFilteredList.slice(0, 5);
    } else {
      this.activityShowMore ? this.filterTeamActivity =
        this.teamActivity.slice() : this.filterTeamActivity = this.teamActivity.slice(0, 5);
    }
  }

  /**
   * set filter value to trade to only show team trades
   */
  showOnlyTrades(): void {
    this.activitySearchVal = 'trade';
    this.updateActivityFilter();
  }

  setSeasonInsights(): {} {
    const newInsights = {};
    const completedWeek = this.nflService.getCompletedWeekForSeason(this.leagueService.selectedLeague?.season);
    newInsights['games_played'] = (completedWeek - this.leagueService.selectedLeague?.startWeek + 1) || '-';
    newInsights['avg_points'] = this.getAveragePoints(newInsights['games_played']) || '-';
    newInsights['points_for'] = this.selectedTeam?.roster.teamMetrics?.fpts || '-';
    newInsights['points_against'] = this.selectedTeam?.roster.teamMetrics?.fptsAgainst || '-';
    newInsights['points_pot'] = this.selectedTeam?.roster.teamMetrics?.ppts || '-';
    const teamRosterId = this.selectedTeam?.roster?.rosterId;
    const pointsByWeek: number[] = [];
    for (let i = 0; i < completedWeek; i++) {
      const matchUp = this.matchUpService.leagueMatchUpUI[i]?.filter(match => match.team1RosterId === teamRosterId || match.team2RosterId === teamRosterId)[0];
      if (!matchUp) { continue; }
      if (matchUp.team1RosterId === teamRosterId) {
        pointsByWeek.push(matchUp.team1Points);
      } else {
        pointsByWeek.push(matchUp.team2Points);
      }
    }
    newInsights['high'] = pointsByWeek.length > 0 ? Math.max(...pointsByWeek) : '-';
    newInsights['low'] = pointsByWeek.length > 0 ? Math.min(...pointsByWeek) : '-';
    newInsights['variance'] = pointsByWeek.length > 0 ? Math.round(variance(pointsByWeek) * 100) / 100 : '-';
    newInsights['std'] = pointsByWeek.length > 0 ? Math.round(standardDeviation(pointsByWeek) * 100) / 100 : '-';
    return newInsights;
  }

  /**
 * get average points for team
 */
  private getAveragePoints = (weeksPlayed: number) =>
    Math.round(this.selectedTeam.roster.teamMetrics.fpts / weeksPlayed);


  /**
   * handles changing of fantasy market
   * @param $event 
   */
  onMarketChange($event): void {
    this.playerService.selectedMarket = $event;
    this.teamAggregates = this.getTeamPositionAggregates();
    this.loadTransactionHistory();
  }
}
