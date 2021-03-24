import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { config } from './../environments/config.dev';

export interface Service {
  serviceName: string;
  serviceId: string;
  categories: Category[];
}

export interface Network {
  networkName: string;
  networkId: string;
  services: Service[];
}

export interface Category {
  id: string;
  rel_attr: string;
  name: string;
  isIncident: boolean;
}

export interface ServiceWithCategory {
  serviceName: string;
  serviceId: string;
  category: Category;
}



@Injectable({
  providedIn: 'root'
})
export class LehavaDataService {
  lehavaData: Network[];
  isLoaded: Promise<boolean>;
  constructor(private http: HttpClient) { }

  async setLehavaData() {
    this.http.get(config.GET_LEHAVA_DATA, { withCredentials: true }).subscribe((res: any) => {
      this.lehavaData = JSON.parse(res.data);
      this.isLoaded = Promise.resolve(true);
    })
  }

  getServicesOfNetwork(networkId: string): Service[] {
    return this.lehavaData.find((network: Network) => network.networkId === networkId).services;
  }

  getCategoriesOfServiceAndNetwork(networkId: string, serviceId: string) {
    const services = this.getServicesOfNetwork(networkId);
    return services.find((service) => service.serviceId === serviceId).categories;
  }

  getServicesWithCategories(networkId: string) {
    const services = this.getServicesOfNetwork(networkId);
    const servicesWithCategories: ServiceWithCategory[] = [];
    for (const service of services) {
      for (const category of service.categories) {
        const serviceWithCategory: ServiceWithCategory = {
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          category: category,
        }
        servicesWithCategories.push(serviceWithCategory);
      }
    }
    return servicesWithCategories;
  }

  splitCategory(category: Category) {
    return category.name.split(".");
  }
}
