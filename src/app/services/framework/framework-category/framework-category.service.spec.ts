import { TestBed } from '@angular/core/testing';

import { FrameworkCategoryService } from './framework-category.service';

describe('FrameworkCategoryService', () => {
  let service: FrameworkCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FrameworkCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
