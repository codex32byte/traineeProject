import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogAdminPanel } from './blog-admin-panel';

describe('BlogAdminPanel', () => {
  let component: BlogAdminPanel;
  let fixture: ComponentFixture<BlogAdminPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogAdminPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogAdminPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
