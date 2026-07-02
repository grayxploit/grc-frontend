import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlType } from './control-type';

describe('ControlType', () => {
  let component: ControlType;
  let fixture: ComponentFixture<ControlType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlType],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
