import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FantasyPlayer } from '../../../model/assets/FantasyPlayer';
import { DraftService, DraftOrderType } from '../../services/draft.service';
import { LeagueService } from '../../../services/league.service';
import { PlayerService } from 'src/app/services/player.service';
import { ConfigService } from 'src/app/services/init/config.service';
import { LeagueTeam } from 'src/app/model/league/LeagueTeam';
import { ColorService, DraftPosColorPallette } from 'src/app/services/utilities/color.service';
import { MatDialog } from '@angular/material/dialog';
import { PlayerDetailsModalComponent } from '../../modals/player-details-modal/player-details-modal.component';
import { BaseComponent } from '../../base-component.abstract';
import { LeaguePickDTO } from 'src/app/model/league/LeaguePickDTO';
import { LeagueRawDraftOrderDTO } from 'src/app/model/league/LeagueRawDraftOrderDTO';
import { StatService } from 'src/app/services/utilities/stat.service';
import { delay } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-draft-table',
  templateUrl: './draft-table.component.html',
  styleUrls: ['./draft-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DraftTableComponent extends BaseComponent implements OnInit, OnChanges {

  // Input for team picks
  @Input()
  teamPicks: LeaguePickDTO[];

  // Input for indicating if it's a mock draft
  @Input()
  isMockDraft: boolean = true;

  // Input for draft details
  @Input()
  draft: LeagueRawDraftOrderDTO = null;

  // Array to store league team order
  teamOrder: LeagueTeam[] = [];

  // 2D array to store formatted rows of league picks
  formattedRows: LeaguePickDTO[][] = [];

  // Array to store the order of fantasy players
  playerOrder: FantasyPlayer[] = [];

  // Reference to MatMenuTrigger for programmatic control
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  // Cache for cell colors based on the draft configuration
  colorCache = {};

  constructor(public mockDraftService: DraftService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    public configService: ConfigService,
    public playerService: PlayerService,
    private statService: StatService,
    public colorService: ColorService,
    public leagueService: LeagueService) {
    super();
  }

  ngOnInit(): void {
    if (this.playerService.playerValues.length > 0) {
      this.initializeMockDraft();
    }
    this.addSubscriptions(this.mockDraftService.updateDraft$
      .subscribe(refresh => {
        this.setCellColorCache();
        if (refresh) {
          this.initializeMockDraft();
        } else {
          this.cdr.markForCheck();
        }
      }),
      this.playerService.playerValuesUpdated$.pipe(delay(500)).subscribe(_ => {
        this.mockDraftService.generateDraft();
        this.mockDraftService.updateDraft$.next(true);
      }))
  }

  ngOnChanges(): void {
    this.initializeMockDraft();
  }

  initializeMockDraft(): void {
    this.formattedRows = [];
    this.playerOrder = this.isMockDraft ?
      this.mockDraftService.getDraftOrder() :
      this.teamPicks.map(p =>
        this.playerService.getPlayerByPlayerPlatformId(
          p.playerId,
          this.leagueService.selectedLeague.leaguePlatform
        ) || null
      )
    const teamCount = this.leagueService.selectedLeague ? this.leagueService.leagueTeamDetails.length : 12;
    // set draft order
    if (!this.isMockDraft) {
      this.teamOrder =
        Object.values(this.draft.slotToRosterId).map(t =>
          this.leagueService.getTeamByRosterId(t as number)
        );
    } else {
      this.teamOrder = this.leagueService.selectedLeague ? this.teamPicks.slice(0, teamCount)
        .map(p =>
          this.leagueService.leagueTeamDetails.find(t => t.roster.rosterId === p.originalRosterId)
        ) : Array.from({ length: 12 }, (_, index) => new LeagueTeam(null, null).createMockTeam(index + 1));
    }
    this.setCellColorCache();
    // map players to the draft
    for (let i = 0; i < this.teamPicks.length; i += teamCount) {
      let row = this.teamPicks.slice(i, i + teamCount);
      let draftType = this.isMockDraft ?
        this.mockDraftService.mockDraftOrder : this.draft.type;
      switch (draftType) {
        case DraftOrderType.Snake:
          row = this.formattedRows.length % 2 == 0 ? row : row.reverse();
          break;
        case DraftOrderType.RoundReversal:
          row = (this.formattedRows.length % 2 === 0 && this.formattedRows.length < 2) ||
            (this.formattedRows.length % 2 === 1 && this.formattedRows.length > 2) ?
            row : row.reverse();
          break;
        default:
          break;
      }
      this.formattedRows.push(row);
    }
    this.cdr.markForCheck();
  }

  setCellColorCache(): void {
    this.colorCache = {};
    if (!this.isMockDraft) {
      switch (this.mockDraftService.completedConfig) {
        case 'value':
          this.colorCache['min'] = this.mockDraftService.getPickValueAdded(this.teamPicks[0]);
          this.colorCache['max'] = this.colorCache['min'];
          this.teamPicks.forEach(p => {
            const val = this.mockDraftService.getPickValueAdded(p);
            if (this.colorCache['min'] > val) {
              this.colorCache['min'] = val;
            }
            if (this.colorCache['max'] < val) {
              this.colorCache['max'] = val;
            }
          });
          this.colorCache['values'] =
            this.colorService.getColorGradientArray(
              this.colorCache['max'] + 2,
              '#ADADB0', '#008f51'
            )
          this.colorCache['badValues'] = this.colorService.getColorGradientArray(
            Math.abs(this.colorCache['min']) + 2,
            '#ADADB0', '#e31d1d'
          )
          break;
        case 'overall':
          this.colorCache['min'] = this.playerService.getCurrentPlayerValue(
            this.playerOrder[0], this.mockDraftService.isSuperflex
          );
          this.colorCache['max'] = this.colorCache['min']
          this.playerOrder.forEach(p => {
            const val = this.playerService.getCurrentPlayerValue(
              p, this.mockDraftService.isSuperflex
            );
            if (this.colorCache['min'] > val) {
              this.colorCache['min'] = val;
            }
            if (this.colorCache['max'] < val) {
              this.colorCache['max'] = val;
            }
          });
          this.colorCache['values'] =
            this.colorService.getColorGradientArray(
              this.colorCache['max'] + 2,
              '#ADADB0', '#008f51'
            )
          break;
        default:
      }
    } else {
      if (this.playerOrder.length > 0) {
        if (this.mockDraftService.mockDraftConfig === 'tiers') {
          const tiers = this.statService.bucketSort(this.playerOrder,
            this.mockDraftService.isSuperflex ? 'sf_trade_value' : 'trade_value');
          this.colorCache['tiers'] = {};
          tiers.forEach((tier, ind) => {
            tier.forEach(player => {
              this.colorCache['tiers'][player.name_id] = ind
            })
          })
        } else if (this.mockDraftService.mockDraftConfig === 'trending') {
          this.colorCache['min'] = this.mockDraftService.isSuperflex ?
            this.playerOrder[0]?.sf_change || 0 : this.playerOrder[0]?.standard_change || 0;
          this.colorCache['max'] = this.colorCache['min']
          this.playerOrder.forEach(p => {
            const val = this.mockDraftService.isSuperflex ? p?.sf_change || 0 : p?.standard_change || 0;
            if (this.colorCache['min'] > val) {
              this.colorCache['min'] = val;
            }
            if (this.colorCache['max'] < val) {
              this.colorCache['max'] = val;
            }
          });
          this.colorCache['values'] =
            this.colorService.getColorGradientArray(
              this.colorCache['max'] + 2,
              '#ADADB0', '#008f51'
            )
          this.colorCache['badValues'] = this.colorService.getColorGradientArray(
            Math.abs(this.colorCache['min']) + 2,
            '#ADADB0', '#e31d1d'
          )
        }
      }
    }
  }

  /**
   * Return value for pick in ()s
   * @param pick draft pick to get value for
   */
  getDisplayValue(pick: LeaguePickDTO): number {
    if (this.isMockDraft) {
      return this.playerService.getCurrentPlayerValue(this.playerOrder[pick.pickNumber - 1], this.mockDraftService.isSuperflex) || 0
    } else {
      switch (this.mockDraftService.completedConfig) {
        case 'overall':
          return this.playerService.getCurrentPlayerValue(
            this.playerOrder[pick.pickNumber - 1], this.mockDraftService.isSuperflex) || 0;
        case 'value':
          return this.mockDraftService.getPickValueAdded(pick);
        default:
          return this.playerService.getCurrentPlayerValue(this.playerOrder[pick.pickNumber - 1], this.mockDraftService.isSuperflex) || 0
      }
    }
  }

  /**
   * Get player position rank for player in draft order
   * @param player fantasy player to get position rank for
   */
  getPlayerPositionRank(player: FantasyPlayer): string {
    const ind = this.playerOrder?.filter(p => p?.position === player?.position)?.findIndex(p => p?.name_id == player?.name_id)
    return player && ind >= 0 ? `${player?.position}${ind + 1}` : '--';
  }

  /**
   * Returns true if the cell should be filtered out
   * @param pick pick information to filter on
   * @param player fantasy player to filter on
   */
  isFilteredOut(pick: LeaguePickDTO, player: FantasyPlayer): boolean {
    if (this.mockDraftService.filterTeam && pick?.rosterId !== this.mockDraftService.filterTeam ||
      (Object.values(this.mockDraftService.filteredPositions).some(value => value === true) &&
        !this.mockDraftService.filteredPositions[player?.position]) ||
      !player?.full_name.toLowerCase().includes(this.mockDraftService.searchVal) ||
      ((this.mockDraftService.ageFilter[0] !== 21 || this.mockDraftService.ageFilter[1] !== 40) &&
        (player?.age < this.mockDraftService.ageFilter[0] || player?.age > this.mockDraftService.ageFilter[1])) ||
      ((this.mockDraftService.expFilter[0] !== 0 || this.mockDraftService.expFilter[1] !== 23) &&
        (player?.experience < this.mockDraftService.expFilter[0] || player?.experience > this.mockDraftService.expFilter[1]))
    ) {
      return true;
    }
    return false;
  }

  /**
   * return team name for roster id
   * @param rosterId id of team to get name for
   */
  getOwnerNameByRosterId = (rosterId: number) =>
    this.leagueService.selectedLeague ?
      this.leagueService.getTeamByRosterId(rosterId)?.owner?.ownerName || `Team ${rosterId}` :
      `Team ${rosterId}`;

  /**
   * Toggle team filter search 
   * @param rosterId team id
   */
  toggleTeamFilter(rosterId: number, index: number): void {
    if (this.mockDraftService.isOrderMode) {
      const team = this.teamOrder.find(t =>
        t.roster.rosterId === this.mockDraftService.overrideRosterId);
      this.teamOrder[index] = team;
      this.teamPicks.forEach((p, ind) => {
        if (
          ( ind % this.teamOrder.length === index ||
            ind % this.teamOrder.length === this.teamOrder.length - index - 1) &&
          p.originalRosterId === rosterId && p.rosterId === rosterId) {
          this.teamPicks[ind].rosterId = this.mockDraftService.overrideRosterId;
          this.teamPicks[ind].originalRosterId = this.mockDraftService.overrideRosterId;
        }
      });
    } else {
      this.mockDraftService.filterTeam == rosterId ?
        this.mockDraftService.filterTeam = null :
        this.mockDraftService.filterTeam = rosterId;
    }
    this.mockDraftService.updateDraft$.next(false);
  }

  /**
   * Returns a color for a pick based on draft config
   * @param pick draft pick to determine color for
   */
  getPickColor(pick: LeaguePickDTO): string {
    if (this.isMockDraft) {
      if (this.mockDraftService.alreadyDraftedList.includes(this.playerOrder[pick.pickNumber - 1]?.name_id))
        return '#67678e';
      switch (this.mockDraftService.mockDraftConfig) {
        case 'tiers':
          return DraftPosColorPallette[this.colorCache['tiers']?.[this.playerOrder[pick.pickNumber - 1]?.name_id]];
        case 'trending':
          const val = this.mockDraftService.isSuperflex ? this.playerOrder[pick.pickNumber - 1]?.sf_change : this.playerOrder[pick.pickNumber - 1]?.standard_change;
          return val >= 0 ? this.colorCache['values'][val] : this.colorCache['badValues'][Math.abs(val)];
        default:
          return this.colorService.getDraftColorForPos(this.playerOrder[pick.pickNumber - 1]?.position)
      }
    } else {
      switch (this.mockDraftService.completedConfig) {
        case 'overall':
          return this.colorCache['values'][(this.playerService.getCurrentPlayerValue(
            this.playerOrder[pick.pickNumber - 1], this.mockDraftService.isSuperflex) || 0) + 1];
        case 'value':
          const val = this.mockDraftService.getPickValueAdded(pick);
          return val >= 0 ? this.colorCache['values'][val] : this.colorCache['badValues'][Math.abs(val)];
        default:
          return this.colorService.getDraftColorForPos(this.playerOrder[pick.pickNumber - 1]?.position)
      }
    }
  }

  /**
   * handles pick on click in edit mode or open modal
   * @param player player modal to open
   * @param pickNum cell pick number to modify
   */
  handlePickOnClick(player: FantasyPlayer, pickNum: number): void {
    if (this.mockDraftService.isOrderMode) {
      this.mockDraftService.teamPicks[pickNum - 1].rosterId = this.mockDraftService.overrideRosterId;
      this.mockDraftService.updateDraft$.next(false);
    } else {
      if (player && ['QB', 'RB', 'WR', 'TE'].includes(player.position)) {
        this.dialog.open(PlayerDetailsModalComponent
          , {
            data: {
              player
            },
            width: this.configService.isMobile ? '100%' : '80%',
            maxWidth: this.configService.isMobile ? '100%' : '1400px',
            maxHeight: this.configService.isMobile ? '80%' : '',
            panelClass: "player-dialog"
          }
        );
      }
    }
  }
}
