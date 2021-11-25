import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { config } from "./../environments/config.dev";

interface model {
  "@id": string;
  "@COMMON_NAME": string;
}

interface taskModel {
  "@id": string;
  description: string;
}

export interface UUID1 {
  id: string;
}

export interface model1 {
  id: string;
  value: string;
}

export interface inputTask {
  "@COMMON_NAME": string;
  description: string;
  status: { "@COMMON_NAME": string };
  open_date: number;
  z_network: { "@COMMON_NAME": string };
  z_impact_service: { "@COMMON_NAME": string };
  summary: string;
  group: { "@COMMON_NAME": string };
}

export interface taskModel1 {
  serial_id: string;
  id: string;
  active: string;
  description: string;
  status: string;
  open_date: string;
  icon: string;
  group: string;
  network: string;
  service: string;
  summary: string;
  link: string;
  type: string | object | boolean;
  statusCode: string;
  lastTransferDate: string;
}

export interface updatesModel {
  name: string;
  description: string;
  open_date: string;
}

@Injectable({
  providedIn: "root",
})
export class ApigetService {
  accessKey: string = "59975677";
  userT: string;
  networksArray: model[];
  networksByIdArray: model1[] = [];
  servicesArray: model[];
  servicesByIdArray: model1[] = [];
  tasksArray: taskModel[];
  tasksByIdArray: taskModel1[];
  userUUID: string;

  constructor(private http: HttpClient) {}

  httpOptions = {
    withCredentials: true,
    headers: new HttpHeaders({
      "Content-type": "application/json",
      "X-AccessKey": this.accessKey,
      Accept: "application/json",
    }),
  };

  PostHead = new HttpHeaders()
    .set("Content-type", "application/json")
    .set("Accept", "application/json")
    .set("Authorization", "Basic c2VydmljZWRlc2s6U0RBZG1pbjAx");

  head = new HttpHeaders()
    .set("Content-type", "application/json")
    .set("X-AccessKey", this.accessKey)
    .set("Accept", "application/json");

  servicesHeaders = new HttpHeaders()
    .set("Content-type", "application/json")
    .set("X-AccessKey", this.accessKey)
    .set("Accept", "application/json")
    .set("X-Obj-Attrs", "service");

  organizationHeaders = new HttpHeaders()
    .set("Content-type", "application/json")
    .set("X-AccessKey", this.accessKey)
    .set("Accept", "application/json")
    .set("X-Obj-Attrs", "organization");

  placeHeaders = new HttpHeaders()
    .set("Content-type", "application/json")
    .set("X-AccessKey", this.accessKey)
    .set("Accept", "application/json")
    .set("X-Obj-Attrs", "z_location");

  tasksHeaders = new HttpHeaders()
    .set("Content-type", "application/json")
    .set("X-AccessKey", this.accessKey)
    .set("Accept", "application/json")
    .set(
      "X-Obj-Attrs",
      "status, summary, description, open_date, z_network, z_impact_service, group, web_url, type, active, z_last_transfer_date"
    );

  updatesHeaders = new HttpHeaders()
    .set("Content-type", "application/json")
    .set("X-AccessKey", this.accessKey)
    .set("Accept", "application/json")
    .set(
      "X-Obj-Attrs",
      "category, description, open_date, summary, z_network, z_impact_service"
    );

  categoryDescriptionHeaders = new HttpHeaders()
    .set("Content-type", "application/json")
    .set("X-AccessKey", this.accessKey)
    .set("Accept", "application/json")
    .set("X-Obj-Attrs", "description");

  contentTypeJson = new HttpHeaders({
    "Content-type": "application/json",
    Accept: "application/json",
  });

  getOpenConfig() {
    return this.http.get(config.GET_HOMEPAGE_TUTORIAL_URL, {
      withCredentials: true,
      headers: this.head,
    });
  }

  getNetworks() {
    this.networksByIdArray = [];
    return this.http.get(config.GET_NETWORKS_URL, {
      withCredentials: true,
      headers: this.head,
    });
  }

  getUUID(UUID) {
    return this.http.get(config.GET_UUID_URL_FUNCTION(UUID), {
      withCredentials: true,
      headers: this.servicesHeaders,
    });
  }

  getOrganization(UUID) {
    return this.http.get(config.GET_ORGANIZATION(UUID), {
      withCredentials: true,
      headers: this.organizationHeaders,
    });
  }

  getPlace(organizationUUID) {
    return this.http.get(config.GET_PLACE(organizationUUID), {
      withCredentials: true,
      headers: this.placeHeaders,
    });
  }

