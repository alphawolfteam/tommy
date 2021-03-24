import { AuthService } from './../auth.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  static chatDisplayFlag: Boolean;
  constructor(private router: Router, private route: ActivatedRoute, public authService: AuthService) { }

  ngOnInit(): void {
  }

  public chatTag() {
      document.getElementById("cloack").className = HomeComponent.chatDisplayFlag ? "hidden" : "visible";
      HomeComponent.chatDisplayFlag = !HomeComponent.chatDisplayFlag;
  }

}
