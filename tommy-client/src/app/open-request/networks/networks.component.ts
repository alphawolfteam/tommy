import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApigetService, model1 } from '../../apiget.service';
import { PostReqService } from '../post-req.service';


@Component({
  selector: 'app-networks',
  templateUrl: './networks.component.html',
  styleUrls: ['./networks.component.css']
})
export class NetworksComponent implements OnInit {

  networks: model1[];
  filterNetworks: model1[];
  searchText="";
  constructor(private router: Router, private route: ActivatedRoute, public aPIgetService: ApigetService, public postReqService: PostReqService) { }

  ngOnInit() {
    this.aPIgetService.getNetworks().subscribe((res: any) => {
      this.networks = [];
      const networksResponse = res.collection_nr.nr;
      networksResponse.forEach((networkObject: any) => {
        this.networks.push(
          {
            "id": networkObject["@id"],
            "value": networkObject["@COMMON_NAME"]
          } as model1
        );
      });
      this.filterNetworks = this.networks;

    });
  }

  onReturn() {
    this.router.navigateByUrl('', { relativeTo: this.route });
  }

  onSelectedNetwork(networkName: string) {
    const networkSelected = this.networks.find(network => {
      return network.value == networkName;
    });
    this.postReqService.networkId = networkSelected.id;
    this.router.navigate(['/services', networkSelected.id], { relativeTo: this.route });
  }

  getNetworksNames() {
    return this.filterNetworks.map(network => network.value);
  }

  searchTextChanged(text: string){
    this.searchText = this.stripWhiteSpaces(text.toLowerCase());
    this.addNetworkToDisplay();
  }

  stripWhiteSpaces(str) {
    return str.replace(/^\s+|\s+$/g, "");
  }


  addNetworkToDisplay() {
    this.filterNetworks = this.networks.filter((network: model1) => {
      return network.value.toLowerCase().includes(this.searchText);
    });
  }
}
