import { TestBed } from '@angular/core/testing';

import { ApiAryService } from './api-ary.service';

describe('ApiAryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApiAryService = TestBed.get(ApiAryService);
    expect(service).toBeTruthy();
  });
});
