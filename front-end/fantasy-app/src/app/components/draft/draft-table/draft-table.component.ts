import { AfterViewInit, Component, Input, OnChanges, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FantasyMarket, FantasyPlayer } from '../../../model/assets/FantasyPlayer';
import { TeamMockDraftPick } from '../../model/mockDraft';
import { DraftService } from '../../services/draft.service';
import { LeagueService } from '../../../services/league.service';
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PowerRankingsService } from '../../services/power-rankings.service';
import { PlayerService } from 'src/app/services/player.service';
import { ConfigService } from 'src/app/services/init/config.service';
import { LeagueTeam } from 'src/app/model/league/LeagueTeam';

@Component({
  selector: 'app-draft-table',
  templateUrl: './draft-table.component.html',
  styleUrls: ['./draft-table.component.css']
})
export class DraftTableComponent implements OnInit, OnChanges, AfterViewInit {

  /**
   * change detection when new group is toggled
   */
  @Input()
  mockDraftConfig: string;

  /**
   * toggle for when data is changed externally
   */
  @Input()
  isReset: boolean;

  /** display columns */
  displayedColumns: string[] = [];

  /** page length set to size of league */
  pageLength: number = 12;

  /** control for the selected player */
  public playerCtrl: FormControl = new FormControl();

  /** control for the MatSelect filter keyword */
  public playerFilterCtrl: FormControl = new FormControl();

  /** list of players filtered by search keyword */
  public filteredDraftPlayers: ReplaySubject<FantasyPlayer[]> = new ReplaySubject<FantasyPlayer[]>(1);

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  /** mat paginator */
  @ViewChild(MatPaginator) paginator: MatPaginator;

  /** Team needs cache for table */
  teamCache = {};

  /** mat datasource */
  dataSource: MatTableDataSource<TeamMockDraftPick> = new MatTableDataSource<TeamMockDraftPick>();

  constructor(public mockDraftService: DraftService,
    public configService: ConfigService,
    public playerService: PlayerService,
    private powerRankingsService: PowerRankingsService,
    public leagueService: LeagueService) {
  }

  ngOnInit(): void {
    this.displayedColumns = this.configService.isMobile ?
      ['pickNumber', 'team', 'projectedPlayer'] :
      ['pickNumber', 'team', 'teamNeeds', 'projectedPlayer'];

    // listen for search field value changes
    this.playerFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterDraftPlayers(this.playerFilterCtrl, this.filteredDraftPlayers);
      });
  }

  ngAfterViewInit(): void {
    this.initializeMockDraft();
  }

  initializeMockDraft(): void {
    this.pageLength = this.leagueService.selectedLeague.totalRosters;
    this.leagueService.leagueTeamDetails.forEach(team => {
      this.teamCache[team.roster.rosterId] = {
        teamNeeds: this.powerRankingsService.getTeamNeedsFromRosterId(team.roster.rosterId).join(' · '),
        avatar: team?.owner?.avatar,
        name: team?.owner?.teamName
      }
    });
    this.mockDraftService.teamPicks.sort((a, b) => a.pick - b.pick);
    this.dataSource = new MatTableDataSource(this.mockDraftService.teamPicks);
    this.dataSource.paginator = this.paginator;
    this.filteredDraftPlayers.next(this.mockDraftService.selectablePlayers.slice(0, 10));
    this.mockDraftService.resetDraftList();
  }

  ngOnChanges(): void {
    this.initializeMockDraft();
  }

  /**
   * disable player in custom mode dropdown if already selected
   * @param player player data
   */
  isPlayerAlreadySelected(player: FantasyPlayer, pickNum: number): boolean {
    return this.mockDraftService.mockDraftSelectedPlayers.slice(0, pickNum).some(picked => picked?.name_id === player?.name_id);
  }

  /**
 * filter players for selected dropdown
 * @protected
 */
  protected filterDraftPlayers(filterCtrl: FormControl, filterSubscription: ReplaySubject<FantasyPlayer[]>): any {
    // get the search keyword
    let search = filterCtrl.value;
    if (!search) {
      filterSubscription.next(this.mockDraftService.selectablePlayers.filter(player => !this.mockDraftService.mockDraftSelectedPlayers.includes(player)).slice(0, 8));
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the players
    filterSubscription.next(
      this.mockDraftService.selectablePlayers
        .filter(player => ((player.full_name.toLowerCase().indexOf(search) > -1
          || player.owner?.ownerName.toLowerCase().indexOf(search) > -1
          || player.position.toLowerCase().indexOf(search) > -1))).slice(0, 10));
  }

  /**
   * Draft Player in mock draft
   * @param player player being drafted
   * @param pick Pick player is drafted at
   */
  draftPlayer(player: FantasyPlayer, pick: number): void {
    const pickInd = pick - 1;
    const ind = this.mockDraftService.mockDraftSelectedPlayers.findIndex(p => p?.name_id === player?.name_id)
    if (ind > pickInd) {
      this.mockDraftService.mockDraftSelectedPlayers[ind] = undefined
    }
    this.mockDraftService.mockDraftSelectedPlayers[pickInd] = player
    this.filterDraftPlayers(this.playerFilterCtrl, this.filteredDraftPlayers);
  }

  /**
 * Undraft Player in mock draft
 * @param player player being undrafted
 * @param pick Pick player is undrafted at
 */
  undraftPlayer(pick: number): void {
    this.mockDraftService.mockDraftSelectedPlayers[pick - 1] = null;
  }

  /**
   * Update team pick
   * @param team team to update pick to
   * @param pick pick number
   */
  selectTeamForPick(team: LeagueTeam, pick: number) {
    this.mockDraftService.teamPicks[pick].rosterId = team.roster.rosterId;
    this.mockDraftService.teamPicks[pick].originalRosterId = team.roster.rosterId;
    this.mockDraftService.teamPicks[pick].pickTeam = team.owner.teamName;
    this.mockDraftService.teamPicks[pick].pickOwner = team.owner.ownerName;
    this.initializeMockDraft();
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
