import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'update-detail',
  templateUrl: './update-detail.component.html',
  styleUrls: ['./update-detail.component.css']
})
export class BottomUpdateDetailSheet implements OnInit {
  constructor(private _bottomSheetRef: MatBottomSheetRef<BottomUpdateDetailSheet>, @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) { }

  ngOnInit(): void {
  }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}