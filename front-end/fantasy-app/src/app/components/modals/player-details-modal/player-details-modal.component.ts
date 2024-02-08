import { Component, Inject, OnInit } from "@angular/core";
import { BaseComponent } from "../../base-component.abstract";
import { FantasyPlayer, FantasyPlayerDataPoint } from "src/app/model/assets/FantasyPlayer";
import { PlayerInsights } from "../../model/playerInsights";
import { Status } from "../../model/status";
import { FantasyPlayerApiService } from "src/app/services/api/fantasy-player-api.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ConfigKeyDictionary, ConfigService } from "src/app/services/init/config.service";
import { LeagueService } from "src/app/services/league.service";
import { PlayerService } from "src/app/services/player.service";
import { DraftService } from "../../services/draft.service";

@Component({
  selector: 'player-details-modal',
  templateUrl: './player-details-modal.component.html',
  styleUrls: ['./player-details-modal.component.scss']
})
export class PlayerDetailsModalComponent extends BaseComponent implements OnInit {

  /** player detail status */
  playerDetailStatus: Status = Status.LOADING;

  /** did players load */
  playersLoaded: boolean;

  /** selected player */
  selectedPlayer: FantasyPlayer;

  /** selected player insights */
  selectedPlayerInsights: PlayerInsights;

  /** player trade market data */
  tradeData: any;

  /** historical player value data */
  historicalTradeValue: FantasyPlayerDataPoint[];

  /** player profile json blob */
  playerProfile: any

  /** Player Profile updated date */
  profileUpdatedDate: string = '';

  /** is superflex toggle for when league isn't selected */
  isSuperflex: boolean = true;

  /** name id url param for player to load */
  NAME_ID_URL_PARAM: string = 'playerNameId';

  draftCount: number;

  constructor(
    private dialogRef: MatDialogRef<PlayerDetailsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { player: FantasyPlayer, isSuperFlex: boolean, view: string },
    private fantasyPlayerApiService: FantasyPlayerApiService,
    public configService: ConfigService,
    public leagueService: LeagueService,
    public playerService: PlayerService,
    private draftService: DraftService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.draftCount = Number(this.configService.getConfigOptionByKey(ConfigKeyDictionary.DRAFT_COUNT)?.configValue || 1000);
    this.playerDetailStatus = Status.LOADING;
    this.selectedPlayer = this.data.player;
    this.addSubscriptions(this.fantasyPlayerApiService.getPlayerDetailsByNameId(this.selectedPlayer.name_id).subscribe((data) => {
      this.historicalTradeValue = data.historicalData;
      this.playerProfile = data.profile[0]
      this.profileUpdatedDate = data.profile[0]?.last_updated?.substring(0, 10);
      this.tradeData = data.tradeData[0];
      this.playerDetailStatus = Status.DONE;
    }),
    this.draftService.updatePlayerADPDetails$.subscribe(_ => {
      this.isSuperflex = this.draftService.isSuperflex;
    }));
  }

  /**
   * is player athletic profile loaded
   */
  isPlayerProfileLoaded(): boolean {
    return this.playerProfile && JSON.stringify(this.playerProfile.profile_json?.profile) !== '{}'
  }

  /**
   * handles changing of fantasy market
   * @param $event 
   */
  onMarketChange($event): void {
    this.playerService.selectedMarket = $event;
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}