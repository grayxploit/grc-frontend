import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateControl } from './create-control';

describe('CreateControl', () => {
  let component: CreateControl;
  let fixture: ComponentFixture<CreateControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateControl],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateControl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
