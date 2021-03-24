import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from './category.service'
import { PostReqService } from '../post-req.service';
import { LehavaDataService } from 'src/app/lehava-data.service';


@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

  categoriesLoaded: boolean = false;
  filterCategories: Array<string>;
  searchText = "";
  constructor(
    public categoryService: CategoryService,
    public route: ActivatedRoute,
    private router: Router,
    public postReqService: PostReqService,
    public lehavaDataService: LehavaDataService,
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.categoryService.setCategories(this.postReqService.networkId, id);
    this.filterCategories = this.categoryService.categoriesToDisplay;
    this.categoriesLoaded = true;
    this.categoryService.emptySelectedCategory();
  }

  selectedCategory(category: string) {
    this.categoryService.updateSelectedCategory(category);
    const selectedCategories: string = this.categoryService.getSelectedCategoryString();
    if (this.categoryService.hasNextSubCategory()) {
      this.router.navigate(['/subcategories', selectedCategories], { relativeTo: this.route });
    } else {
      this.categoryService.openTrandverseIncidentDialog();
    }
  }

  onReturn() {
    this.categoryService.emptySelectedCategory();
    this.router.navigate(['/services', this.postReqService.networkId], { relativeTo: this.route });
  }

  searchTextChanged(text: string) {
    this.searchText = this.stripWhiteSpaces(text.toLowerCase());
    this.addCategoryToDisplay();
  }

  addCategoryToDisplay() {
    this.filterCategories = this.categoryService.categoriesToDisplay.filter((category: string) =>
      category.toLowerCase().includes(this.searchText));
  }

  stripWhiteSpaces(str) {
    return str.replace(/^\s+|\s+$/g, "");
  }
}
