import { Network, Service } from "./interface";
import { config } from "../config";
import { CategoryService } from "./categories";
import axios from "axios";
import { AccessTokenProvider } from "../access-token/access-token-service";


class LehavaData {
  categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }


  getAllData = async () => {
    try {
      const networks = await this.getNetworks();

      for (const network of networks) {
        network.services = await this.getNetworkServices(network.networkId);

        for (const service of network.services) {
          service.categories = await this.getCategories(network.networkId, service.serviceId)
        }
      }
      return this.removeNoCatergoriesServices(networks)
    } catch (err) {
      console.log(err);
    }
  };

  // Removes all services that have no categories.
  removeNoCatergoriesServices = (networks: Network[]) => {
    return networks.map((network: Network) => {
      network.services = network.services.filter( (service: Service) => service.categories.length > 0 )
      return network;
    })
  }


  getNetworks = async (): Promise<Network[]> => {
    const networksHeaders = {
      "Content-type": "application/json",
      Accept: "application/json",
      "X-AccessKey": await AccessTokenProvider.getAccessToken(),
    };

    const networksResponse = await axios.get(
      config.client.requests.GET_NETWORKS_URL,
      { headers: networksHeaders, withCredentials: true }
    );
    const networksRaw = networksResponse.data.collection_nr.nr;
    const networks: Network[] = await networksRaw.map((networkObject: any) => {
      return {
        networkId: networkObject["@id"],
        networkName: networkObject["@COMMON_NAME"],
        services: [],
      };
    });
    return networks;
  };

  getNetworkServices = async (networkId: string): Promise<any> => {
    const servicesHeaders = {
      "Content-type": "application/json",
      Accept: "application/json",
      "X-AccessKey": await AccessTokenProvider.getAccessToken(),
      "X-Obj-Attrs": "service",
    };

    const res = await axios.get(
      config.client.requests.GET_SERVICES_URL_FUNCTION(networkId),
      { headers: servicesHeaders, withCredentials: true }
    );

    const servicesResponse =
      res.data.collection_z_networks_to_service.z_networks_to_service;

    const handleLehavaResponse = (res: any) => {
      return {
        serviceId: res["@id"],
        serviceName: res["@COMMON_NAME"],
      };
    }

    if (!Array.isArray(servicesResponse)) {
      return [handleLehavaResponse(servicesResponse.service)]
    }
    return servicesResponse.map((element: any) => {
      const serviceObject = element.service;
      return handleLehavaResponse(serviceObject);
    });
  };

  getCategories = async (networkId: string, serviceId: string) => {
    const allCategories = await this.categoryService.getCategories(
      networkId,
      serviceId
    );
    return allCategories;
  };
}

export default LehavaData;



