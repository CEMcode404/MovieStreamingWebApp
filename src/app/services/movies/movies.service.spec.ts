import { TestBed } from '@angular/core/testing';
import { MoviesService } from './movies.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import movies from '../../../assets/mock-data/movies.json';

describe('MoviesService', () => {
  let service: MoviesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(MoviesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch movies from the server', () => {
    service.getMovies((response) => {
      expect(response).toEqual(movies);
    });

    const req = httpMock.expectOne('assets/mock-data/movies.json');
    expect(req.request.method).toBe('GET');
    req.flush(movies);
  });
});
