import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {WebtoolkitModule} from "@levigo/ngx-webtoolkit";
import {TranslateModule} from "@ngx-translate/core";
import {MatOptionModule} from "@angular/material/core";
import {MatDialogModule} from "@angular/material/dialog";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {RouterModule} from "@angular/router";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        TranslateModule.forRoot(),
        WebtoolkitModule.forRoot(),
        BrowserAnimationsModule,
        MatDialogModule,
        MatOptionModule,
        RouterModule.forRoot([]),
    ],
    providers: [],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
}
