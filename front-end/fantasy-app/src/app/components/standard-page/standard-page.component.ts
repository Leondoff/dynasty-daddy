import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ConfigService, LocalStorageDictionary } from 'src/app/services/init/config.service';
import { LeagueSwitchService } from '../services/league-switch.service';

@Component({
  selector: 'app-standard-page',
  templateUrl: './standard-page.component.html',
  styleUrls: ['./standard-page.component.css']
})
export class StandardPageComponent implements AfterViewInit {

  isDrawerOpen = localStorage.getItem(LocalStorageDictionary.SIDEBAR_LOCK_ITEM) === 'true';

  @ViewChild('drawer') drawer: any;

  constructor(public configService: ConfigService,
    public leagueSwitchService: LeagueSwitchService) {
  }

  ngAfterViewInit(): void {
    if (this.isDrawerOpen) {
      this.drawer.open();
    }
  }

}
