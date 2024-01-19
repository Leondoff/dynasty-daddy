import { AfterViewInit, Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { ConfigService, LocalStorageDictionary } from 'src/app/services/init/config.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-standard-page',
  templateUrl: './standard-page.component.html',
  styleUrls: ['./standard-page.component.css']
})
export class StandardPageComponent implements OnInit, AfterViewInit {

  isDrawerOpen = localStorage.getItem(LocalStorageDictionary.SIDEBAR_LOCK_ITEM) === 'true';

  @ViewChild('drawer') drawer: any;

  @ViewChild('drawerTool') drawerTool: any;

  isLargeContainer: boolean = false;

  constructor(public configService: ConfigService,
    private router: Router,
    private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.configService.toggleToolbar$.subscribe(toolbar => {
      if (!this.drawerTool.opened) {
        this.drawerTool.open();
      } else {
        this.drawerTool.close();
      }
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.isLargeContainer = window.location.href.includes('league/draft');
    if (this.isDrawerOpen) {
      this.drawer.open();
    }
    if (window.location.href.includes('league/draft') && !this.configService.isMobile) {
      if (this.drawerTool)
        this.drawerTool.open();
    } else {
      this.drawerTool.close();
    }
    if (!this.configService.isMobile) {
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.isLargeContainer = window.location.href.includes('league/draft');
          if (window.location.href.includes('league/draft') && !this.configService.isMobile) {
            if (this.drawerTool)
              this.drawerTool.open();
          } else {
            this.drawerTool.close();
          }
          this.cdr.markForCheck();
        });
    }
  }
}
