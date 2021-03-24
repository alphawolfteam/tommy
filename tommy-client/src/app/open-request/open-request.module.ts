import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NetworksComponent } from "./networks/networks.component";
import { ServicesComponent } from "./services/services.component";
import { DescriptionComponent } from "./description/description.component";
import { CategoryComponent } from "./category/category.component";
import { SubcategoryComponent } from "./subcategory/subcategory.component";
import { FinishRequestComponent } from "./finish-request/finish-request.component";
import { CardsListComponent } from "./cards-list/cards-list.component";
import { ReturnButtonComponent } from "./return-button/return-button.component";
import { PageTopTitleComponent } from "./page-top-title/page-top-title.component";
import { BrowserModule } from "@angular/platform-browser";
import { EventEmiterService } from "../event.emmiter.service";
import { AuthService } from "../auth.service";
import {
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialogModule,
} from "@angular/material/dialog";
import { HttpClientModule } from "@angular/common/http";
import { MatListModule } from "@angular/material/list";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "../app-routing.module";
import { TransverseIncidentDialog } from "./transverse-incident/transverse-incident.component";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "../shared.module";
import { MatTooltipModule } from "@angular/material/tooltip";
import { KnowledgeArticleComponent } from "./knowledge-article/knowledge-article.component";
import { CardsListCategoriesComponent } from "./cards-list-categories/cards-list-categories.component";

@NgModule({
  declarations: [
    NetworksComponent,
    ServicesComponent,
    DescriptionComponent,
    CategoryComponent,
    SubcategoryComponent,
    FinishRequestComponent,
    CardsListComponent,
    ReturnButtonComponent,
    PageTopTitleComponent,
    TransverseIncidentDialog,
    KnowledgeArticleComponent,
    CardsListCategoriesComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatExpansionModule,
    MatButtonModule,
    MatGridListModule,
    MatListModule,
    HttpClientModule,
    MatDialogModule,
    FormsModule,
    SharedModule,
    MatTooltipModule,
  ],
  exports: [
    NetworksComponent,
    ServicesComponent,
    DescriptionComponent,
    CategoryComponent,
    SubcategoryComponent,
    FinishRequestComponent,
    CardsListComponent,
    ReturnButtonComponent,
    PageTopTitleComponent,
  ],

  providers: [
    EventEmiterService,
    AuthService,
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } },
  ],
})
export class OpenRequestModule {}
