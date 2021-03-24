import { TestBed } from '@angular/core/testing';

import { SpecPlaceService } from './spec-place.service';

describe('SpecPlaceService', () => {
  let service: SpecPlaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpecPlaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
