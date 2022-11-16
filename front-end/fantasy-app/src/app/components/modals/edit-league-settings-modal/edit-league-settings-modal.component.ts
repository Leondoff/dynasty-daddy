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

  selectedLeagueType: number = 2;

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
    this.isMedian = this.leagueService.selectedLeague.medianWins
  }

  reloadLeague(): void {
    this.leagueService.selectedLeague.isSuperflex = this.isSuperFlex;
    this.leagueService.selectedLeague.rosterSize = this.setRosterSize;
    this.leagueService.selectedLeague.type = this.selectedLeagueType;
    this.leagueService.selectedLeague.medianWins = this.isMedian;
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
