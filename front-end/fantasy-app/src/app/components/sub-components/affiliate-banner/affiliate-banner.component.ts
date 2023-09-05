import { Component, OnInit, Input } from '@angular/core';
import { ConfigService } from 'src/app/services/init/config.service';

@Component({
  selector: 'affiliate-banner',
  templateUrl: './affiliate-banner.component.html',
  styleUrls: ['./affiliate-banner.component.css']
})
export class AffiliateBannerComponent implements OnInit {

  @Input()
  size: string = 'normal'

  @Input()
  selectedAffiliate: Affiliates = Affiliates.UNDERDOG;

  affiliateImgs: {} = {
    0: ['https://i.ibb.co/RbbfyK0/Dynasty-Daddy-Graphics-728x90-2.jpg',
      'https://i.ibb.co/xHRrbXr/Dynasty-Daddy-Graphics-728x90.jpg']
  };

  mobileImgs: {} = {
    0: ['https://i.ibb.co/VmmgJMr/Dynasty-Daddy-Graphics-320x50.jpg',
      'https://i.ibb.co/CnqJ8Sc/Dynasty-Daddy-Graphics-320x50-2.jpg']
  }

  wideImgs: {} = {
    0: ['https://i.ibb.co/FmLJwZJ/Dynasty-Daddy-Graphics-300x100-2.jpg',
      'https://i.ibb.co/wdRnhyC/Dynasty-Daddy-Graphics-300x100.jpg']
  }

  affiliateLinks: {} = {
    0: 'https://play.underdogfantasy.com/p-dynasty-daddy'
  };

  displayImg: string = '';

  constructor(public configService: ConfigService) {

  }

  ngOnInit() {
    if (!this.selectedAffiliate) {
      this.selectedAffiliate = Affiliates.UNDERDOG;
    }
    const imgs = (!this.configService.isMobile && this.size != 'small') ?
      this.affiliateImgs[this.selectedAffiliate] : this.mobileImgs[this.selectedAffiliate];
    this.displayImg = imgs[Math.round(Math.random() * imgs.length)]
  }

  openAffiliate(): void {
    window.open(this.affiliateLinks[this.selectedAffiliate], "_blank");
  }
}

export enum Affiliates {
  UNDERDOG
}