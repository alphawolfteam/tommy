import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { config } from './../environments/config.dev';

interface model {
  "@id": string;
  "@COMMON_NAME": string;
}

interface taskModel {
  "@id": string;
  "description": string;
}

export interface UUID1 {
  "id": string;
}

export interface model1 {
  "id": string;
  "value": string;
}

export interface inputTask {
  "@COMMON_NAME": string;
  description: string;
  status: { "@COMMON_NAME": string; };
  open_date: number,
  z_network: { "@COMMON_NAME": string; };
  z_impact_service: { "@COMMON_NAME": string; };
  summary: string;
  group: { "@COMMON_NAME": string };
}

export interface taskModel1 {
  "id": string;
  "description": string;
  "status": string;
  "open_date": string;
  "icon": string;
  "group": string;
  "network": string;
  "service": string;
  "summary": string;
  "link": string;
}

export interface updatesModel {
  "name": string;
  "description": string;
  "open_date": string;
}

@Injectable({
  providedIn: 'root'
})
export class ApigetService {

  accessKey: string = '59975677';
  userT: string;
  networksArray: model[];
  networksByIdArray: model1[] = [];
  servicesArray: model[];
  servicesByIdArray: model1[] = [];
  tasksArray: taskModel[];
  tasksByIdArray: taskModel1[];
  userUUID: string;

  constructor(private http: HttpClient) { }

  httpOptions = {
    withCredentials: true, headers: new HttpHeaders({
      'Content-type': 'application/json',
      'X-AccessKey': this.accessKey,
      'Accept': 'application/json'
    })
  }

  PostHead = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('Accept', 'application/json')
    .set('Authorization', 'Basic c2VydmljZWRlc2s6U0RBZG1pbjAx');

  head = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('X-AccessKey', this.accessKey)
    .set('Accept', 'application/json');

  servicesHeaders = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('X-AccessKey', this.accessKey)
    .set('Accept', 'application/json')
    .set('X-Obj-Attrs', 'service')

  tasksHeaders = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('X-AccessKey', this.accessKey)
    .set('Accept', 'application/json')
    .set('X-Obj-Attrs', 'status, summary, description, open_date, z_network, z_impact_service, group');

  updatesHeaders = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('X-AccessKey', this.accessKey)
    .set('Accept', 'application/json')
    .set('X-Obj-Attrs', 'category, description, open_date, summary, z_network');

  contentTypeJson = new HttpHeaders({
    'Content-type': 'application/json',
    'Accept': 'application/json'
  })

  getNetworks() {
    this.networksByIdArray = [];
    return this.http.get(config.GET_NETWORKS_URL,
      { withCredentials: true, headers: this.head }
    );
    //console.log(this.networksByIdArray);
    //return this.networksByIdArray;
  }

  getUUID(UUID) {
    return this.http.get(config.GET_UUID_URL_FUNCTION(UUID),
      { withCredentials: true, headers: this.servicesHeaders });
  }

  getUpdates() {
    return this.http.get(config.GET_UPDATES,
      { withCredentials: true, headers: this.updatesHeaders })
  }


  getServices(id) {
    this.servicesByIdArray = [];
    return this.http.get(config.GET_SERVICES_URL_FUNCTION(id),
      { withCredentials: true, headers: this.servicesHeaders }
    );
  }

  getOpenRequestsTasks(UUID) {
    return this.http.get(config.GET_OPEN_REQUESTS_TASKS_URL_FUNCTION(UUID),
      { withCredentials: true, headers: this.tasksHeaders })
  }

  getClosedRequestsTasks(UUID) {
    return this.http.get(config.GET_CLOSED_REQUESTS_TASKS_URL_FUNCTION(UUID),
      { withCredentials: true, headers: this.tasksHeaders })
  }

  getOpenTasks(UUID) {
    return this.http.get(config.GET_OPEN_TASKS_URL_FUNCTION(UUID),
      { withCredentials: true, headers: this.tasksHeaders })
  }

  getClosedTasks(UUID) {
    return this.http.get(config.GET_CLOSED_TASKS_URL_FUNCTION(UUID),
      { withCredentials: true, headers: this.tasksHeaders })
  }

  chgToArr(chgObj: { collection_chg?: { chg?: Array<inputTask> } }): Array<inputTask> {
    if (chgObj.collection_chg && chgObj.collection_chg.chg) {
      return Array.isArray(chgObj.collection_chg.chg) ? chgObj.collection_chg.chg : [chgObj.collection_chg.chg];
    }
    return []
  }

  inToArr(inObj: { collection_in?: { in?: Array<inputTask> } }): Array<inputTask> {
    if (inObj.collection_in && inObj.collection_in.in) {
      return Array.isArray(inObj.collection_in.in) ? inObj.collection_in.in : [inObj.collection_in.in];
    }
    return []
  }

  async getAllSortedTasks(
    incidentTasksPromise: Promise<{ collection_in?: { in?: Array<inputTask> } }>,
    requestsTasksPromise: Promise<{ collection_chg?: { chg?: Array<inputTask> } }>) {
    const arrsOfOpenTasks = await Promise.all([incidentTasksPromise, requestsTasksPromise]);
    return this.inToArr(arrsOfOpenTasks[0]).concat(this.chgToArr(arrsOfOpenTasks[1]))
      .sort((a, b) => (b.open_date - a.open_date))
  }

  async getAllOpenSortedTasks(UUID) {
    return await this.getAllSortedTasks(
      this.getOpenTasks(UUID).toPromise(),
      this.getOpenRequestsTasks(UUID).toPromise());
  }

  async getAllClosedSortedTasks(UUID) {
    return await this.getAllSortedTasks(
      this.getClosedTasks(UUID).toPromise(),
      this.getClosedRequestsTasks(UUID).toPromise());
  }

  getHichatIframe() {
    return this.http.get(config.GET_HICHAT_IFRAME_URL,
      { withCredentials: true })
  }

  sendTaskSumMsg(msgObj: object) {
    return this.http.post(config.POST_SEND_HICHAT_MSG, msgObj, { withCredentials: true, headers: this.contentTypeJson })
  }

};
