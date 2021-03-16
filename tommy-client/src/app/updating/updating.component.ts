import { Component, OnInit } from "@angular/core";
import { ApigetService } from "../apiget.service";
import * as moment from "moment";
import { BottomUpdateDetailSheet } from "./update-detail/update-detail.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";

export interface Update {
  date: string;
  text: string;
}
@Component({
  selector: "app-updating",
  templateUrl: "./updating.component.html",
  styleUrls: ["./updating.component.css"],
})
export class UpdatingComponent implements OnInit {
  updatesArray: any[];
  noUpdatesFlag: boolean;

  constructor(
    public apiget: ApigetService,
    private _bottomSheet: MatBottomSheet
  ) {}

  ngOnInit() {
    this.noUpdatesFlag = false;
    this.setUpdates();
  }

  setUpdates() {
    this.apiget.getUpdates().subscribe((res: any) => {
      let Response = res.collection_in?.in;
      if (Response === undefined) {
        this.noUpdatesFlag = true;
        return;
      }
      if (Response) {
        this.updatesArray = [];
        if (Array.isArray(Response)) {
          Response.map((update: any) => {
            const formatted_date = moment(update.open_date * 1000).format(
              "HH:mm · DD.MM.YYYY"
            );
            this.updatesArray.push({
              name: update.category["@COMMON_NAME"].replace(/\./g, " ") || null,
              summary: update.summary || null,
              open_date: formatted_date || null,
              z_network: update.z_network
                ? update.z_network["@COMMON_NAME"] || false
                : false,
              description: update.description || null,
            });
          });
        } else {
          let updateDate = new Date(Response.open_date * 1000);
          const formatted_date = moment(Response.open_date * 1000).format(
            "HH:mm · DD.MM.YYYY"
          );
          this.updatesArray.push({
            name: Response.category["@COMMON_NAME"].replace(/\./g, " ") || null,
            summary: Response.summary || null,
            open_date: formatted_date || null,
            z_network: Response.z_network
              ? Response.z_network["@COMMON_NAME"] || false
              : false,
            description: Response.description || null,
          });
        }
      }
    });
  }

  openBottomSheet(updateObj): void {
    this._bottomSheet.open(BottomUpdateDetailSheet, { data: updateObj });
  }
}
