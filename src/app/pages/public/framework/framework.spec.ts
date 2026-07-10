import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Framework } from './framework';

describe('Framework', () => {
  let component: Framework;
  let fixture: ComponentFixture<Framework>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Framework],
    }).compileComponents();

    fixture = TestBed.createComponent(Framework);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
