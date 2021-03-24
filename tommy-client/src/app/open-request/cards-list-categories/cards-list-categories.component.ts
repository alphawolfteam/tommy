import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LehavaDataService, ServiceWithCategory } from 'src/app/lehava-data.service';

@Component({
  selector: 'app-cards-list-categories',
  templateUrl: './cards-list-categories.component.html',
  styleUrls: ['./cards-list-categories.component.css']
})
export class CardsListCategoriesComponent implements OnInit {

  @Input() servicesWithCategories: ServiceWithCategory[];
  @Output() selected = new EventEmitter<ServiceWithCategory>();
  cardsListToDisplay: ServiceWithCategory[];
  maxGridColumn = 4;
  limit: number = 7;
  gridColumnStyle: { 'grid-template-columns': string; };



  constructor(public lehavaDataService: LehavaDataService) {

  }

  ngOnInit(): void {
    this.setCardListToDisplay();
    this.gridColumnStyle = {
      'grid-template-columns': `repeat(${this.getNumOfCoulmns()}, 300px)`
    }
  }

  getStyle(listItem) {
    return listItem.length < 30 ? 'calc(100% + 0.5vw)' : '0.875rem'
  }

  getDisplayName(listItem: ServiceWithCategory) {
    const categories: String[] = this.lehavaDataService.splitCategory(listItem.category);
    let displayName = "";
    for (const category of categories) {
      displayName = displayName + category + " > ";
    }
    displayName = displayName.slice(0, -3);
    return displayName;
  }


  ngDoCheck(): void {
    this.setCardListToDisplay();
    this.gridColumnStyle = {
      'grid-template-columns': `repeat(${this.getNumOfCoulmns()}, 300px)`
    }
  }

  getNumOfCoulmns() {
    return this.cardsListToDisplay.length >= 4 ? this.maxGridColumn : this.cardsListToDisplay.length;
  }

  setCardListToDisplay() {
    this.cardsListToDisplay = this.servicesWithCategories.slice(0, this.limit);
  }

  onSelectCard(serviceWithCategory: ServiceWithCategory) {
    this.selected.emit(serviceWithCategory);
  }

  showMore() {
    if (this.servicesWithCategories.length > this.limit) this.limit = this.servicesWithCategories.length;
    this.setCardListToDisplay();
  }

  showLess() {
    this.limit = 7;
    this.setCardListToDisplay();
  }
}
