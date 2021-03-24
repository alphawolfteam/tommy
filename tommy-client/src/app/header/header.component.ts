import { Component, OnInit, Inject, Input } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../auth.service";
import { HttpClient } from "@angular/common/http";
import { ApigetService } from "../apiget.service";
import { EventEmiterService } from "../event.emmiter.service";
import { PostReqService } from "../open-request/post-req.service";
import * as moment from "moment";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  @Input() userName: string;
  @Input() tutorialUrl: string;
  userT: string;
  userUUID: string;
  greeting: string;
  constructor(
    @Inject(DOCUMENT) document,
    public apigetService: ApigetService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    public authService: AuthService,
    public _eventEmmiter: EventEmiterService,
    private postReqService: PostReqService
  ) {}

  ngOnInit() {
    this.setGreeting(moment());
  }

  onHome() {
    this.router.navigateByUrl("", { relativeTo: this.route });
  }

  setGreeting(m) {
    let g = null;
    let afternoon = 12;
    let evening = 18;
    let currentHour = parseFloat(m.format("HH"));

    if (currentHour >= afternoon && currentHour <= evening) {
      g = "צהריים טובים";
    } else if (currentHour >= evening) {
      g = "ערב טוב";
    } else {
      g = "בוקר טוב";
    }

    this.greeting = g;
  }

  redirectToTutorial() {
    window.open(this.tutorialUrl, "_blank");
  }
}
