// @ts-ignore
import { Component, OnInit } from '@angular/core';
import { ConfigService } from './services/init/config.service';
import { PwaService } from './services/utilities/pwa.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'dynasty-daddy';

  constructor(
    public configService: ConfigService,
    public pwa: PwaService) {
  }

  ngOnInit(): void {
    this.configService.checkIfMobile();
  }
}
