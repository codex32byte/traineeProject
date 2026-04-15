import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogStatsModal } from './blog-stats-modal';

describe('BlogStatsModal', () => {
  let component: BlogStatsModal;
  let fixture: ComponentFixture<BlogStatsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogStatsModal],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogStatsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
