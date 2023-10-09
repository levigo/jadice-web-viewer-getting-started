import {Component, ViewChild} from "@angular/core";
import {ClientConfiguration, DefaultToolbar, DocumentSource, Upload, Viewer} from "@levigo/webtoolkit-ng-client";
import {MultiModeViewerComponent, OpenFileDialogComponent,} from "@levigo/ngx-webtoolkit";
import {Subject} from "rxjs";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ToolbarConfig} from "@levigo/jadice-common-components";
import {Nullable} from "@levigo/utility-types";
import {I18NService} from "@levigo/ngx-translate-support";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent {
    readonly TOOLBAR_CONFIG: ToolbarConfig<Viewer>;

    @ViewChild("viewerComponent", {static: true})
    viewerComponent!: MultiModeViewerComponent;

    source: Nullable<DocumentSource> = null;

    displayOpenFile: boolean = false;

    constructor(private i18n: I18NService,
                private dialog: MatDialog) {
        i18n.init();
        this.TOOLBAR_CONFIG = DefaultToolbar.CONFIG;
    }

    setUrl(url: string) {
        this.source = {
            uri: url,
            password: null
        };
    }

    async openFile(file: File) {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.hasBackdrop = true;
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.panelClass = "main-window";
        this.displayOpenFile = false;

        const pctDialogSubject: Subject<number> = new Subject<number>();
        try {
            dialogConfig.data = {percentage: 0, dialogSubject: pctDialogSubject, file: file.name};
            this.dialog.open(OpenFileDialogComponent, dialogConfig);
            this.source = await Upload.upload(file, pctDialogSubject, ClientConfiguration.get().getMaxUploadFileSize());
        } catch (e) {
            pctDialogSubject.error(e);
        }
    }
}
