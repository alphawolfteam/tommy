import { Component, Input } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { taskModel1, ApigetService } from "../../apiget.service";
import { TaskDetailDialog } from "../../task-detail/task-detail.component";
import { HomeComponent } from "./../../home/home.component";
import { TasksComponent } from "../../tasks/tasks.component";
import { TomAlertDialog } from "../tom-alert-dialog/tom-alert-dialog.component";
import Cookies from "js-cookie";
import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatTooltipDefaultOptions,
} from "@angular/material/tooltip";
import { HiChatService } from 'src/app/hichat.service';

export const myCustomTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 500,
  hideDelay: 0,
  touchendHideDelay: 500,
};

interface ParamsI {
  type: "chg" | "in";
  id: string;
  status: "CNCL" | "CL" | "REOPEN" | "NSCC";
}

@Component({
  selector: "app-tasks-list",
  templateUrl: "./tasks-list.component.html",
  styleUrls: ["./tasks-list.component.css"],
  providers: [
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: myCustomTooltipDefaults },
  ],
})
export class TasksListComponent {
  @Input() tasks: taskModel1[];
  @Input() tasksFlag: boolean;
  chatIcon: string = "../../../assets/supporter-logo.png";
  closeIcon: string = "../../../assets/close.png";
  doneIcon: string = "../../../assets/done.png";
  redoIcon: string = "../../../assets/redo.png";
  trashIcon: string = "../../../assets/trash.png";
  constructor(
    public taskDetailDialog: MatDialog,
    public aPIgetService: ApigetService,
    public tasksComponent: TasksComponent,
    public merkazTomAlert: MatDialog,
    public hiChatService: HiChatService
  ) {}

  openTaskDetailDialog(selectedTask) {
    this.taskDetailDialog.open(TaskDetailDialog, {
      width: "720px",
      height: "400px",
      data: selectedTask,
    });
  }

  getNetwork(task: taskModel1): string | boolean {
    return task.network || "לא צויין";
  }

  getService(task: taskModel1): string | boolean {
    return task.service || "לא צויין";
  }

  async openTaskMsgDialog(task: taskModel1) {
    this.hiChatService.setHiChatStatus();
    const checkedAlert = Cookies.get("checkedMerkazTomAlert") === "true";
    if (checkedAlert) {
      this.sendTaskSumMsg(task);
      return;
    }
    const dialogRef = this.merkazTomAlert.open(TomAlertDialog, {
      width: "45rem",
      height: "20rem",
      data: {
        continue: () => {
          this.sendTaskSumMsg(task);
        },
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
    });
  }

  sendTaskSumMsg(task: taskModel1) {
    const msg: object = {
      taskId: task.id,
      taskSummary: task.summary,
      taskDate: task.open_date,
      taskLink: task.link,
    };
    this.aPIgetService.sendTaskSumMsg(msg).subscribe((groupUrlObj: any) => {
      this.hiChatService.setGroupUrl(groupUrlObj.url); 
      this.openChatBox();
    });
  }

  openChatBox() {
    document.getElementById("cloack").className = "visible";
    HomeComponent.chatDisplayFlag = true;
  }

  getTaskType(task: taskModel1): "chg" | "in" {
    if (typeof task.type === "string") {
      return "chg";
    } else if (typeof task.type === "object") {
      return "in";
    }
  }

  getTaskNewStatus(task: taskModel1): "CNCL" | "CL" {
    return task.statusCode == "RFC" || task.statusCode == "OP" ? "CNCL" : "CL";
  }

  closeTask(task: taskModel1) {
    const params: ParamsI = {
      type: this.getTaskType(task),
      id: task.serial_id,
      status: this.getTaskNewStatus(task),
    };
    this.aPIgetService
      .updateTaskStatus(params.type, params.id, params.status)
      .subscribe(
        (res) => {
          this.tasksComponent.ngOnInit();
        },
        (error) => {
          console.log(
            "Close request operation failed. Please contact application dev team"
          );
        }
      );
  }

  reopenTask(task: taskModel1) {
    const params: ParamsI = {
      type: this.getTaskType(task),
      id: task.serial_id,
      status: "REOPEN",
    };
    this.aPIgetService
      .updateTaskStatus(params.type, params.id, params.status)
      .subscribe(
        (res) => {
          this.tasksComponent.ngOnInit();
        },
        (error) => {
          console.log(
            "Close request operation failed. Please contact application dev team"
          );
        }
      );
  }

  taskFailed(task: taskModel1) {
    const params: ParamsI = {
      type: this.getTaskType(task),
      id: task.serial_id,
      status: "NSCC",
    };
    this.aPIgetService
      .updateTaskStatus(params.type, params.id, params.status)
      .subscribe(
        (res) => {
          this.tasksComponent.ngOnInit();
        },
        (error) => {
          console.log(
            "Close request operation failed. Please contact application dev team"
          );
        }
      );
  }

  isActiveTask(task: taskModel1): boolean {
    return task.active === "1";
  }

  getTaskTitle(task: taskModel1) {
    return `${this.getNetwork(task)} - ${this.getService(task)}`;
  }

  getGroup(task: taskModel1): string | boolean {
    const taskGroup = task.group;
    if (taskGroup && taskGroup !== null) {
      return ` ${taskGroup}`;
    }
    return false;
  }
}
