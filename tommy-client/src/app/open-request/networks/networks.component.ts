import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LehavaDataService, Network } from 'src/app/lehava-data.service';
import { ApigetService } from '../../apiget.service';
import { PostReqService } from '../post-req.service';


@Component({
  selector: 'app-networks',
  templateUrl: './networks.component.html',
  styleUrls: ['./networks.component.css']
})
export class NetworksComponent implements OnInit {

  networks: Network[];
  networksToDisplay: Network[];
  searchText = "";
  constructor(private router: Router, private route: ActivatedRoute, public aPIgetService: ApigetService, public postReqService: PostReqService, public lehavaDataService: LehavaDataService) { }

  ngOnInit() {
    this.networks = this.lehavaDataService.lehavaData;
    this.networksToDisplay = this.networks;
  }

  onReturn() {
    this.router.navigateByUrl('', { relativeTo: this.route });
  }

  onSelectedNetwork(networkName: string) {
    const networkSelected = this.networks.find(network => {
      return network.networkName == networkName;
    });
    this.postReqService.networkId = networkSelected.networkId;
    this.router.navigate(['/services', networkSelected.networkId], { relativeTo: this.route });
  }

  getNetworksNames() {
    return this.networksToDisplay.map(network => network.networkName);
  }

  searchTextChanged(text: string) {
    this.searchText = this.stripWhiteSpaces(text.toLowerCase());
    this.addNetworkToDisplay();
  }

  stripWhiteSpaces(str) {
    return str.replace(/^\s+|\s+$/g, "");
  }


  addNetworkToDisplay() {
    this.networksToDisplay = this.networks.filter((network: Network) => {
      return network.networkName.toLowerCase().includes(this.searchText);
    });
  }
}
