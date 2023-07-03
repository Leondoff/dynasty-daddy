import { Component, OnInit } from '@angular/core';
import { GridGameService } from '../../services/grid.service';
import { MatDialog } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';

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

    constructor(public gridGameService: GridGameService,
        public dialog: MatDialog,
        public clipboard: Clipboard) { }

    ngOnInit(): void {
        const targetDate = new Date(this.startDate);
        const currentDate = new Date();
        const timeDiff = currentDate.getTime() - targetDate.getTime();
        this.puzzleNum = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        this.resultGrid = this.slice4x4To3x3(this.gridGameService.gridResults);
    }

    /**
    * close dialog
    */
    close(): void {
        this.dialog.closeAll();
    }

    copyResults(): void {
        const emojis = []
        for (let j = 0; j < this.resultGrid[0].length; j++) {
            const emojiRow = [];
            for (let i = 0; i < this.resultGrid.length; i++) {
                if (this.resultGrid[i][j]) {
                    emojiRow.push('green_square:')
                } else {
                    emojiRow.push('black_large_square:')
                }
            }
            emojis.push(':' + emojiRow.join(':'))
        }
        const resultStr = `Immaculate Gridiron ${this.puzzleNum}\n\n` + emojis.join('\n') + '\n\n:point_right: https://dynasty-daddy.com/gridiron';
        this.clipboard.copy(resultStr);
    }

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
                    this.score += 100;
                }
                newRow.push(matrix4x4[i][j]);
            }
            matrix3x3.push(newRow);
        }
        return matrix3x3;
    }
}
