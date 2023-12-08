import { Component, OnInit, Input, OnChanges } from "@angular/core";
import { LeagueDTO } from "src/app/model/league/LeagueDTO";
import { ConfigService } from "src/app/services/init/config.service";
import { LeagueService } from "src/app/services/league.service";
import { DisplayService } from "src/app/services/utilities/display.service";
import { LeagueSwitchService } from "../../services/league-switch.service";
import { UntypedFormControl } from "@angular/forms";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

@Component({
    selector: 'league-dropdown',
    templateUrl: './league-dropdown.component.html',
    styleUrls: ['./league-dropdown.component.scss']
})
export class LeagueDropdownComponent implements OnInit, OnChanges {

    @Input()
    leagues: LeagueDTO[] = [];

    @Input()
    leagueId: string = '';

    @Input()
    isHeader: boolean = false;

    /** leagues filter form control */
    leagueFilterCtrl: UntypedFormControl = new UntypedFormControl();

    /** Subject that emits when the component has been destroyed. */
    protected _onDestroy = new Subject<void>();

    /** filtered leagues list */
    filteredLeagues: LeagueDTO[] = [];

    constructor(
        public configService: ConfigService,
        public leagueService: LeagueService,
        public leagueSwitchService: LeagueSwitchService,
        public displayService: DisplayService
    ) { }

    ngOnInit(): void {
        this.leagueFilterCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                const searchVal = this.leagueFilterCtrl.value.toLowerCase();
                this.filteredLeagues = this.leagues?.filter(l =>
                    l.name.toLowerCase().includes(searchVal)
                    || this.displayService.getDisplayNameForPlatform(l.leaguePlatform).toLowerCase().includes(searchVal)
                    || this.displayService.getLeagueTypeFromTypeNumber(l.type).toLowerCase().includes(searchVal))
            });
    }

    ngOnChanges(): void {
        this.filteredLeagues = this.leagues;
    }

    loadLeagueFromHeader(leagueId: string): void {
        const league = this.leagueService.leagueUser.leagues.find(l => l.leagueId == leagueId);
        this.leagueSwitchService.loadLeagueWithLeagueId(league.leagueId, league.season || this.leagueService.selectedYear, league.leaguePlatform);
    }

}
