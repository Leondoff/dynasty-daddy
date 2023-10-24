import {Component, OnInit} from '@angular/core';
import { LeagueService } from 'src/app/services/league.service';
import { WrappedService } from '../../services/wrapped.service';
import { FadeGrowStagger, FadeSlideInOut } from '../animations/fade.animation';

@Component({
    selector: 'app-wrapped-welcome',
    templateUrl: './wrapped-welcome.component.html',
    styleUrls: ['./wrapped-welcome.component.scss'],
    animations: [FadeSlideInOut, FadeGrowStagger]
})
  export class WrappedWelcomeComponent implements OnInit {

    items = ['Welcome to','Fantasy Wrapped','for']
    showNext = false;
    showContent = false;

    constructor(private leagueService: LeagueService) {}
    
    ngOnInit(): void {
      this.items.push(this.leagueService.selectedLeague.name);
      setInterval(()=> {
        this.showContent = true;
      } ,1000);
      setInterval(()=> {
        this.showNext = true;
      } ,3000);
    }

}
