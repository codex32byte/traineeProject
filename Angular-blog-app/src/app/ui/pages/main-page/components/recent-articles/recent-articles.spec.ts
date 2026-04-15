import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentArticles } from './recent-articles';

describe('RecentArticles', () => {
  let component: RecentArticles;
  let fixture: ComponentFixture<RecentArticles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentArticles],
    }).compileComponents();

    fixture = TestBed.createComponent(RecentArticles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
