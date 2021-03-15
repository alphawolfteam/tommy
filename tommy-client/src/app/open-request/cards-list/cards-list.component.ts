import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { model1 } from '../../apiget.service'

@Component({
  selector: 'app-cards-list',
  templateUrl: './cards-list.component.html',
  styleUrls: ['./cards-list.component.css']
})
export class CardsListComponent implements OnInit {

  @Input() cardsList: string[];
  @Output() selected = new EventEmitter<string>();
  cardsListToDisplay: string[];
  maxGridColumn = 4;
  limit: number = 7;
  gridColumnStyle: { 'grid-template-columns': string; };



  constructor() {

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
    this.cardsListToDisplay = [];
    let i = 0;
    for (let listItem of this.cardsList) {
      if (i < this.limit && i < this.cardsList.length) {
        this.cardsListToDisplay.push(listItem);
        i++;
      } else {
        return;
      }
    }
  }

  onSelectCard(cardName: string) {
    this.selected.emit(cardName);
  }

  showMore() {
    if (this.cardsList.length > this.limit) this.limit = this.cardsList.length;
    this.setCardListToDisplay();
  }

  showLess() {
    this.limit = 7;
    this.setCardListToDisplay();
  }
}
