import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { model1, ApigetService } from "../../apiget.service";
import { AuthService } from "../../auth.service";
import { EventEmiterService } from "../../event.emmiter.service";
import { PostReqService, PostResponse } from "../post-req.service";
import { CategoryService } from "../category/category.service";
import { MatDialog } from "@angular/material/dialog";
import { FinishRequestComponent } from "../finish-request/finish-request.component";
import { KnowledgeArticleComponent } from "../knowledge-article/knowledge-article.component";
@Component({
  selector: "app-description",
  templateUrl: "./description.component.html",
  styleUrls: ["./description.component.css"],
})
export class DescriptionComponent implements OnInit {
  locationWarning = "";
  phoneWarning = "";
  computerNameWarning = "";
  locationInput: string = "";
  phoneInput: string = "";
  voip: string = "";
  computerNameInput: string = "";
  services: model1[];
  userUUID: string = "";
  phoneNumbersArray: string[];
  input: number = 0;
  isPending: boolean = false;
  file: { name: string; type: string; base64: string } = undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public _eventEmmitter: EventEmiterService,
    public authService: AuthService,
    public postReqService: PostReqService,
    public categoryService: CategoryService,
    public dialog: MatDialog,
    public knowledgeArticleDialog: MatDialog,
    private apiGetService: ApigetService
  ) {}

  ngOnInit(): void {
    this.isKnowledgeArticle();
    const id = this.route.snapshot.paramMap.get("id");
    const selectedCategories = this.categoryService.getSelectedCategoryString();
    this.postReqService.descriptionCategory = selectedCategories;
    this._eventEmmitter.user.subscribe((data) =>
      this.authService.setUserShraga(data)
    );
    if (this.authService.getPhone()) this.setPhoneFromShraga(this.authService.getPhone());
    this._eventEmmitter.dataStr.subscribe((data) => (this.userUUID = data));
    this.isPending = false;
    console.log(this.postReqService.categoryId);
  }

  onReturn() {
    this.router.navigate(["/categories", this.postReqService.serviceId], {
      relativeTo: this.route,
    });
  }

  handleFileUpload(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.file = {
        name: file.name,
        type: file.name.split(".")[1],
        base64: (reader.result as string).split(",")[1],
      };
    };
  }

  handleRemoveFile() {
    this.file = undefined;
  }

  sendPost() {
    if (
      this.locationInput &&
      this.phoneInput &&
      this.computerNameInput &&
      !this.isPending
    ) {
      this.isPending = true;
      this.postReqService.descriptionInput = (<HTMLInputElement>(
        document.getElementById("subject")
      )).value;
      this.postReqService.location = this.locationInput;
      console.log(this.phoneInput);
      this.postReqService.phoneNumber = this.phoneInput;
      this.postReqService.computerName = this.computerNameInput;
      this.postReqService.voip = this.voip;
      this.postReqService.file = this.file;
      this.file
        ? this.postReqService
            .postWithFileAppeal()
            .subscribe((res: PostResponse) => {
              this.finishRequestDialog(res);
            })
        : this.postReqService.postAppeal().subscribe((res: PostResponse) => {
            this.finishRequestDialog(res);
          });
    } else {
      this.inputPlaceholderChanger();
    }
  }

  private finishRequestDialog(res: PostResponse) {
    const requestId = this.postReqService.getRequestId(res);
    console.log(`request id: ${requestId}`);
    this.dialog
      .open(FinishRequestComponent, {
        width: "430px",
        height: "466px",
        data: requestId,
      })
      .afterClosed()
      .subscribe(() => {
        this.router.navigate(["/"]);
      });
  }

  counter() {
    this.input = (<HTMLInputElement>(
      document.getElementById("subject")
    )).value.length;
  }

  setPhoneInput(phoneInput: string) {
    this.phoneInput = phoneInput;
  }

  setComputerNameInput(computerName: string) {
    this.computerNameInput = computerName;
  }

  setVOIPInput(voipInput: string) {
    this.voip = voipInput;
  }

  setLocationInput(location: string) {
    this.locationInput = location;
  }

  inputPlaceholderChanger() {
    this.locationWarning = !this.locationInput ? "red-holder" : "";
    this.phoneWarning = !this.phoneInput ? "red-holder" : "";
    this.computerNameWarning = !this.computerNameInput ? "red-holder" : "";
  }

  setPhoneFromShraga(phonesArray: string[]) {
    const phoneNumber = phonesArray.filter(this.isMobile)[0];
    if (phoneNumber) {
      this.phoneInput = phoneNumber.startsWith("0")
        ? phoneNumber
        : `0${phoneNumber}`;
    } else {
      this.phoneInput = "";
    }
  }

  isMobile(numStr) {
    const prefix = numStr.split("-")[0];
    return prefix.startsWith("5") || prefix.startsWith("05");
  }

  openKnowlengeDialog() {
    const dialogRef = this.knowledgeArticleDialog.open(
      KnowledgeArticleComponent
    );
  }

  isKnowledgeArticle() {
    let categoryId: string;
    categoryId = this.postReqService.isIncident
      ? this.postReqService.categoryId.split(":")[1]
      : this.postReqService.categoryId;
    if (!categoryId) {
      categoryId = this.postReqService.categoryId;
    }
    this.apiGetService
      .getCategoryDescription(categoryId)
      .subscribe((res: any) => {
        const knowledgeArticle = res.collection_pcat.pcat
          ? res.collection_pcat.pcat.description
          : null;

        if (knowledgeArticle) {
          this.openKnowlengeDialog();
        }
      });
  }
}