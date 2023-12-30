import { Clipboard } from "@angular/cdk/clipboard";
import { Component, OnInit, Input, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ConfigService } from "src/app/services/init/config.service";

@Component({
    selector: 'share-socials',
    templateUrl: './share-socials.component.html',
    styleUrls: ['./share-socials.component.scss']
})
export class ShareSocialsComponent implements OnInit {

    @Input()
    buttons: any[];

    @Input()
    postTitle: string;

    @Input()
    postUrl: string;

    @Input()
    description: string;

    buttonList: any[] = [];

    private readonly POST_TITLE = '[post-title]';

    private readonly POST_URL = '[post-url]';

    constructor(private configService: ConfigService,
        @Inject(MAT_DIALOG_DATA) public data: {
            buttons: string[],
            postTitle: string,
            postUrl: string,
            description: string
        },
        public clipboard: Clipboard) {

    }

    ngOnInit(): void {
        this.buttons = this.buttons || this.data.buttons || ['copy', 'facebook', 'twitter', 'reddit', 'email', 'print'];
        this.postTitle = this.postTitle || this.data.postTitle || 'Dynasty Daddy - Fantasy Football';
        this.postUrl = this.postUrl || this.data.postUrl || 'https://dynasty-daddy.com';
        this.description = this.description || this.data.description
            || 'Check out Dynasty Daddy. It\'s a free all-in-one fantasy football site for redraft and dynasty leagues!';
        this.buttonList = this.buttons.map(b => SHARE_BUTTONS[b]);
    }


    createShareLink(social: any): string {
        const baseURL = this.configService.isMobile ? social.share.mobile || social.share.desktop : social.share.desktop;
        const encodedURL = encodeURIComponent(this.linkInDescription(social))
        return baseURL.replace(this.POST_TITLE, this.postTitle)
            .replace(this.POST_URL, encodedURL);
    }

    shareOnSocial(social: any): void {
        switch (social.type) {
            case 'copy':
                this.clipboard.copy(this.postUrl);
                break;
            case 'print':
                document.defaultView.print();
                break;
            default:
                const link = this.createShareLink(social);
                window.open(link, "_blank");
        }
    }
    // Create message body that includes the sharing link used for Email, SMS and WhatsApp buttons
    linkInDescription(social: any): string {
        return !['facebook', 'linkedin', 'messenger'].includes(social.type) ? `${this.description}\r\n\n${this.postUrl}` : this.postUrl;
    };

}

export const SHARE_BUTTONS: any = {
    facebook: {
        type: 'facebook',
        text: 'Facebook',
        ariaLabel: 'Share on Facebook',
        icon: 'assets/socials/facebook.svg',
        color: '#4267B2',
        share: {
            desktop: 'https://www.facebook.com/sharer/sharer.php?u=[post-url]&t=[post-title]'
        }
    },
    twitter: {
        type: 'twitter',
        text: 'X/Twitter',
        ariaLabel: 'Share on X',
        icon: 'assets/socials/x-twitter.svg',
        color: 'black',
        share: {
            desktop: 'https://twitter.com/share?text=[post-url]'
        }
    },
    instagram: {
        type: 'instagram',
        text: 'Instagram',
        ariaLabel: 'Share on Instagram',
        icon: 'assets/socials/instagram.svg',
        color: '#E1306C',
        share: {
            desktop: 'https://instagram.com/accounts/login/?text=[post-url]'
        }
    },
    linkedin: {
        type: 'linkedin',
        text: 'LinkedIn',
        ariaLabel: 'Share on LinkedIn',
        icon: 'assets/socials/linkedin.svg',
        color: '#006fa6',
        share: {
            desktop: 'https://www.linkedin.com/shareArticle?url=[post-url]&title=[post-title]'
        }
    },
    reddit: {
        type: 'reddit',
        text: 'Reddit',
        ariaLabel: 'Share on Reddit',
        icon: 'assets/socials/reddit.svg',
        color: '#FF4006',
        share: {
            desktop: 'https://www.reddit.com/submit?title=[post-title]&url=[post-url]'
        }
    },
    messenger: {
        type: 'messenger',
        text: 'Messenger',
        ariaLabel: 'Share on Messenger',
        icon: 'assets/socials/messenger.svg',
        color: '#0080FF',
        share: {
            desktop: 'https://www.facebook.com/dialog/send?link=[post-url]',
            mobile: 'fb-messenger://share/?link=[post-url]',
        }
    },
    whatsapp: {
        type: 'whatsapp',
        text: 'WhatsApp',
        ariaLabel: 'Share on WhatsApp',
        icon: 'assets/socials/whatsapp.svg',
        color: '#25D366',
        share: {
            desktop: 'https://api.whatsapp.com/send?link=[post-url]&description=[post-title]',
        }
    },
    sms: {
        type: 'sms',
        text: 'SMS',
        ariaLabel: 'Share link via SMS',
        icon: 'assets/socials/sms.svg',
        color: '#20c16c',
        share: {
            desktop: 'sms:?body=[post-url]',
            mobile: 'sms:&body=[post-url]'
        }
    },
    email: {
        type: 'email',
        text: 'Email',
        ariaLabel: 'Share link via email',
        icon: 'assets/socials/email.svg',
        color: '#FF961C',
        share: {
            desktop: 'mailto:?subject=[post-title]&body=[post-url]'
        }
    },
    print: {
        type: 'print',
        text: 'Print',
        ariaLabel: 'Print page',
        icon: 'assets/socials/print.svg',
        color: '#765AA2',
    },
    copy: {
        type: 'copy',
        text: 'Copy link',
        ariaLabel: 'Copy link',
        icon: 'assets/socials/clipboard.svg',
        color: '#607D8B',
    }
};
