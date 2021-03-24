import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: "app-knowledge-article",
  templateUrl: "./knowledge-article.component.html",
  styleUrls: ["./knowledge-article.component.css"],
})
export class KnowledgeArticleComponent implements OnInit{
  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<KnowledgeArticleComponent>,
    @Inject(MAT_DIALOG_DATA) public knowledgeLink: string
  ) { }
  
  ngOnInit(): void {
    console.log(this.knowledgeLink);
  }

  getKnowledgeLink() {
    return this.knowledgeLink;
  }

  closeDialog() {
    this.dialogRef.close();
  }
  
  homepageNav() {
    this.dialogRef.close();
    this.router.navigate(['/']);
  }
}



