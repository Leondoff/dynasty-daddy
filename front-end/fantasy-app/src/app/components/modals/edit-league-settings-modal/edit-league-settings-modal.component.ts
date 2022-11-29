import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {LeagueService} from '../../../services/league.service';
import {LeagueSwitchService} from '../../services/league-switch.service';

@Component({
  selector: 'app-edit-league-settings-modal',
  templateUrl: './edit-league-settings-modal.component.html',
  styleUrls: ['./edit-league-settings-modal.component.css']
})
export class EditLeagueSettingsModalComponent implements OnInit {

  leagueTypes: string[] = ['Redraft', 'Keeper', 'Dynasty', 'Other'];

  scoringFormat: string[] = ['PPR', 'Half PPR', 'Standard', 'Other'];

  playoffWeeks: string[] = [
    'Week 1',
    'Week 2',
    'Week 3',
    'Week 4',
    'Week 5',
    'Week 6',
    'Week 7',
    'Week 8',
    'Week 9',
    'Week 10',
    'Week 11',
    'Week 12',
    'Week 13',
    'Week 14',
    'Week 15',
    'Week 16',
    'Week 17',
    'Week 18'
  ];

  selectedLeagueType: number = 2;

  selectedScoringFormat: number = 1;

  selectedPlayoffStartWeek: number = 15;

  setRosterSize: number = 0;

  isSuperFlex: boolean;

  isMedian: boolean;

  constructor(private dialog: MatDialog,
              private leagueSwitchService: LeagueSwitchService,
              public leagueService: LeagueService) {
  }

  ngOnInit(): void {
    this.isSuperFlex = this.leagueService.selectedLeague.isSuperflex;
    this.setRosterSize = this.leagueService.selectedLeague.rosterSize;
    this.selectedLeagueType = this.leagueService.selectedLeague.type;
    this.isMedian = this.leagueService.selectedLeague.medianWins;
    this.selectedScoringFormat = this.leagueService.selectedLeague.scoringFormat;
    this.selectedPlayoffStartWeek = this.leagueService.selectedLeague.playoffStartWeek;
  }

  reloadLeague(): void {
    this.leagueService.selectedLeague.isSuperflex = this.isSuperFlex;
    this.leagueService.selectedLeague.rosterSize = this.setRosterSize;
    this.leagueService.selectedLeague.type = this.selectedLeagueType;
    this.leagueService.selectedLeague.medianWins = this.isMedian;
    this.leagueService.selectedLeague.scoringFormat = this.selectedScoringFormat;
    this.leagueService.selectedLeague.playoffStartWeek = this.selectedPlayoffStartWeek;
    this.leagueSwitchService.loadLeague(this.leagueService.selectedLeague);
    this.closeDialog();
  }

  /**
   * close dialog
   */
  closeDialog(): void {
    this.dialog.closeAll();
  }
}
