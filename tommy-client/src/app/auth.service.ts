import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { ApigetService } from "./apiget.service";
import { config } from "./../environments/config.dev";

@Injectable({
  providedIn: "any",
})
export class AuthService {
  public userName: string;
  public user: any;
  public userT: string;
  public userUUID: string;
  public phone: [];
  public phoneNumbersArray: string[];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    public api: ApigetService
  ) {}

  login() {
    this.http.get(`/user`, { withCredentials: true }).subscribe((res: any) => {
      this.user = res;
      this.userName = res.name.firstName + " " + res.name.lastName;
      this.userT = res.adfsId.split("@")[0];
      this.phone = res.phoneNumbers;
      // this.api.getUUID(this.userT).subscribe((res: any) => {
      //   this.userUUID = res.collection_cnt.cnt['@id'];
      // });
      this.api.getUUID(this.userT).subscribe({
        next: (x: any) => {
          if (x.collection_cnt?.cnt)
            this.userUUID = x.collection_cnt.cnt["@id"];
        },
        error: (err: any) => {
          console.log("Error connection to LehavaAPI");
        },
      });
    });
  }

  public loginSub() {
    return this.http.get(`/user`, { withCredentials: true });
  }

  public setUUID(uuid) {
    this.userUUID = uuid;
  }

  public getUser() {
    return this.user;
  }

  public setUser(user) {
    this.userT = user;
  }

  public setName(userName) {
    this.userName = userName;
  }

  public getName() {
    return this.userName;
  }

  public getTuser() {
    return this.userT;
  }

  public setUserShraga(user) {
    this.user = user;
  }

  public getUserShraga() {
    return this.user;
  }

  public setPhone(phoneNumbersArray: string[]) {
    this.phoneNumbersArray = phoneNumbersArray;
  }

  public getPhone() {
    return this.phoneNumbersArray;
  }

  public getUuid() {
    return this.userUUID;
  }
}
