import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HobbyProjects } from './hobby-projects';

describe('HobbyProjects', () => {
  let component: HobbyProjects;
  let fixture: ComponentFixture<HobbyProjects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HobbyProjects],
    }).compileComponents();

    fixture = TestBed.createComponent(HobbyProjects);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
