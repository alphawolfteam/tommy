import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { ApigetService, taskModel1 } from "../apiget.service";
import { AuthService } from "../auth.service";
import { EventEmiterService } from "../event.emmiter.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { LehavaDataService } from '../lehava-data.service';
import * as moment from "moment";

export interface Pnia {
  title: string;
  date: Date;
  id: number;
  time: Date;
}

@Component({
  selector: "app-tasks",
  templateUrl: "./tasks.component.html",
  styleUrls: ["./tasks.component.css"],
})
export class TasksComponent implements OnInit {
  openTasksArr: taskModel1[] = [];
  closedTasksArr: taskModel1[] = [];
  displayedTasks: taskModel1[];
  openTasksFlag: boolean = true;
  insideFlag: boolean = true;
  uUid: string;
  searchText: string = "";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public aPIgetService: ApigetService,
    public _eventEmmitter: EventEmiterService,
    public authService: AuthService,
    public taskDetailDialog: MatDialog,
    private _snackBar: MatSnackBar,
    public lehavaDataService: LehavaDataService
  ) { }

  ngOnInit() {
    this.uUid = this.authService.getUuid();
    this.setTasks();
  }

  async setTasks() {
    Promise.all([this.aPIgetService.getAllOpenSortedTasks(this.uUid),
    this.aPIgetService.getAllClosedSortedTasks(this.uUid)])
      .then((arrOfTasks) => {
        this.openTasksArr = this.arrParser(arrOfTasks[0]);
        this.closedTasksArr = this.arrParser(arrOfTasks[1]);
      }).finally(() => this.setDisplayedTasks());
  }

  jsonParser(taskObject) {
    if (taskObject) {
      const formatted_date = moment(taskObject.open_date * 1000).format(
        "HH:mm DD.MM.YYYY"
      );
      const formatted_transfer_date =taskObject.z_last_transfer_date ? moment(taskObject.z_last_transfer_date * 1000).format("HH:mm DD.MM.YYYY"): null;
      return {
        serial_id: taskObject ? taskObject["@id"] : false,
        id: taskObject ? taskObject["@COMMON_NAME"] : false,
        active: taskObject.active ? taskObject.active["@REL_ATTR"] : false,
        description: taskObject.description || false,
        status: taskObject.status ? taskObject.status["@COMMON_NAME"] : false,
        open_date: formatted_date || false,
        network: taskObject.z_network ? taskObject.z_network["@COMMON_NAME"] : false,
        service: taskObject.z_impact_service ? taskObject.z_impact_service["@COMMON_NAME"] : false,
        summary: taskObject.summary || false,
        group: taskObject.group ? taskObject.group["@COMMON_NAME"] : false,
        icon: `../../assets/${String(taskObject.status["@COMMON_NAME"]).replace('\\', '-')}.svg`,
        link: taskObject.web_url ? taskObject.web_url : "",
        type: taskObject ? taskObject.type : "",
        statusCode: taskObject ? taskObject.status['@REL_ATTR'] : "",
        lastTransferDate: formatted_transfer_date || false
      } as taskModel1;
    } else {
      return false;
    }
  }

  arrParser(tasksArray) {
    return tasksArray.map((element) => this.jsonParser(element));
  }

  setDisplayedTasks() {
    this.displayedTasks = this.openTasksFlag
      ? this.openTasksArr.concat()
      : this.closedTasksArr.concat();
  }

  openRequest() {
    this.insideFlag = !this.insideFlag;
    this.router.navigateByUrl("newtask", { relativeTo: this.route });
  }

  flipOpenTasksFlag(isOpen: boolean) {
    this.openTasksFlag = isOpen;
    this.setDisplayedTasks();
  }

  searchTextChanged(text: string) {
    this.searchText = this.stripWhiteSpaces(text.toLowerCase());
    this.openTasksFlag
      ? this.addTasksToDisplay(this.openTasksArr)
      : this.addTasksToDisplay(this.closedTasksArr);
  }

  addTasksToDisplay(tasksArray: taskModel1[]) {
    this.displayedTasks = tasksArray.filter((task: taskModel1) => {
      return this.getTaskTitle(task).toLowerCase().includes(this.searchText);
    });
  }

  stripWhiteSpaces(str) {
    return str.replace(/^\s+|\s+$/g, "");
  }

  getTaskTitle(task: taskModel1) {
    return `${task.network} - ${task.service}`;
  }

  async refresh() {
    await this.setTasks();
    this.openSnackBar("בוצע רענון", "")
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.openFromComponent(snackbarComponent, {
      duration: 2000,
      panelClass: ['refresh-snackbar']
    });
  }

}

@Component({
  selector: 'snackbarComponent',
  templateUrl: 'snackbarComponent.html'
})
export class snackbarComponent { }
