import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimesCommunityPageComponent } from './animes-community-page.component';

describe('AnimesCommunityPageComponent', () => {
  let component: AnimesCommunityPageComponent;
  let fixture: ComponentFixture<AnimesCommunityPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnimesCommunityPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimesCommunityPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
