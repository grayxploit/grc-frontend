import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Industry } from './industry';

describe('Industry', () => {
  let component: Industry;
  let fixture: ComponentFixture<Industry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Industry],
    }).compileComponents();

    fixture = TestBed.createComponent(Industry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
