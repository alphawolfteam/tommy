import { Component, Inject } from "@angular/core";
import Cookies from "js-cookie";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";

@Component({
  selector: "app-task-detail",
  templateUrl: "./tom-alert-dialog.component.html",
  styleUrls: ["./tom-alert-dialog.component.css"],
})
export class TomAlertDialog {
  constructor(
    public dialogRef: MatDialogRef<TomAlertDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  cancelClick(): void {
    this.dialogRef.close();
  }

  continueClick(): void {
    this.dialogRef.close();
    this.data.continue();
  }

  dontShowAgain(checked): void {
    Cookies.set("checkedMerkazTomAlert", checked);
  }
}
