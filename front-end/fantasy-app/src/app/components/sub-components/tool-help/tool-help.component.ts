import { OnInit, Component, Input } from "@angular/core";
import { SimpleTextModalComponent } from "../simple-text-modal/simple-text-modal.component";
import { ConfigService } from "src/app/services/init/config.service";
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: 'tool-help',
    templateUrl: './tool-help.component.html',
    styleUrls: ['./tool-help.component.scss']
})
export class ToolHelpComponent implements OnInit {

    @Input()
    toolName: ToolsHelp;

    constructor(private configService: ConfigService,
        private dialog: MatDialog) {

    }

    ngOnInit(): void {
    }

    /**
     * Open how to play modal
     */
    openHowTo(): void {
        this.configService.loadDocumentation(this.toolName.toLowerCase().replace(/ /g, '_'))
            .subscribe(data => {
                this.dialog.open(SimpleTextModalComponent
                    , {
                        minHeight: '350px',
                        minWidth: this.configService.isMobile ? '200px' : '500px',
                        data: {
                            headerText: 'How to use ' + this.toolName,
                            categoryList: data
                        }
                    }
                );
            });
    }
}

enum ToolsHelp {
    PowerRankings = "Power Rankings",
    PlayoffCalculator = "Playoff Calculator",
    LeagueFormat = 'League Format',
    TradeCalculator = 'Trade Calculator',
    TradeDatabase = 'Trade Database',
    DynastyDaddyClub = 'Dynasty Daddy Club',
    ESPNValues = 'these ESPN values',
    MockDraft = 'Fantasy Mock Draft Tool'
};