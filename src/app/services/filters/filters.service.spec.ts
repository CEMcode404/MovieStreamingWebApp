import { TestBed } from '@angular/core/testing';
import { FiltersService } from './filters.service';
import filters from '../../../assets/mock-data/movieGenres.json';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('FiltersService', () => {
  let service: FiltersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(FiltersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getFilters should fetch filters from the server', () => {
    service.getFilters((response) => {
      expect(response).toEqual(filters);
    });

    const req = httpMock.expectOne('assets/mock-data/movieGenres.json');
    expect(req.request.method).toBe('GET');
    req.flush(filters);
  });

  it('getDefaultActiveFilters should return an array of strings', () => {
    const activeFilters = service.getDefaultActiveFilters();

    expect(Array.isArray(activeFilters)).toBeTruthy();
    expect(
      activeFilters.every((filter) => typeof filter === 'string')
    ).toBeTruthy();
  });

  it('getInviewFilters should return an array of strings', () => {
    const inviewFilters = service.getInviewFilters();

    expect(Array.isArray(inviewFilters)).toBeTruthy();
    expect(
      inviewFilters.every((filter) => typeof filter === 'string')
    ).toBeTruthy();
  });
});
