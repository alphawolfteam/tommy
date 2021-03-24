import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { config } from '../../../environments/config.dev';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TransverseIncidentDialog, TransverseIncidentData } from '../transverse-incident/transverse-incident.component';
import { PostReqService } from '../post-req.service';
import { data } from 'jquery';
import { LehavaDataService } from 'src/app/lehava-data.service';


export interface CategoryOfIncidents {
  "collection_pcat": {
    "pcat": {
      "@id": string;
      "@COMMON_NAME": string
    }[];
  }
}

export interface CommonCategoryProperties {
  "@id": string;
  "@COMMON_NAME": string
  "@REL_ATTR": string
}

export interface CategoryOfRequests {
  "collection_chgcat": {
    "chgcat": {
      "@id": string;
      "@COMMON_NAME": string
    }[];
  }
}

export interface TransverseIncident {
  "collection_in": {
    "@COUNT": String;
    "@START": String;
    "@TOTAL_COUNT": String;
    in?: [{
      "@id": String;
      "@REL_ATTR": String;
      "@COMMON_NAME": String;
      "link": {
        "@href": String;
        "@rel": String;
      }
      "description": String;
      "open_date": number;
      "z_network": {
        "@id": String;
      }
    }]
  }
}

export interface Category {
  id: string;
  rel_attr: string;
  name: string;
  isIncident: boolean;
}

interface ExceptionOfIncidents {
  "collection_z_pcat_to_network": {
    "z_pcat_to_network": Exception[];
  }
}

interface ExceptionOfRequests {
  "collection_z_chgcat_to_network": {
    "z_chgcat_to_network": Exception[];
  }
}

interface Exception {
  "@id": string;
  "@COMMON_NAME": string;
  category: {
    "@id": string;
    "@COMMON_NAME": string;
  }
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  categories: any;
  selectedCategory: Array<string>;
  categoryList: Array<Category> = [];
  categoriesToDisplay: Array<string>;

  categoriesRequestHeaders = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('Accept', 'application/json')

  transverseIncidentHeaders = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('X-Obj-Attrs', 'description, open_date, z_network')
    .set('Accept', 'application/json')

  exceptionsHeaders = new HttpHeaders()
    .set('Content-type', 'application/json')
    .set('X-Obj-Attrs', 'category')
    .set('Accept', 'application/json')

  constructor(private http: HttpClient,
    public transverseIncidentDialog: MatDialog,
    public route: ActivatedRoute,
    private router: Router,
    public postReqService: PostReqService,
    public lehavaDataService: LehavaDataService,
  ) { }

  getTransverseIncident(categoryId: string) {
    return this.http.get(config.GET_TRANSVERSE_URL_FUNCTION(categoryId),
      { headers: this.transverseIncidentHeaders, withCredentials: true });
  }

  getExceptionsOfIncidents(networkId: string) {
    return this.http.get(config.GET_CATEGORIES_EXCEPTIONS_OF_INCIDENTS(networkId),
      { headers: this.exceptionsHeaders, withCredentials: true });
  }

  getCategoriesOfIncidents(serviceId: string) {
    return this.http.get(config.GET_CATEGORIES_OF_INCIDENTS_URL_FUNCTION(serviceId),
      { headers: this.categoriesRequestHeaders, withCredentials: true }
    );
  }

  getExceptionsOfRequests(networkId: string) {
    return this.http.get(config.GET_CATEGORIES_EXCEPTIONS_OF_REQUESTS(networkId),
      { headers: this.exceptionsHeaders, withCredentials: true });
  }

  getCategoriesOfRequests(serviceId: string) {
    return this.http.get(config.GET_CATEGORIES_OF_REQUESTS_URL_FUNCTION(serviceId),
      { headers: this.categoriesRequestHeaders, withCredentials: true }
    );
  }

  async setCategories(networkId: string, serviceId: string) {
    this.categoryList = this.lehavaDataService.getCategoriesOfServiceAndNetwork(networkId, serviceId);
    this.buildData(this.categoryList.map((category: Category) => category.name.split(".")));
    this.categoriesToDisplay = this.getCategoriesToDisplay();
  }

  buildData(categoryList) {
    this.selectedCategory = [];
    this.categories = this.generateObject(categoryList);
  }

  getCategoriesToDisplay() {
    if (!this.selectedCategory) {
      return Object.keys(this.categories);
    }
    else {
      let currObj = this.categories;
      for (let i = 0; i < (this.selectedCategory).length; i++) {
        let currKey = this.selectedCategory[i];
        if (currObj.hasOwnProperty(currKey)) {
          currObj = currObj[currKey];
        }
      }
      return Object.keys(currObj);
    }
  }

  updateSelectedCategory(category: string) {
    this.selectedCategory.push(category);
  }

  emptySelectedCategory() {
    this.selectedCategory = [];
  }

  getSelectedCategoryString() {
    return this.selectedCategory.join('.');
  }

  hasNextSubCategory() {
    return ((this.getCategoriesToDisplay()).length != 0);
  }

  private buildNewProperty(obj, array) {
    let currObject = obj;
    for (let i = 1; i < array.length; i++) {
      if (!currObject[array[i]]) {
        currObject[array[i]] = {};
      }

      currObject = currObject[array[i]];
    }
  }

  private generateObject(arrays) {
    const obj = {};
    arrays.forEach(array => {
      this.buildNewProperty(obj, array);
    });

    return obj;
  }

  setSelectedCategories(selectedCategoriesString: string) {
    this.selectedCategory = selectedCategoriesString.split(".").slice(1);
  }

  openTrandverseIncidentDialog() {
    const selectedCategories = this.getSelectedCategoryString();

    const categoryIndex = this.categoryList.findIndex(
      (categoryEl: Category) => {
        const splitedCategory = categoryEl.name.split(".");
        return splitedCategory.slice(1, splitedCategory.length).join('.') === selectedCategories;
      });
    const categoryId = this.categoryList[categoryIndex].id;
    this.postReqService.isIncident = this.categoryList[categoryIndex].isIncident;
    this.postReqService.categoryId = this.categoryList[categoryIndex].isIncident ?
      this.categoryList[categoryIndex].rel_attr :
      this.categoryList[categoryIndex].id;

    if (!this.categoryList[categoryIndex].isIncident) {
      this.proceedToNextPage()
    } else {
      this.getTransverseIncident(categoryId).subscribe((incident: TransverseIncident) => {
        const isInNetwork = (arr: Array<{ "z_network": { "@id": String; } }>) =>
          arr.some((trIncident) => trIncident.z_network["@id"] === this.postReqService.networkId);
        if (incident.collection_in.in &&
          ((Array.isArray(incident.collection_in.in) && isInNetwork(incident.collection_in.in)) ||
            ((!Array.isArray(incident.collection_in.in)) && isInNetwork([incident.collection_in.in])))) {
          const data: TransverseIncidentData = { ...incident, selectedCategories };
          this.transverseIncidentDialog.open(TransverseIncidentDialog, { width: "430", height: "400", data: data })
          this.selectedCategory.pop();
        } else {
          this.proceedToNextPage()
        }
      }, (e: Error) => this.proceedToNextPage());
    }
  }

  proceedToNextPage() {
    this.router.navigate(['/description', this.getSelectedCategoryString()], { relativeTo: this.route });
  }
}
