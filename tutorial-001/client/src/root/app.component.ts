import {Component, OnInit, ViewChild} from "@angular/core";
import {
    AnnotationCustomizers,
    AnnotationInstanceType,
    AnnotationProfile,
    AnnotationProfileCache,
    AnnotationProfileUtils, DefaultActions,
    DefaultToolbar,
    DocumentAnnotations,
    DocumentSource,
    GWTDocumentWrapper,
    GWTImageAnnotationWrapper,
    Viewer,
    ViewerType
} from "@levigo/webtoolkit-ng-client";
import {
    MultiModeViewerComponent,
    OpenFileTemplate,
    ThumbnailPanelComponent,
    UploadDialogsWrapperComponent
} from "@levigo/ngx-webtoolkit";
import {BehaviorSubject, map, tap} from "rxjs";
import {MenuItemType, ToolbarConfig, ToolbarUtils} from "@levigo/jadice-common-components";
import {Nullable} from "@levigo/utility-types";
import {I18NService} from "@levigo/ngx-translate-support";
import {FLOATING_BUTTON_CONFIG} from "./config/floating-button-config";
import {DEMO_DOCUMENTS} from "./config/demo-documents";
import {PILLBOX_CONFIG} from "./config/pillbox-config";
import {SWITCH_MODE_ACTION} from "./config/switch-mode-action";
import {I18N} from "@levigo/jadice-i18n-support";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit{
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

    @ViewChild("uploadDialogsWrapper")
    uploadDialogsWrapper!: UploadDialogsWrapperComponent;

    currentDocument: GWTDocumentWrapper | null = null;

    passwordRequiredSource: DocumentSource | null = null;

    source: Nullable<DocumentSource> = null;

    displayOpenFile: boolean = true;

    annotations$ = new BehaviorSubject<DocumentAnnotations>([]);
    annotationProfile$ = new BehaviorSubject<Nullable<AnnotationProfile>>(null);

    constructor(private i18n: I18NService) {
        i18n.init();
        this.setupAnnotations();
        // configures the toolbar, esp. for a correct file opening and a correct switch between normal / accessible mode
        this.TOOLBAR_CONFIG =
            {
            ...DefaultToolbar.CONFIG,
            menu: {
                ...DefaultToolbar.CONFIG.menu,
                menuConfiguration: {
                    menuItems: [
                        {
                            type: MenuItemType.ACTION,
                            action: {
                                ...DefaultActions.OPEN_FILE,
                                handle: () => {
                                    this.displayOpenFile = true;
                                }
                            }
                        },
                        ...DefaultToolbar.CONFIG.menu.menuConfiguration.menuItems.slice(1)
                    ]
                }
            },
            auxiliaryActions: [
                ...(DefaultToolbar.CONFIG.auxiliaryActions as any),
                ToolbarUtils.makeButton(SWITCH_MODE_ACTION(this.mode$))
            ]
        }
    }

    ngOnInit(): void {
        // This is doing all the wiring for the different events, that can happen when trying to open a file
        this.viewerComponent.getViewer$().pipe().forEach(v => {
            const wrapper = this.uploadDialogsWrapper;

            v?.addErrorObserver({
                complete(): void {
                    v?.clearErrorObservers();
                }, error(err: any): void {
                    console.log("while trying to report an error, another error came on top: " + err);
                }, next(error: any): void {
                    let completeText = I18N.get().translateOnce("webtoolkitClient.document.documentLoadingError");
                    if (error && error.className && error.className.toLowerCase().includes("exception")) {
                        const message = error.message;
                        if (message && (typeof message === "string")) {
                            completeText += "\r\n" + message;
                        }
                    }
                    wrapper.errorMessage = completeText;
                    wrapper.displayErrorDialog = true;
                }
            });
        });
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
        this.displayOpenFile = false;

        this.uploadDialogsWrapper.openFile(file).then(s => {
            if (s != null) {
                this.source = s;
            }
        });
    }

    pickTemplateDoc(template: OpenFileTemplate) {
        this.displayOpenFile = false;
        this.source = {uri: template.data, password: null};
    }
}
