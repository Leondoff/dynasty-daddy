import { Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";

@Injectable({
    providedIn: 'root'
})
export class PageService {

    DYNASTY_DADDY_BOILERPLATE = ' | Dynasty Daddy'

    DYNASTY_DADDY_IMG = 'https://i.ibb.co/XDKgxQT/SEO-Image.jpg';

    GRIDIRON_IMG = 'https://i.ibb.co/mNk4j0H/SEO-Image-1.jpg';

    constructor(
        private meta: Meta,
        private title: Title) {}

    setUpPageSEO(title: string, keywords: string[], description: string): void {
        this.title.setTitle(title + this.DYNASTY_DADDY_BOILERPLATE);
        let img = this.DYNASTY_DADDY_IMG;
        let url = '';
        if (title.includes('Immaculate')) {
            url = 'gridiron';
            img = this.GRIDIRON_IMG;
        }
        if (this.meta.getTag('keywords')) {
            this.meta.updateTag({ name: 'keywords', content: keywords.join(', ') });
            this.meta.updateTag({ name: 'description', content: description });
            this.meta.updateTag({ name: 'og:description', content: description});
            this.meta.updateTag({ name: 'twitter:description', content: description});
            this.meta.updateTag({ name: 'og:title', content: title});
            this.meta.updateTag({ name: 'twitter:title', content: title});
            this.meta.updateTag({ name: 'og:url', content: 'https://dynasty-daddy.com/' + url});
            this.meta.updateTag({ name: 'twitter:description', content: 'https://dynasty-daddy.com/' + url});
        } else {
            this.meta.addTags([
                { name: 'keywords', content: keywords.join(', ') },
                { name: 'description', content: description },
                { name: 'og:title', content: title},
                { name: 'og:description', content: description},
                { name: 'og:url', content: 'https://dynasty-daddy.com/' + url},
                { name: 'og:image', content: img},
                { name: 'og:site_name', content: 'Dynasty Daddy'},
                { name: 'twitter:card', content: 'summary_large_image'},
                { name: 'twitter:title', content: title},
                { name: 'twitter:description', content: description},
                { name: 'twitter:url', content: 'https://dynasty-daddy.com/' + url},
                { name: 'twitter:image', content: img},
            ]);    
        }
    }
}