  getPlaces() {
    return this.http.get(config.GET_PLACES(), {
      withCredentials: true,
      headers: this.head,
    });
  }

  getUpdates() {
    return this.http.get(config.GET_UPDATES, {
      withCredentials: true,
      headers: this.updatesHeaders,
    });
  }

  getServices(id) {
    this.servicesByIdArray = [];
    return this.http.get(config.GET_SERVICES_URL_FUNCTION(id), {
      withCredentials: true,
      headers: this.servicesHeaders,
    });
  }

  getOpenRequestsTasks(UUID) {
    return this.http.get(config.GET_OPEN_REQUESTS_TASKS_URL_FUNCTION(UUID), {
      withCredentials: true,
      headers: this.tasksHeaders,
    });
  }

  getClosedRequestsTasks(UUID) {
    return this.http.get(config.GET_CLOSED_REQUESTS_TASKS_URL_FUNCTION(UUID), {
      withCredentials: true,
      headers: this.tasksHeaders,
    });
  }

  getOpenTasks(UUID) {
    return this.http.get(config.GET_OPEN_TASKS_URL_FUNCTION(UUID), {
      withCredentials: true,
      headers: this.tasksHeaders,
    });
  }

  getClosedTasks(UUID) {
    return this.http.get(config.GET_CLOSED_TASKS_URL_FUNCTION(UUID), {
      withCredentials: true,
      headers: this.tasksHeaders,
    });
  }

  chgToArr(chgObj: {
    collection_chg?: { chg?: Array<inputTask> };
  }): Array<inputTask> {
    if (chgObj.collection_chg && chgObj.collection_chg.chg) {
      return Array.isArray(chgObj.collection_chg.chg)
        ? chgObj.collection_chg.chg
        : [chgObj.collection_chg.chg];
    }
    return [];
  }

  inToArr(inObj: {
    collection_in?: { in?: Array<inputTask> };
  }): Array<inputTask> {
    if (inObj.collection_in && inObj.collection_in.in) {
      return Array.isArray(inObj.collection_in.in)
        ? inObj.collection_in.in
        : [inObj.collection_in.in];
    }
    return [];
  }

  async getAllSortedTasks(
    incidentTasksPromise: Promise<{
      collection_in?: { in?: Array<inputTask> };
    }>,
    requestsTasksPromise: Promise<{
      collection_chg?: { chg?: Array<inputTask> };
    }>
  ) {
    const arrsOfOpenTasks = await Promise.all([
      incidentTasksPromise,
      requestsTasksPromise,
    ]);
    return this.inToArr(arrsOfOpenTasks[0])
      .concat(this.chgToArr(arrsOfOpenTasks[1]))
      .sort((a, b) => b.open_date - a.open_date);
  }

  async getAllOpenSortedTasks(UUID) {
    return await this.getAllSortedTasks(
      this.getOpenTasks(UUID).toPromise(),
      this.getOpenRequestsTasks(UUID).toPromise()
    );
  }

  async getAllClosedSortedTasks(UUID) {
    return await this.getAllSortedTasks(
      this.getClosedTasks(UUID).toPromise(),
      this.getClosedRequestsTasks(UUID).toPromise()
    );
  }

  // getHichatIframe() {
  //   return this.http.get(config.GET_HICHAT_IFRAME_URL, {
  //     withCredentials: true,
  //   });
  // }

  sendTaskSumMsg(msgObj: object) {
    return this.http.post(config.POST_SEND_HICHAT_MSG, msgObj, {
      withCredentials: true,
      headers: this.contentTypeJson,
    });
  }

  getLehavaHealthStatus() {
    return this.http.get(config.LEHAVA_HEALTH_CHECK_URL, {
      withCredentials: true,
    });
  }

  updateTaskStatus(
    taskType: "in" | "chg",
    taskId: string,
    taskStatus: "CNCL" | "CL" | "REOPEN" | "NSCC"
  ) {
    return this.http.put(
      config.UPDATE_TASK_URL_FUNCTION(taskType, taskId),
      config.GET_UPDATE_TASK_STATUS_BODY(taskType, taskStatus),
      { withCredentials: true, headers: this.head }
    );
  }

  getCategoryDescription(categoryId: string) {
    return this.http.get(config.GET_CATEGORY_KNOWLEDGE_ARTICLE(categoryId), {
      withCredentials: true,
      headers: this.categoryDescriptionHeaders,
    });
  }
}
