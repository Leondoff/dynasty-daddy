import { Component, OnInit } from '@angular/core';
import { AdService } from 'src/app/services/utilities/ad.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(private adService: AdService) { }

  ngOnInit(): void {
    this.adService.loadFreestarScripts();
  }

}
