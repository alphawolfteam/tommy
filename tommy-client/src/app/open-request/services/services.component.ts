import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ApigetService, model1 } from "../../apiget.service";
import { PostReqService } from "../post-req.service";
import { LehavaDataService, Service, Network, ServiceWithCategory } from 'src/app/lehava-data.service';
import { CategoryService } from "../category/category.service";


@Component({
  selector: "app-services",
  templateUrl: "./services.component.html",
  styleUrls: ["./services.component.css"],
})



export class ServicesComponent implements OnInit {
  services: Service[];
  servicesToDisplay: Service[];
  servicesWithCategories: ServiceWithCategory[];
  servicesWithCategoriesToDisplay: ServiceWithCategory[];
  searchText: string = "";

  constructor(
    public aPIgetService: ApigetService,
    public route: ActivatedRoute,
    private router: Router,
    public postReqService: PostReqService,
    public lehavaDataService: LehavaDataService,
    public categoryService: CategoryService,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get("id");
    this.services = this.lehavaDataService.getServicesOfNetwork(id);
    this.servicesToDisplay = this.services;
    this.servicesWithCategories = this.lehavaDataService.getServicesWithCategories(id);
    this.servicesWithCategoriesToDisplay = this.servicesWithCategories;

  }

  onReturn() {
    this.router.navigateByUrl("newtask", { relativeTo: this.route });
  }

  onSelectedService(serviceName: string) {
    const serviceSelected = this.services.find((service) => {
      return service.serviceName == serviceName;
    });
    this.postReqService.serviceId = serviceSelected.serviceId;
    this.router.navigate(["/categories", serviceSelected.serviceId], {
      relativeTo: this.route,
    });
  }

  onSelectedServiceWithCategory(serviceWithCategory: ServiceWithCategory) {
    this.postReqService.serviceId = serviceWithCategory.serviceId;
    this.categoryService.setCategories(this.postReqService.networkId, serviceWithCategory.serviceId);
    this.categoryService.setSelectedCategories(serviceWithCategory.category.name);
    this.categoryService.openTrandverseIncidentDialog();
  }

  getServicesNames() {
    return this.servicesToDisplay.map(service => service.serviceName);
  }

  searchTextChanged(text: string) {
    this.searchText = this.stripWhiteSpaces(text.toLowerCase());
    this.addServiceToDisplay();
  }

  addServiceToDisplay() {
    this.servicesWithCategoriesToDisplay = this.servicesWithCategories.filter((service: ServiceWithCategory) => {
      return service.serviceName.toLowerCase().includes(this.searchText) || service.category.name.toLowerCase().includes(this.searchText);
    });
  }

  stripWhiteSpaces(str) {
    return str.replace(/^\s+|\s+$/g, "");
  }
}
