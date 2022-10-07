import {Component, Input, OnInit} from '@angular/core';
import {MatchUpProbability} from '../../../model/playoffCalculator';
import {SleeperTeam} from '../../../../model/SleeperLeague';
import {SleeperService} from '../../../../services/sleeper.service';
import {ColorService} from '../../../services/color.service';
import {DisplayService} from '../../../../services/utilities/display.service';
import {LeagueSwitchService} from '../../../services/league-switch.service';
import {NflService} from '../../../../services/utilities/nfl.service';

@Component({
  selector: 'app-playoff-calculator-games-card',
  templateUrl: './playoff-calculator-games-card.component.html',
  styleUrls: ['./playoff-calculator-games-card.component.css']
})
export class PlayoffCalculatorGamesCardComponent implements OnInit {

  /** match up details with probability */
  @Input()
  game: MatchUpProbability;

  /** show header info */
  @Input()
  showHeader: boolean = true;

  /** is week completed or not */
  @Input()
  isCompleted: boolean = false;

  /** team 1 sleeper object */
  team1: SleeperTeam;

  /** team 2 sleeper object */
  team2: SleeperTeam;

  /** color gradient for prob */
  probGradient: string[];

  constructor(private sleeperService: SleeperService,
              private nflService: NflService,
              private colorService: ColorService,
              public displayService: DisplayService,
              public leagueSwitchService: LeagueSwitchService) {
  }

  ngOnInit(): void {
    this.team1 = this.sleeperService.getTeamByRosterId(this.game?.matchUpDetails.team1RosterId);
    this.team2 = this.sleeperService.getTeamByRosterId(this.game?.matchUpDetails.team2RosterId);
    this.probGradient = this.colorService.getColorGradientArray(100, '#7f7f7f', '#0173aa');
  }

  /** get color for percent */
  getProbColor(prob: number): string {
    return this.probGradient[prob];
  }
}
