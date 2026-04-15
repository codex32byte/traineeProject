import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkSection } from './work-section';

describe('WorkSection', () => {
  let component: WorkSection;
  let fixture: ComponentFixture<WorkSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkSection],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
