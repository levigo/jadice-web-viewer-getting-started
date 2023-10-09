import {Component, ViewChild} from "@angular/core";
import {DefaultToolbar, DocumentSource, Viewer} from "@levigo/webtoolkit-ng-client";
import {MultiModeViewerComponent} from "@levigo/ngx-webtoolkit";
import {ToolbarConfig} from "@levigo/jadice-common-components";
import {Nullable} from "@levigo/utility-types";
import {I18NService} from "@levigo/ngx-translate-support";

// @ts-ignore
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false // for a proper fix, see https://v17.angular.io/guide/standalone-components
})
export class AppComponent {
    readonly TOOLBAR_CONFIG: ToolbarConfig<Viewer>;

    @ViewChild("viewerComponent", {static: true})
    viewerComponent!: MultiModeViewerComponent;

    source: Nullable<DocumentSource> = null;

    displayOpenFile: boolean = false;

    constructor(private i18n: I18NService) {
        i18n.init();
        this.TOOLBAR_CONFIG = DefaultToolbar.CONFIG;
    }

    protected readonly window = window;

}
