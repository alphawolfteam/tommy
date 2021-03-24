import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { taskModel1 } from '../apiget.service';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailDialog implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public task: any) { }

  ngOnInit(): void {
  }

  getDesc(): string {
    let taskDescription = this.task.description;
    if (taskDescription && taskDescription !== null) {
      taskDescription = taskDescription.split("\n")[0] + " " + (taskDescription.split("\n")[1] ? taskDescription.split("\n")[1] : "");
      return taskDescription.length <= 200 ? taskDescription : taskDescription.substring(0, 200) + '...';
    }
    return "לא צוין";
  }

  getOpenDate(): string {
    return this.task.open_date;
  }

  getTitle(): string | boolean {
    return this.task.network && this.task.service ? `${this.task.network} - ${this.task.service}` : "לא צויין";
  }

  getNetwork(): string | boolean {
    const taskNetwork = this.task.network;
    if (taskNetwork && taskNetwork !== null) {
      return `רשת: ${taskNetwork}`;
    }
    return false;
  }

  getService(): string | boolean {
    const taskService = this.task.service;
    if (taskService && taskService !== null) {
      return `שירות: ${taskService}`;
    }
    return false;
  }

  getLastTransferDate(): string | boolean {
    const lastTransferDate = this.task.lastTransferDate;
    if (lastTransferDate && lastTransferDate !== null) {
      
      return `תאריך עדכון אחרון: ${lastTransferDate}`;
    }
    return false;
  }

  getGroup(): string | boolean {
    const taskGroup = this.task.group;
    if (taskGroup && taskGroup !== null) {
      return `בטיפול: ${taskGroup}`;
    }
    return false;
  }

  getstatus(): boolean {
    return this.task.status === "סגור" ? false : true;
  }
}
