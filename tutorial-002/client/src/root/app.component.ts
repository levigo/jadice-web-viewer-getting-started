import {Component, ViewChild} from "@angular/core";
import {
    AnnotationCustomizers,
    AnnotationInstanceType,
    AnnotationProfile,
    AnnotationProfileCache,
    AnnotationProfileUtils,
    ClientConfiguration,
    DefaultToolbar,
    DocumentAnnotations,
    DocumentSource,
    GWTDocumentWrapper,
    GWTImageAnnotationWrapper,
    Upload,
    Viewer,
    ViewerType
} from "@levigo/webtoolkit-ng-client";
import {
    MultiModeViewerComponent,
    OpenFileDialogComponent,
    OpenFileTemplate,
    ThumbnailPanelComponent
} from "@levigo/ngx-webtoolkit";
import {BehaviorSubject, map, Subject, tap} from "rxjs";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ToolbarConfig, ToolbarUtils} from "@levigo/jadice-common-components";
import {Nullable} from "@levigo/utility-types";
import {I18NService} from "@levigo/ngx-translate-support";
import {FLOATING_BUTTON_CONFIG} from "./config/floating-button-config";
import {DEMO_DOCUMENTS} from "./config/demo-documents";
import {PILLBOX_CONFIG} from "./config/pillbox-config";
import {SWITCH_MODE_ACTION} from "./config/switch-mode-action";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent{
    readonly DEFAULT_PROFILE = "JWT-Demo-Profile";

    // The following variables' values are those classes that are defined in the subfolder "config"
    readonly DEMO_DOCUMENTS = DEMO_DOCUMENTS;
    readonly FLOATING_BUTTON_CONFIG = FLOATING_BUTTON_CONFIG;
    readonly PILLBOX_CONFIG = PILLBOX_CONFIG;

    // viewer mode - default mode or accessible mode for people with visual impairment?
    mode$ = new BehaviorSubject<boolean>(false);
    vieweType$ = this.mode$.pipe(map(mode => (mode ? ViewerType.ACCESSIBLE : ViewerType.RENDERED_GWT)));

    // use the default config and add the button for switching the view mode (normal/accessible)
    TOOLBAR_CONFIG: ToolbarConfig<Viewer>;

    @ViewChild("viewerComponent", {static: true})
    viewerComponent!: MultiModeViewerComponent;

    @ViewChild("thumbnailPanelComponent")
    thumbnailPanelComponent!: ThumbnailPanelComponent;

    currentDocument: GWTDocumentWrapper | null = null;

    passwordRequiredSource: DocumentSource | null = null;

    source: Nullable<DocumentSource> = null;

    displayOpenFile: boolean = true;

    annotations$ = new BehaviorSubject<DocumentAnnotations>([]);
    annotationProfile$ = new BehaviorSubject<Nullable<AnnotationProfile>>(null);

    constructor(private i18n: I18NService,
                private dialog: MatDialog) {
        i18n.init();
        this.setupAnnotations();
        this.TOOLBAR_CONFIG = {
            ...DefaultToolbar.CONFIG,
            auxiliaryActions: [
                ...(DefaultToolbar.CONFIG.auxiliaryActions as any),
                ToolbarUtils.makeButton(SWITCH_MODE_ACTION(this.mode$))
            ]
        }

    }



    private setupAnnotations() {
        AnnotationProfileCache.get().loadAndCache(this.DEFAULT_PROFILE).then((profile) => {
            this.annotationProfile$.next(profile.data);
        });

        this.annotations$.pipe(
            tap(async (annos) => {
                let annotationProfile = await AnnotationProfileUtils.getNewAnnotationProfile(annos, this.annotationProfile$.getValue());
                if (annotationProfile) {
                    this.annotationProfile$.next(annotationProfile);
                }
            })
        ).subscribe();


        AnnotationCustomizers.get().addCustomizer(a => {
            if (a.getType() === AnnotationInstanceType.IMAGE) {
                const anno = a.toDTO();
                const typeRef = AnnotationProfileUtils.parseTypeId(anno.typeId);
                if (typeRef.typeName === "JWTImageBordered") {
                    (a as GWTImageAnnotationWrapper).setImageID("qrJWTAnnoImage");
                } else if (typeRef.typeName === "JadiceImageBordered") {
                    (a as GWTImageAnnotationWrapper).setImageID("qrJadiceAnnoImage");
                }
            }
        });
    }

    setUrl(url: string) {
        this.source = {
            uri: url,
            password: null
        };
    }

    pageSelected(pageIndex: number) {
        this.viewerComponent.setCurrentPageIndex(pageIndex);
    }

    loadDocWithPassword(password: string) {
        const source = {...this.passwordRequiredSource, password} as DocumentSource;
        this.passwordRequiredSource = null;
        this.source = source;
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

    pickTemplateDoc(template: OpenFileTemplate) {
        this.displayOpenFile = false;
        this.source = {uri: template.data, password: null};
    }
}
