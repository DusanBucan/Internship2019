import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyanimeComponent } from './myanime.component';

describe('MyanimeComponent', () => {
  let component: MyanimeComponent;
  let fixture: ComponentFixture<MyanimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyanimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyanimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
