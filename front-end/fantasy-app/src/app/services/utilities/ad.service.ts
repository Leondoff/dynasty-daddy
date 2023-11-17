import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root',
})
export class AdService {
  constructor(@Inject(DOCUMENT) private document: Document,
  private userService: UserService) {}

  loadFreestarScripts(): void {
    // if patreon don't show ads
    if (this.userService.user) {
        return;
    }
    const head = this.document.head;

    // Create and append link elements
    const linkUrls = [
      'https://a.pub.network/dynasty-daddy-com/cls.css',
    ];

    linkUrls.forEach((url) => {
      const link = this.document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      head.appendChild(link);
    });

    // Create and append script elements
    const scriptUrls = [
      'https://a.pub.network/dynasty-daddy-com/pubfig.min.js',
    ];

    scriptUrls.forEach((url) => {
      const script = this.document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;
      script.charset = 'utf-8';
      head.appendChild(script);
    });

    // Create and append inline script
    const inlineScript = this.document.createElement('script');
    inlineScript.type = 'text/javascript';
    inlineScript.text = `
      var freestar = freestar || {};
      freestar.queue = freestar.queue || [];
      freestar.config = freestar.config || {};
      freestar.config.enabled_slots = [];
      freestar.config.disabledProducts = {
        sideWall: false
      };
      freestar.initCallback = function () { (freestar.config.enabled_slots.length === 0) ? freestar.initCallbackCalled = false : freestar.newAdSlots(freestar.config.enabled_slots) }
    `;
    head.appendChild(inlineScript);
  }
}
