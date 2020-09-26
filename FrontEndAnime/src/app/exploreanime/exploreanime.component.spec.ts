import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreanimeComponent } from './exploreanime.component';

describe('ExploreanimeComponent', () => {
  let component: ExploreanimeComponent;
  let fixture: ComponentFixture<ExploreanimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreanimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreanimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
