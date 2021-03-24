import { Component, OnInit } from "@angular/core";
import { PostReqService } from "../post-req.service";
import { ApigetService } from "../../apiget.service";
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';


@Component({
  selector: "app-knowledge-article",
  templateUrl: "./knowledge-article.component.html",
  styleUrls: ["./knowledge-article.component.css"],
})
export class KnowledgeArticleComponent implements OnInit {
  knowledgeArticle: string[] = [];
  knowledgeLink: string[] = [];

  constructor(
    private router: Router,
    private postReqService: PostReqService,
    private apiGetService: ApigetService,
    public dialogRef: MatDialogRef<KnowledgeArticleComponent>
  ) { }

  ngOnInit(): void {
    let categoryId: string;
    categoryId = this.postReqService.isIncident
      ? this.postReqService.categoryId.split(":")[1]
      : this.postReqService.categoryId;
    if (!categoryId) {
      categoryId = this.postReqService.categoryId;
    }
    this.apiGetService
      .getCategoryDescription(categoryId)
      .subscribe((res: any) => {
        console.log(res);
        this.knowledgeArticle = res.collection_pcat.pcat
          ? res.collection_pcat.pcat.description.split(' ')
          : null;
      });
  }

  getKnowledgeLink() {
    this.knowledgeLink = this.knowledgeArticle.filter((article: string) => article.startsWith("http"));
    return this.knowledgeLink[0];

  }

  closeDialog() {
    this.dialogRef.close();
  }
  
  homepageNav() {
    this.dialogRef.close();
    this.router.navigate(['/']);
  }
}



