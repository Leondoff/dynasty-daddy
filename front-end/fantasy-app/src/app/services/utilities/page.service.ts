import { DOCUMENT } from "@angular/common";
import { Injectable, Inject } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { AdService } from "./ad.service";

@Injectable({
    providedIn: 'root'
})
export class PageService {

    DYNASTY_DADDY_BOILERPLATE = ' | Dynasty Daddy'

    DYNASTY_DADDY_IMG = 'https://i.ibb.co/XDKgxQT/SEO-Image.jpg';

    GRIDIRON_IMG = 'https://i.ibb.co/mNk4j0H/SEO-Image-1.jpg';

    defaultKeywords: string[] = ['fantasy', 'player', 'sleeper', 'rankings', 'analyzer', 'league', 'trade calulator', 'dynasty', 'redraft', 'keeper',
        'football', 'player rankings', 'free fantasy tool', 'trade analyzer', 'league analyzer', 'league power rankings', 'fantasy simulator'];

    constructor(
        private meta: Meta,
        @Inject(DOCUMENT) private doc,
        private title: Title,
        private adService: AdService,
    ) { }

    setUpPageSEO(title: string, keywords: string[], description: string, image: string = this.DYNASTY_DADDY_IMG): void {
        this.createLinkForCanonicalURL();
        if (!(title === 'Home' && new URLSearchParams(window.location.search).get('code')))
            this.adService.loadFreestarScripts();
        if (title == 'Home') {
            this.title.setTitle('Dynasty Daddy - Fantasy Football Tools, and Rankings');
        } else {
            this.title.setTitle(title + this.DYNASTY_DADDY_BOILERPLATE);
        }
        const keywordList = [...this.defaultKeywords, ...keywords];
        let img = image;
        let url = '';
        if (title.includes('Immaculate')) {
            url = 'gridiron';
            img = this.GRIDIRON_IMG;
        }
        if (this.meta.getTag('keywords')) {
            this.meta.updateTag({ name: 'keywords', content: keywordList.join(', ') });
            this.meta.updateTag({ name: 'description', content: description });
            this.meta.updateTag({ name: 'og:description', content: description });
            this.meta.updateTag({ name: 'twitter:description', content: description });
            this.meta.updateTag({ name: 'og:title', content: title });
            this.meta.updateTag({ name: 'twitter:title', content: title });
            this.meta.updateTag({ name: 'og:url', content: 'https://dynasty-daddy.com/' + url });
            this.meta.updateTag({ name: 'twitter:description', content: 'https://dynasty-daddy.com/' + url });
        } else {
            this.meta.addTags([
                { name: 'keywords', content: keywordList.join(', ') },
                { name: 'description', content: description },
                { name: 'og:title', content: title },
                { name: 'og:description', content: description },
                { name: 'og:url', content: 'https://dynasty-daddy.com/' + url },
                { name: 'og:image', content: img },
                { name: 'og:site_name', content: 'Dynasty Daddy' },
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:title', content: title },
                { name: 'twitter:description', content: description },
                { name: 'twitter:url', content: 'https://dynasty-daddy.com/' + url },
                { name: 'twitter:image', content: img },
            ]);
        }
    }

    /**
     * create canonical tags for html
     */
    private createLinkForCanonicalURL() {
        // Check if the canonical link already exists
        let existingLink = this.doc.querySelector('link[rel="canonical"]');
      
        // Strip URL parameters
        let canonicalURL = this.doc.URL.split('?')[0];
      
        if (existingLink) {
          // If it exists, update the href attribute
          existingLink.setAttribute('href', canonicalURL);
        } else {
          // If it doesn't exist, create a new link element
          let link = this.doc.createElement('link');
          link.setAttribute('rel', 'canonical');
          link.setAttribute('href', canonicalURL);
          this.doc.head.appendChild(link);
        }
      }      

}
