import { TestBed } from '@angular/core/testing';

import { ControlTypeService } from './control-type.service';

describe('ControlTypeService', () => {
  let service: ControlTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ControlTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
