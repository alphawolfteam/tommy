import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LehavaUserComponent } from './lehava-user.component';

describe('LehavaUserComponent', () => {
  let component: LehavaUserComponent;
  let fixture: ComponentFixture<LehavaUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LehavaUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LehavaUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
