import { Injectable } from "@angular/core";
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
  constructor(private http: HttpClient) {}

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

  postAppeal() {
    return this.isIncident ? this.postIncident() : this.postRequest();
  }

  postIncident() {
    return this.http.post(config.POST_NEW_INCIDENT, this.getIncidentObject(), {
      headers: this.requestHead,
      withCredentials: true,
    });
  }

  postRequest() {
    return this.http.post(config.POST_NEW_REQUEST, this.getRequestObject(), {
      headers: this.requestHead,
      withCredentials: true,
    });
  }

  postWithFileAppeal() {
    return this.isIncident
      ? this.postWithFileIncident()
      : this.postWithFileRequest();
  }

  postWithFileIncident() {
    const requestBody = {
      postType: "in",
      ...this.getIncidentObject(),
      file: this.file,
    };

    return this.http.post(config.POST_NEW_INCIDENT_WITH_FILE, requestBody, {
      headers: this.requestHead,
      withCredentials: true,
    });
  }

  postWithFileRequest() {
    const requestBody = {
      postType: "chg",
      ...this.getRequestObject(),
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

  private getRequestObject(): object {
    return {
      chg: {
        requestor: {
          "@id": this.userUUID,
        },
        category: {
          "@id": this.categoryId,
        },
        ...this.getCommonBodyProperties(),
      },
    };
  }

  private getIncidentObject(): object {
    return {
      in: {
        customer: {
          "@id": this.userUUID,
        },
        category: {
          "@REL_ATTR": this.categoryId,
        },
        ...this.getCommonBodyProperties(),
      },
    };
  }

  private getCommonBodyProperties(): object {
    return {
      z_cst_phone: this.phoneNumber,
      priority: {
        "@id": `${this.priority}`,
      },
      Urgency: {
        "@id": `${this.urgency}`,
      },
      z_ipaddress: "1.1.1.1",
      z_username: this.userT,
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