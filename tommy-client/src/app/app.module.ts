import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatButtonModule } from "@angular/material/button";
import { TasksComponent } from "./tasks/tasks.component";
import { MatGridListModule } from "@angular/material/grid-list";
import { UpdatingComponent } from "./updating/updating.component";
import { MatListModule } from "@angular/material/list";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { HomeComponent } from "./home/home.component";
import { TaskDetailDialog } from "./task-detail/task-detail.component";
import {
  MatDialogModule,
  MAT_DIALOG_DEFAULT_OPTIONS,
} from "@angular/material/dialog";
import { MatExpansionModule } from "@angular/material/expansion";
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { EventEmiterService } from "./event.emmiter.service";
import { AuthService } from "./auth.service";
import { HeaderComponent } from "./header/header.component";
import { PreloaderComponent } from "./preloader/preloader.component";
import { OpenRequestModule } from "./open-request/open-request.module";
import { StatusProgressComponent } from "./task-detail/status-progress/status-progress.component";
import { TomAlertDialog } from "./tasks/tom-alert-dialog/tom-alert-dialog.component";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { ChatComponent } from "./chat/chat.component";
import { ErrorComponent } from "./errorpage/errorpage.component";
import { TasksListComponent } from "./tasks/tasks-list/tasks-list.component";
import { SharedModule } from "./shared.module";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { BottomUpdateDetailSheet } from "./updating/update-detail/update-detail.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatCheckboxModule } from "@angular/material";

@NgModule({
  declarations: [
    AppComponent,
    TasksComponent,
    UpdatingComponent,
    HomeComponent,
    TaskDetailDialog,
    HeaderComponent,
    PreloaderComponent,
    StatusProgressComponent,
    TaskDetailDialog,
    ChatComponent,
    TasksListComponent,
    BottomUpdateDetailSheet,
    TomAlertDialog,
    ErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatExpansionModule,
    MatButtonModule,
    MatGridListModule,
    MatListModule,
    ScrollingModule,
    HttpClientModule,
    MatDialogModule,
    CommonModule,
    MatDialogModule,
    OpenRequestModule,
    MatInputModule,
    FormsModule,
    DragDropModule,
    SharedModule,
    MatBottomSheetModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatCheckboxModule,
  ],
  providers: [
    EventEmiterService,
    AuthService,
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
