import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { model1, ApigetService } from "../../apiget.service";
import { AuthService } from "../../auth.service";
import { EventEmiterService } from "../../event.emmiter.service";
import { PostReqService, PostResponse } from "../post-req.service";
import { CategoryService } from "../category/category.service";
import { MatDialog } from "@angular/material/dialog";
import { FinishRequestComponent } from "../finish-request/finish-request.component";
import { AlertComponent } from "../alert/alert.component";
import { KnowledgeArticleComponent } from "../knowledge-article/knowledge-article.component";
import { config } from "../../../environments/config.dev";
import { SpecPlaceService } from "../../spec-place.service";

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
  placesList: model1[] = [];
  initialPlace: model1 = { id: "", value: "" };
  place: string = "";
  voip: string = "";
  computerNameInput: string = "";
  services: model1[];
  userUUID: string = "";
  phoneNumbersArray: string[];
  input: number = 0;
  isPending: boolean = false;
  file: { name: string; type: string; base64: string } = undefined;
  organizationUUID: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public _eventEmmitter: EventEmiterService,
    public authService: AuthService,
    public postReqService: PostReqService,
    public categoryService: CategoryService,
    public dialog: MatDialog,
    public knowledgeArticleDialog: MatDialog,
    private apiGetService: ApigetService,
    private specPlaceService: SpecPlaceService
  ) {}

  ngOnInit(): void {
    this.isKnowledgeArticle();
    const id = this.route.snapshot.paramMap.get("id");
    const selectedCategories = this.categoryService.getSelectedCategoryString();
    this.postReqService.descriptionCategory = selectedCategories;
    this._eventEmmitter.user.subscribe((data) =>
      this.authService.setUserShraga(data)
    );
    this.userUUID = this.authService.getUuid();
    if (this.authService.getPhone())
      this.setPhoneFromShraga(this.authService.getPhone());
    this._eventEmmitter.dataStr.subscribe((data) => {
      this.userUUID = data;
    });
    this.place = this.specPlaceService.specPlace.value;
    this.updatePlaces();
    this.isPending = false;
  }

  onReturn() {
    this.router.navigate(["/categories", this.postReqService.serviceId], {
      relativeTo: this.route,
    });
  }

  getFileSizeLimit() {
    return config.fileSizeLimit;
  }

  handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (file.size > this.getFileSizeLimit()) {
      document.getElementById("files")["value"] = "";
      this.dialog.open(AlertComponent, {
        width: "330px",
        height: "225px",
        data: {
          title: "הקובץ שנבחר גדול מדי",
          content: `${this.getFileSizeLimit() / 1048576}  MB הגבלת הגודל היא`,
        },
      });
    } else {
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
  }

  handleRemoveFile() {
    this.file = undefined;
  }

  sendPost() {
    if (
      this.locationInput &&
      this.phoneInput &&
      this.computerNameInput &&
      this.place &&
      !this.isPending
    ) {
      this.isPending = true;
      this.postReqService.descriptionInput = (<HTMLInputElement>(
        document.getElementById("subject")
      )).value;
      this.postReqService.location = this.locationInput;
      this.postReqService.phoneNumber = this.phoneInput;
      this.postReqService.computerName = this.computerNameInput;
      this.postReqService.voip = this.voip;
      this.postReqService.file = this.file;
      this.postReqService.z_location =
        this.place === "" ? this.place : this.getPlaceId(this.place);
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

  setPlace(newPlace: string) {
    this.place = newPlace;
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

  openKnowlengeDialog(knowledgeArticleLink: string) {
    this.knowledgeArticleDialog.open(
      KnowledgeArticleComponent, {data: knowledgeArticleLink}
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
    this.checkKnowledgeArticle(this.postReqService.isIncident, categoryId)
  }

  checkKnowledgeArticle(isIncident: boolean, categoryId: string) {
    if (isIncident) {
      return this.apiGetService
        .getIncidentCategoryDescription(categoryId)
        .subscribe((res: any) => {
          if(res.collection_pcat.pcat?.description) this.openKnowlengeDialog(res.collection_pcat.pcat.description);
        });
    } else {
      return this.apiGetService
        .getRequestCategoryDescription(categoryId)
        .subscribe((res: any) => {
          if (res.collection_chgcat.chgcat?.description) this.openKnowlengeDialog(res.collection_chgcat.chgcat?.description);
        });
    }
  }

  getPlaceId(placeName: string) {
    const placeSelected = this.placesList.find((place) => {
      return place?.value === placeName;
    });
    return placeSelected.id;
  }

  updatePlaces() {
    this.placesList = this.specPlaceService.placesList
      ? this.specPlaceService.placesList
      : [];
    this.initialPlace = {
      id: this.specPlaceService.specPlace.id,
      value: this.specPlaceService.specPlace.value,
    };
    this.initialPlace.value
      ? (this.place = this.initialPlace.value)
      : (this.place = "");
  }
}
