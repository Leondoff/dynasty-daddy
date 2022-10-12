import {Component, Input, OnInit} from '@angular/core';
import {TradePackage} from '../../model/tradePackage';
import {ConfigService} from '../../../services/init/config.service';
import {PlayerService} from '../../../services/player.service';
import {Router} from '@angular/router';
import {TradeService} from '../../services/trade.service';
import {LeagueService} from '../../../services/league.service';
import {LeagueOwnerData} from '../../../model/LeagueTeam';
import {LeagueSwitchService} from "../../services/league-switch.service";

@Component({
  selector: 'app-trade-finder-card',
  templateUrl: './trade-finder-card.component.html',
  styleUrls: ['./trade-finder-card.component.css']
})
export class TradeFinderCardComponent implements OnInit {

  @Input()
  owner: LeagueOwnerData = null;

  @Input()
  tradePackage: TradePackage;

  constructor(public configService: ConfigService,
              public router: Router,
              public leagueSwitchService: LeagueSwitchService,
              public leagueService: LeagueService,
              private tradeService: TradeService,
              private playerService: PlayerService) {
  }

  ngOnInit(): void {
    this.tradePackage.team2Assets = this.playerService.sortListOfPlayers(this.tradePackage.team2Assets, this.tradePackage.isSuperFlex);
  }

  /**
   * opens trade calculator
   */
  openTradeCalculator(): void {
    this.tradeService.tradePackage = this.tradePackage;
    this.router.navigate(['players/trade'],
      {
        queryParams: this.leagueSwitchService.buildQueryParams()
      });
  }

  displayValueAdjustment(): string {
    if (this.tradePackage.getWhichSideIsFavored() === 0) {
      return '';
    } else {
      if (this.tradePackage.getWhichSideIsFavored() === 1) {
        return 'Favors ' +
          (this.leagueService.getTeamByUserId(this.tradePackage.team2UserId)?.owner?.ownerName || 'Team 2') +
          ' by ' + this.tradePackage.valueToEvenTrade;
      } else {
        return 'Favors ' +
          (this.leagueService.getTeamByUserId(this.tradePackage.team1UserId)?.owner?.ownerName || 'Team 1') +
          ' by ' + this.tradePackage.valueToEvenTrade;
      }
    }
  }

}
