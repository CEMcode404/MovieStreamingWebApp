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

  it('should fetch heroes from the server', async () => {
    const response = service.getHeroes();

    httpMock.expectOne('assets/mock-data/heroes.json').flush(heroes);

    expect(await response).toEqual(heroes);
  });

  it('should throw error if failed to fetch heroes', async () => {
    const response = service.getHeroes();

    httpMock
      .expectOne('assets/mock-data/heroes.json')
      .flush(null, { status: 404, statusText: 'Failed to get heroes.' });

    try {
      await response;
    } catch (error) {
      expect((error as Error).message).toMatch('Failed');
    }
  });
});
