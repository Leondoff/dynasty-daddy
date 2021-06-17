import {Component, OnInit} from '@angular/core';
import {SleeperService} from '../../services/sleeper.service';
import {PlayoffCalculatorService} from '../services/playoff-calculator.service';
import {SleeperTeam} from '../../model/SleeperLeague';
import {MatchupService} from '../services/matchup.service';
import {PowerRankingsService} from "../services/power-rankings.service";
import {PlayerService} from "../../services/player.service";

@Component({
  selector: 'app-playoff-calculator',
  templateUrl: './playoff-calculator.component.html',
  styleUrls: ['./playoff-calculator.component.css']
})
export class PlayoffCalculatorComponent implements OnInit {

  constructor(public sleeperService: SleeperService,
              public playoffCalculatorService: PlayoffCalculatorService,
              public matchupService: MatchupService,
              private powerRankingService: PowerRankingsService,
              private playersService: PlayerService) {
  }

  divisionTableCols = ['teamName', 'record', 'pf', 'pot'];

  ngOnInit(): void {}

  roundNumber(num: number): number {
    return Math.round(num);
  }

  getPointPotentialPercent(team: SleeperTeam): number {
    return Math.round(team.roster.teamMetrics.fpts / team.roster.teamMetrics.ppts * 100);
  }
}
