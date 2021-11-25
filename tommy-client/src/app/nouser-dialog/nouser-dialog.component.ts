import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { taskModel1 } from '../apiget.service';

@Component({
  selector: 'app-task-detail',
  templateUrl: './nouser-dialog.component.html',
  styleUrls: ['./nouser-dialog.component.css']
})
export class NoUserDialog implements OnInit {


  ngOnInit(): void {
  }
}
