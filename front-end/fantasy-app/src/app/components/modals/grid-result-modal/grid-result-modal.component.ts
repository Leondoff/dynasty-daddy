import { Component, OnInit } from '@angular/core';
import { GridGameService } from '../../services/grid.service';
import { MatDialog } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { ConfigKeyDictionary, ConfigService } from 'src/app/services/init/config.service';

@Component({
    selector: 'grid-result-modal',
    templateUrl: './grid-result-modal.component.html',
    styleUrls: ['./grid-result-modal.component.scss']
})
export class GridResultModalComponent implements OnInit {

    resultGrid: any[][] = [];

    score: number = 0;

    startDate: string = '2023-07-01';

    puzzleNum: number;

    toggleAnswers: boolean = false;

    answerList: string[] = null;

    constructor(public gridGameService: GridGameService,
        private configService: ConfigService,
        public dialog: MatDialog,
        public clipboard: Clipboard) { }

    ngOnInit(): void {
        const targetDate = new Date(this.startDate);
        const currentDate = new Date();
        const arrStr = this.configService.getConfigOptionByKey(ConfigKeyDictionary.GRIDIRON_GRID_ANSWER)?.configValue || '[]';
        this.answerList = JSON.parse(arrStr.replace(/'/g, '"'));
        const timeDiff = currentDate.getTime() - targetDate.getTime();
        this.puzzleNum = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
        this.resultGrid = this.slice4x4To3x3(this.gridGameService.gridResults);
    }

    /**
    * close dialog
    */
    close(): void {
        this.dialog.closeAll();
    }

    copyResults = () =>
        this.clipboard.copy(this.formatMessage());

    /**
     * return 3 x 3 grid and emoji grid from game
     * @param matrix4x4 input grid
     */
    private slice4x4To3x3(matrix4x4: any[][]) {

        const matrix3x3 = [];

        for (let i = 1; i < 4; i++) {
            const newRow = [];
            for (let j = 1; j < 4; j++) {
                if (matrix4x4[i][j]) {
                    this.score += 1;
                }
                newRow.push(matrix4x4[i][j]);
            }
            matrix3x3.push(newRow);
        }
        return matrix3x3;
    }

    private formatMessage(isTweet: boolean = false): string {
        const newline = isTweet ? '%0A' : '\n';
        const emojis = []
        for (let j = 0; j < this.resultGrid[0].length; j++) {
            const emojiRow = [];
            for (let i = 0; i < this.resultGrid.length; i++) {
                if (this.resultGrid[i][j]) {
                    emojiRow.push('🟩')
                } else {
                    emojiRow.push('⬛')
                }
            }
            emojis.push(emojiRow.join(''))
        }
        let resultStr = `Immaculate Gridiron ${this.puzzleNum} ${this.score}/9${newline}${newline}`
        if (this.score === 9) {
            resultStr += 'IMMACULATE' + newline
        }
        resultStr += emojis.join(newline) + `${newline}${newline}👉 https://dynasty-daddy.com/gridiron`;
        return resultStr;
    }

    makeTweet = () =>
        window.open('https://twitter.com/share?text=' + this.formatMessage(true).replace('\n', '%0A'), '_blank')

    getAnswerForLocation = (x: number, y: number) => 
        this.answerList[(x * 3) + y]
}
