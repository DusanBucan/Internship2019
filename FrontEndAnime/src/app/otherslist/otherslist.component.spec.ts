import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherslistComponent } from './otherslist.component';

describe('OtherslistComponent', () => {
  let component: OtherslistComponent;
  let fixture: ComponentFixture<OtherslistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherslistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
