import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class HiChatService {
  openHiChat: boolean = false;
  hiChatSubject = new Subject<boolean>();
  groupUrl: any ='';
  groupUrlSubject = new Subject<string>();
  
  constructor(private sanitizer: DomSanitizer) { }
  
  public setHiChatStatus() {
    this.openHiChat = true;
    this.hiChatSubject.next(this.openHiChat);
  }
  
  public setGroupUrl(url: string) {
    this.groupUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url)
    this.groupUrlSubject.next(this.groupUrl);
  }

  

}
