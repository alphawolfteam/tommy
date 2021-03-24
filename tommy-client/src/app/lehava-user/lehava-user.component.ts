import { Component, OnInit } from '@angular/core';
import { config } from '../../environments/config.dev';

@Component({
  selector: 'app-lehava-user',
  templateUrl: './lehava-user.component.html',
  styleUrls: ['./lehava-user.component.css']
})
export class LehavaUserComponent implements OnInit {
noLehavaUser ={
  firstSen: config.NO_LEHAVA_USER_SENTENCES.firstSen,
  secondSen: config.NO_LEHAVA_USER_SENTENCES.secondSen,
  thirdSen: config.NO_LEHAVA_USER_SENTENCES.thirdSen
}
  constructor() { 
    
  }

  ngOnInit(): void {
  }

}
