import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportControl } from './import-control';

describe('ImportControl', () => {
  let component: ImportControl;
  let fixture: ComponentFixture<ImportControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportControl],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportControl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
