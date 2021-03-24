import { Component, OnInit } from '@angular/core';
import { CategoryService, TransverseIncident, Category } from '../category/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PostReqService } from '../post-req.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-subcategory',
  templateUrl: './subcategory.component.html',
  styleUrls: ['./subcategory.component.css']
})
export class SubcategoryComponent implements OnInit {

  public categoriesToDisplay: Array<string>;
  filterCategories: Array<string>;
  searchText = "";

  constructor(public categoryService: CategoryService,
    public route: ActivatedRoute,
    private router: Router,
    public postReqService: PostReqService) { }

  ngOnInit() {
    this.categoriesToDisplay = this.categoryService.getCategoriesToDisplay();
    this.filterCategories = this.categoriesToDisplay;

  }

  selectedSubCategory(category: string) {
    this.categoryService.updateSelectedCategory(category);
    const selectedCategories: string = this.categoryService.getSelectedCategoryString();

    if (this.categoryService.hasNextSubCategory()) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/subcategories', selectedCategories], { relativeTo: this.route });
      });
    } else {
      this.categoryService.openTrandverseIncidentDialog();
    }
  }

  onReturn() {
    this.router.navigate(['/categories', this.postReqService.serviceId], { relativeTo: this.route });
  }

  searchTextChanged(text: string) {
    this.searchText = this.stripWhiteSpaces(text);
    this.addCategoryToDisplay();
  }

  addCategoryToDisplay() {
    this.filterCategories = this.categoriesToDisplay.filter((category: string) => {
      return category.toLowerCase().includes(this.searchText.toLowerCase());
    });
  }

  stripWhiteSpaces(str) {
    return str.replace(/^\s+|\s+$/g, "");
  }
}
