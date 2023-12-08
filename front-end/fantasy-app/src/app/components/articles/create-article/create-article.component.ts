import { Component, OnInit } from "@angular/core";
import { BaseComponent } from "../../base-component.abstract";
import { UntypedFormControl, FormControl } from "@angular/forms";
import { ReplaySubject, Subject } from "rxjs";
import { FantasyPlayer } from "src/app/model/assets/FantasyPlayer";
import { takeUntil } from "rxjs/operators";
import { PlayerService } from "src/app/services/player.service";
import { ArticlesApiService } from "src/app/services/api/articles/articles-api.service";
import { UserService } from "src/app/services/user.service";
import { Status } from "../../model/status";

@Component({
    selector: 'app-create-article',
    templateUrl: './create-article.component.html',
    styleUrls: ['./create-article.component.scss'],
})
export class CreateArticleComponent extends BaseComponent implements OnInit {

    QuillConfiguration = {
        toolbar: [
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            ['link', 'image', 'video'],
            ['clean'],
        ]
    }

    ArticleCategories = [
        'Start/Sit',
        'Dynasty Strategy',
        'Redraft Strategy',
        'Player Discussion',
        'Injuries',
        'Rookies',
        'IDP',
        'Other'
    ]

    /** control for the selected player */
    public playerCtrl: UntypedFormControl = new UntypedFormControl();

    /** control for the MatSelect filter keyword */
    public playerFilterCtrl: FormControl = new FormControl();

    /** list of players filtered by search keyword */
    public filteredPlayers: ReplaySubject<FantasyPlayer[]> = new ReplaySubject<FantasyPlayer[]>(1);

    /** linked players in post */
    linkedPlayers: FantasyPlayer[] = [];

    /** Subject that emits when the component has been destroyed. */
    protected _onDestroy = new Subject<void>();

    /** article title */
    articleTitle: string = '';

    /** selected category */
    selectedCategory: string = '';

    /** keyword string */
    keywordString: string = '';

    articleEditorString: string = '';

    titleImageUrl: string = '';

    /** loading status for saving */
    loadingStatus: Status = Status.DONE;

    /** quill editor ref for image handling */
    quillEditorRef: any;

    constructor(private playerService: PlayerService,
        private userService: UserService,
        private articleApiService: ArticlesApiService) {
        super();
    }

    ngOnInit(): void {
        this.playerService.loadPlayerValuesForToday();
        this.playerFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterPlayers(this.playerFilterCtrl, this.filteredPlayers);
            });
    }

    removeLinkedPlayer(player: FantasyPlayer): void {
        this.linkedPlayers = this.linkedPlayers.filter(p => p.name_id !== player.name_id);
        this.filterPlayers(this.playerFilterCtrl, this.filteredPlayers);
    }

    protected filterPlayers(filterCtrl: UntypedFormControl, filterSubscription: ReplaySubject<FantasyPlayer[]>): any {
        if (!this.playerService.playerValues) {
            return;
        }

        // filter the players
        filterSubscription.next(
            this.playerService.playerValues
                .filter(player => (((player?.full_name?.toLowerCase().indexOf(filterCtrl.value.toLowerCase()) > -1
                    || player?.owner?.ownerName?.toLowerCase().indexOf(filterCtrl.value.toLowerCase()) > -1
                    || player?.position?.toLowerCase().indexOf(filterCtrl.value.toLowerCase()) > -1))
                    && ((player.position == 'PI' && player.name_id.includes('mid'))
                        || !this.linkedPlayers.map(p => p.name_id).includes(player.name_id)))).slice(0, 10));
    }

    /**
     * Add a player to linked player
     * @param player player to add
     */
    addPlayerToLinkedPlayers(player: FantasyPlayer): void {
        this.linkedPlayers.push(player)
        this.filterPlayers(this.playerFilterCtrl, this.filteredPlayers);
    }

    addTitleImage(event: any): void {
        const img = event.target.files[0] ?? null;
        if (img) {
            this.articleApiService.uploadImage(img).subscribe(title => {
                console.log(title);
                this.titleImageUrl = title
            });
        }
    }

    postArticle(status: string): void {
        this.loadingStatus = Status.LOADING;
        this.articleApiService.postArticle(
            null,
            this.userService?.user?.userId || '53401676',
            this.articleTitle,
            this.titleImageUrl,
            this.articleEditorString,
            this.keywordString.split(',').map(key => key.trim()),
            this.linkedPlayers.map(p => p.name_id),
            this.selectedCategory,
            status
        ).subscribe(res => {
            this.loadingStatus = Status.DONE;
            console.log(res)
        });
    }

    getEditorInstance(editorInstance: any) {
        this.quillEditorRef = editorInstance;

        const toolbar = this.quillEditorRef.getModule('toolbar');
        toolbar.addHandler('image', this.uploadImageHandler);
    }

    uploadImageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        input.onchange = async () => {
            const file = input.files?.length ? input.files[0] : null;

            const range = this.quillEditorRef.getSelection();

            this.articleApiService.uploadImage(file).subscribe((res: any) => {
                console.log(res)
                if (res?.status) {
                    this.quillEditorRef.insertEmbed(range.index, 'image', res?.image_url);
                }
            });
        }
    }
}
