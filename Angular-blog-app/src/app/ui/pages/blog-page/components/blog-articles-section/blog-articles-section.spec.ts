import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogArticlesSection } from './blog-articles-section';

describe('BlogArticlesSection', () => {
  let component: BlogArticlesSection;
  let fixture: ComponentFixture<BlogArticlesSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogArticlesSection],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogArticlesSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
