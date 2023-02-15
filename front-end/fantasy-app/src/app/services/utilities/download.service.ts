import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DownloadService {

    /** footnote for downloaded files */
    DynastyDaddyFooter = "\n\nData Exported from dynasty-daddy.com."

    constructor() {
    }

    /**
     * Formats csv from data and file name then downloads
     * @param csvData csv data to download
     * @param filename file name of file to create
     */
    downloadCSVFile(csvData: string, filename: string): void {
        csvData += this.DynastyDaddyFooter;
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        let navigator: any = window.navigator;
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
}
