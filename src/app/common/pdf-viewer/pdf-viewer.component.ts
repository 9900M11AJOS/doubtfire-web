import { HttpResponse } from '@angular/common/http';
import { Component, Input, Inject, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { FileDownloaderService } from '../file-downloader/file-downloader';

@Component({
  selector: 'f-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent implements OnDestroy, OnChanges {
  private _pdfUrl: string;
  public pdfBlobUrl: string;
  public progressPercentage = 0;
  @Input() pdfUrl: string;

  constructor(
    @Inject(FileDownloaderService) private fileDownloader: FileDownloaderService,
    @Inject(alertService) private alerts: any
  ) {}

  ngOnDestroy(): void {
    if (this.pdfBlobUrl) {
      this.fileDownloader.releaseBlob(this.pdfBlobUrl);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.pdfUrlChanges(changes.pdfUrl.currentValue);
  }

  pdfUrlChanges(value: string): void {
    if (this._pdfUrl !== value) {
      // Free the memory used by the old PDF blob
      if (this.pdfBlobUrl) {
        this.fileDownloader.releaseBlob(this.pdfBlobUrl);
        this.pdfBlobUrl = null;
      }

      // Get the new blob
      this._pdfUrl = value;
      this.downloadBlob(value);
    }
  }

  private downloadBlob(downloadUrl: string): void {
    this.fileDownloader.downloadBlob(
      downloadUrl,
      (url: string, response: HttpResponse<Blob>) => {
        this.pdfBlobUrl = url;
      },
      (error: any) => {
        this.alerts.add('danger', `Error downloading PDF. ${error}`, 6000);
      }
    );
  }

  onProgress(progressData: { loaded; total }) {
    this.progressPercentage = Math.round((progressData.loaded / progressData.total) * 100);
  }

  onLoaded() {
    window.dispatchEvent(new Event('resize'));
  }
}
