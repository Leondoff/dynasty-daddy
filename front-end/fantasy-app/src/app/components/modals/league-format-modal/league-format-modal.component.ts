import { Component, EventEmitter, OnInit } from "@angular/core";
import { LeagueFormatService } from "../../services/league-format.service";
import { MatDialog } from "@angular/material/dialog";
import { ConfigService } from "src/app/services/init/config.service";
import { NflService } from "src/app/services/utilities/nfl.service";
import { Options, LabelType } from "@angular-slider/ngx-slider";


@Component({
    selector: 'app-league-format-modal',
    templateUrl: './league-format-modal.component.html',
    styleUrls: ['./league-format-modal.component.scss']
})
export class LeagueFormatModalComponent implements OnInit {

    earliestSeason: number = 2019;

    selectableSeasons: number[] = [];

    manualRefresh: EventEmitter<void> = new EventEmitter<void>();
    options: Options = {
      floor: 1,
      ceil: 17,
      translate: (value: number, label: LabelType): string => {
        switch (label) {
          case LabelType.Low:
            return "<b>Start Week:</b> " + value;
          case LabelType.High:
            return "<b>End Week:</b> " + value;
          default:
            return "" + value;
        }
      }
    };

    constructor(
        public leagueFormatService: LeagueFormatService,
        public configService: ConfigService,
        private nflService: NflService,
        private dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.selectableSeasons = this.getSelectableSeasons(this.nflService.getYearForStats());
        this.emitManualRefresh();
    }

    /**
     * close dialog
     */
    close(): void {
        this.dialog.closeAll();
    }

    /**
   * Generate selectable seasons in league format tool
   * @param number start year string
   */
    getSelectableSeasons(number: string) {
        const result = [];
        for (let i = Number(number); i >= this.earliestSeason; i--) {
            result.push(i);
        }
        return result;
    }

    /**
     * adds all query results to comp table
     */
    applyFilter(): void {
        this.leagueFormatService.loadLeagueFormat();
        this.close();
    }

    displayWithFormatter(value: number | null): string | null {
        return value !== null ? `${value}%` : null;
    }

    // It is used to fix a known issue with ngx slider
    emitManualRefresh() {
      setTimeout(() => {
        this.manualRefresh.emit();
      }, 300);
    }
}