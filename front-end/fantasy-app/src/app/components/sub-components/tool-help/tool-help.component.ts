import { OnInit, Component, Input } from "@angular/core";
import { SimpleTextModal } from "../simple-text-modal/simple-text-modal.component";
import { ConfigService } from "src/app/services/init/config.service";
import { MatDialog } from "@angular/material/dialog";
import { FooterTutorial, LeagueFormatTutorial, PlayoffCalculatorTutorial, PowerRankingsTutorial, SimpleTextCategory, TradeCalculatorTutorial } from "src/app/model/toolHelpModel";

@Component({
    selector: 'tool-help',
    templateUrl: './tool-help.component.html',
    styleUrls: ['./tool-help.component.scss']
})
export class ToolHelpComponent implements OnInit {

    @Input()
    toolName: ToolsHelp;

    categoryList: SimpleTextCategory[] = [];

    constructor(private configService: ConfigService,
        private dialog: MatDialog) {

    }

    ngOnInit(): void {
        switch (this.toolName) {
            case ToolsHelp.PlayoffCalculator:
                this.categoryList = PlayoffCalculatorTutorial;
                break;
            case ToolsHelp.LeagueFormat:
                this.categoryList = LeagueFormatTutorial;
                break;
            case ToolsHelp.TradeCalculator:
                this.categoryList = TradeCalculatorTutorial;
                break;
            default:
                this.categoryList = PowerRankingsTutorial;
        }
        this.categoryList.push(...FooterTutorial);
    }

    /**
     * Open how to play modal
     */
    openHowTo(): void {
        this.dialog.open(SimpleTextModal
            , {
                minHeight: '350px',
                minWidth: this.configService.isMobile ? '200px' : '500px',
                data: {
                    headerText: 'How to use ' + this.toolName,
                    categoryList: this.categoryList
                }
            }
        );
    }
}

enum ToolsHelp {
    PowerRankings = "Power Rankings",
    PlayoffCalculator = "Playoff Calculator",
    LeagueFormat = 'League Format',
    TradeCalculator = 'Trade Calculator',
};