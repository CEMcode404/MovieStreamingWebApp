import { TestBed } from '@angular/core/testing';
import { HeroesService } from './heroes.service';
import heroes from '../../../assets/mock-data/heroes.json';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('MoviesService', () => {
  let service: HeroesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(HeroesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch heroes from the server', () => {
    service.getHeroes((response) => {
      expect(response).toEqual(heroes);
    });

    const req = httpMock.expectOne('assets/mock-data/heroes.json');
    expect(req.request.method).toBe('GET');
    req.flush(heroes);
  });
});
