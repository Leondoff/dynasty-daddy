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
    0: ['assets/ads/DynastyDaddy_Graphics_728x90_2.jpg',
      'assets/ads/DynastyDaddy_Graphics_728x90.jpg']
  };

  mobileImgs: {} = {
    0: ['assets/ads/DynastyDaddy_Graphics_320x50.jpg',
      'assets/ads/DynastyDaddy_Graphics_320x50_2.jpg']
  }

  wideImgs: {} = {
    0: ['assets/ads/DynastyDaddy_Graphics_300x100_2.jpg',
      'assets/ads/wdRnhyC/DynastyDaddy_Graphics_300x100.jpg']
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