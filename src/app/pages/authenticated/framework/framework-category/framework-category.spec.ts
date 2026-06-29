import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameworkCategory } from './framework-category';

describe('FrameworkCategory', () => {
  let component: FrameworkCategory;
  let fixture: ComponentFixture<FrameworkCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrameworkCategory],
    }).compileComponents();

    fixture = TestBed.createComponent(FrameworkCategory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
