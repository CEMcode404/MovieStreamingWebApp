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

  it('getFilters should fetch filters from the server', async () => {
    const response = service.getFilters();

    httpMock.expectOne('assets/mock-data/movieGenres.json').flush(filters);

    expect(await response).toEqual(filters);
  });

  it('getFilters should throw error if fetching filters failed', async () => {
    const response = service.getFilters();

    httpMock
      .expectOne('assets/mock-data/movieGenres.json')
      .flush(null, { status: 404, statusText: 'Failed to get filters.' });

    try {
      await response;
    } catch (error) {
      expect((error as Error).message).toMatch('Failed');
    }
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
