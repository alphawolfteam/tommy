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
