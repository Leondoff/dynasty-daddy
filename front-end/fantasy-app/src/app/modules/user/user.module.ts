import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { UserSettingsComponent } from "src/app/components/user-settings/user-settings.component";
import { SharedModule } from "../shared/shared.module";

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild([
            { path: 'settings', component: UserSettingsComponent }
        ]),
    ],
    declarations: [
        UserSettingsComponent
    ]
})
export class UserModule {
}
