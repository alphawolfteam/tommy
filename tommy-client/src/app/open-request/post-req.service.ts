import { Injectable } from "@angular/core";
import { ApigetService } from "../apiget.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { config } from "src/environments/config.dev";

export type PostResponse = PostRequestResponse | PostIncidentResponse;

interface PostIncidentResponse {
  in: {
    "@COMMON_NAME": string;
  };
}

interface PostRequestResponse {
  chg: {
    "@COMMON_NAME": string;
  };
}

@Injectable({
  providedIn: "root",
})
export class PostReqService {
  constructor(private http: HttpClient, public apigetService: ApigetService) {}

  requestHead = new HttpHeaders()
    .set("Content-type", "application/json")
    .set("Accept", "application/json")
    .set("Authorization", "Basic c2VydmljZWRlc2s6U0RBZG1pbjAx");

  userUUID: string;
  phoneNumber: string;
  priority: string = "505";
  urgency: string = "1102";
  userT: string;
  networkId: string;
  serviceId: string;
  descriptionCategory: string;
  descriptionInput: string;
  location: string;
  computerName: string;
  voip: string;
  categoryId: string;
  file: { name: string; type: string; base64: string };
  z_location: string;
  
  public isIncident: boolean = true;

  postAppeal(otherUserT?: string) {
    return this.isIncident ? this.postIncident(otherUserT) : this.postRequest(otherUserT);
  }

  postIncident(otherUserT?: string) {
    return this.http.post(config.POST_NEW_INCIDENT, this.getIncidentObject(otherUserT), {
      headers: this.requestHead,
      withCredentials: true,
    });
  }

  postRequest(otherUserT?: string) {
    return this.http.post(config.POST_NEW_REQUEST, this.getRequestObject(otherUserT), {
      headers: this.requestHead,
      withCredentials: true,
    });
  }

  postWithFileAppeal(otherUserT?: string) {
    return this.isIncident
      ? this.postWithFileIncident(otherUserT)
      : this.postWithFileRequest(otherUserT);
  }

  postWithFileIncident(otherUserT?: string) {
    const requestBody = {
      postType: "in",
      ...this.getIncidentObject(otherUserT),
      file: this.file,
    };

    return this.http.post(config.POST_NEW_INCIDENT_WITH_FILE, requestBody, {
      headers: this.requestHead,
      withCredentials: true,
    });
  }

  postWithFileRequest(otherUserT?: string) {
    const requestBody = {
      postType: "chg",
      ...this.getRequestObject(otherUserT),
      file: this.file,
    };

    return this.http.post(config.POST_NEW_REQUEST_WITH_FILE, requestBody, {
      headers: this.requestHead,
      withCredentials: true,
    });
  }

  appendDescriptions() {
    this.descriptionInput = this.descriptionInput.replace(/\n/g, "");
    return `${this.descriptionCategory}\n${this.descriptionInput}`;
  }

  getRequestId(postRes: PostResponse) {
    return "in" in postRes
      ? postRes.in["@COMMON_NAME"]
      : postRes.chg["@COMMON_NAME"];
  }

  private getRequestObject(otherUserT?: string): object {
    let otherUUid: string;
    if (otherUserT) {
      this.apigetService.getUUID(otherUserT).subscribe((res: any) => {
        if (Array.isArray(res.collection_cnt.cnt)) {
          if (res.collection_cnt.cnt)
          otherUUid = res.collection_cnt.cnt[1]["@id"];
        } else {
          otherUUid = res.collection_cnt.cnt["@id"];
          if (res.collection_cnt.cnt)
          otherUUid = res.collection_cnt.cnt["@id"];
        }
      });
    }
    return {
      chg: {
        requestor: {
          "@id": otherUUid || this.userUUID,
        },
        category: {
          "@id": this.categoryId,
        },
        ...this.getCommonBodyProperties(otherUserT),
      },
    };
  }

  private getIncidentObject(otherUserT?: string): object {
    let otherUUid: string;
    if (otherUserT) {
      this.apigetService.getUUID(otherUserT).subscribe((res: any) => {
        if (Array.isArray(res.collection_cnt.cnt)) {
          if (res.collection_cnt.cnt)
          otherUUid = res.collection_cnt.cnt[1]["@id"];
        } else {
          otherUUid = res.collection_cnt.cnt["@id"];
          if (res.collection_cnt.cnt)
          otherUUid = res.collection_cnt.cnt["@id"];
        }
      });
    }
    return {
      in: {
        customer: {
          "@id": otherUUid || this.userUUID,
        },
        category: {
          "@REL_ATTR": this.categoryId,
        },
        ...this.getCommonBodyProperties(otherUserT),
      },
    };
  }

  private getCommonBodyProperties(otherUserT?: string): object {
    return {
      z_cst_phone: this.phoneNumber,
      priority: {
        "@id": `${this.priority}`,
      },
      Urgency: {
        "@id": `${this.urgency}`,
      },
      z_ipaddress: "1.1.1.1",
      z_username: otherUserT || this.userT,
      z_computer_name: this.computerName,
      z_current_loc: this.location,
      z_cst_red_phone: this.voip,
      z_network: {
        "@id": this.networkId,
      },
      z_impact_service: {
        "@id": this.serviceId,
      },
      description: this.appendDescriptions(),
      z_source: {
        "@id": "400104",
      },
      impact: {
        "@id": "1603",
      },
      z_location: {
        "@id": this.z_location
      } 
    };
  }
}