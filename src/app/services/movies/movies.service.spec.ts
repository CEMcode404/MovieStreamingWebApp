import { TestBed } from '@angular/core/testing';
import { Movie, MoviesService } from './movies.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import movies from '../../../assets/mock-data/movies.json';

describe('MoviesService', () => {
  let service: MoviesService;
  let httpMock: HttpTestingController;
  const moviesDataFilePath = 'assets/mock-data/movies.json';
  const filters = ['action', 'sci-fi'];
  const title = 'inception';
  const movieDataSample = movies.slice(0, 10);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(MoviesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  function lowercaseAndTrim(input: string): string;
  function lowercaseAndTrim(input: string[]): string[];
  function lowercaseAndTrim(input: string | string[]): string | string[] {
    if (typeof input === 'string') return input.trim().toLowerCase();
    else if (Array.isArray(input))
      return input.map((str) => lowercaseAndTrim(str));
    else throw Error('input must be string or string array');
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMovies', () => {
    it('should use GET action', () => {
      service.getMovies();

      const req = httpMock.expectOne(moviesDataFilePath);
      expect(req.request.method).toBe('GET');
      req.flush(movieDataSample);
    });

    it('should throw an error if fetching movies failed', async () => {
      const response = service.getMovies();

      httpMock
        .expectOne(moviesDataFilePath)
        .flush(null, { status: 404, statusText: 'Not Found' });

      try {
        await response;
      } catch (error) {
        expect(error).toMatch('Failed to get movies');
      }
    });

    it('should return random movies if there is no argument', async () => {
      const response = service.getMovies({});

      httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

      expect((await response).length).toBeGreaterThan(0);
    });

    it('should return random movies if first argument is a single empty object', async () => {
      const response = service.getMovies({});

      httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

      expect((await response).length).toBeGreaterThan(0);
    });

    describe('by title', () => {
      it('should return random movies if title field is empty', async () => {
        const response = service.getMovies({ title: '' });

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        expect((await response).length).toBeGreaterThan(0);
      });

      it('should return movies containing the search string', async () => {
        const response = service.getMovies({ title });

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        (await response).forEach((movie) => {
          expect(lowercaseAndTrim(movie.title)).toContain(title);
        });
      });
    });

    describe('by filters', () => {
      it('should return random movies if filter field is empty array', async () => {
        const response = service.getMovies({ filters: [] });

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        expect((await response).length).toBeGreaterThan(0);
      });

      it('should return movies that match the filter', async () => {
        const filters = ['action'];
        const response = service.getMovies({ filters });

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        (await response).forEach((movie) => {
          filters.forEach((filter) => {
            expect(
              lowercaseAndTrim(movie.filters).includes(lowercaseAndTrim(filter))
            ).toBeTruthy();
          });
        });
      });

      it('should return movies that match the filters', async () => {
        const response = service.getMovies({ filters });

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        (await response).forEach((movie) => {
          filters.forEach((filter) => {
            expect(
              lowercaseAndTrim(movie.filters).includes(lowercaseAndTrim(filter))
            ).toBeTruthy();
          });
        });
      });
    });

    describe('by title and filters', () => {
      it('should return random movies if both field is empty', async () => {
        const response = service.getMovies({ title: '', filters: [] });

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        expect((await response).length).toBeGreaterThan(0);
      });

      it('should return movies that match the title if title is filled and filter is empty', async () => {
        const response = service.getMovies({ title, filters: [] });

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        (await response).forEach((movie) => {
          expect(lowercaseAndTrim(movie.title)).toContain(title);
        });
      });

      it('should return movies that match the filters if filter is filled and title is empty', async () => {
        const response = service.getMovies({ title: '', filters });

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        (await response).forEach((movie) => {
          filters.forEach((filter) => {
            expect(
              lowercaseAndTrim(movie.filters).includes(lowercaseAndTrim(filter))
            ).toBeTruthy();
          });
        });
      });

      it('should return movies that match both filters and the title', async () => {
        const response = service.getMovies({ title, filters });

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        (await response).forEach((movie) => {
          filters.forEach((filter) => {
            expect(
              lowercaseAndTrim(movie.filters).includes(lowercaseAndTrim(filter))
            ).toBeTruthy();
          });
        });

        (await response).forEach((movie) => {
          expect(lowercaseAndTrim(movie.title)).toContain(title);
        });
      });
    });

    describe('with limit', () => {
      it('should return number of movies less than or equal the limit if only limit field is filled', async () => {
        const limit = 1;
        const response = service.getMovies({ limit });

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        expect((await response).length).toBeLessThanOrEqual(limit);
      });

      it('should return number of movies less than or equal the default limit minus offset if only offset field is filled', async () => {
        const defaultLimit = 10;
        const offset = 3;
        const response = service.getMovies({ offset });

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        expect((await response).length).toBeLessThanOrEqual(defaultLimit);
      });

      it('should return number of movies less than or equal the limit minus offset if both field is filled', async () => {
        const limit = 10;
        const offset = 3;
        const response = service.getMovies({ offset, limit });

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        expect((await response).length).toBeLessThanOrEqual(limit);
      });

      it('should apply absolute property to input to fix negative number input and have the same results as if the input is positive', async () => {
        const limit = -10;
        const offset = -3;
        const toBeExectedNumberOfMovies = Math.abs(limit);
        const response = service.getMovies({ offset, limit });

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        expect((await response).length).toBeLessThanOrEqual(
          toBeExectedNumberOfMovies
        );
      });
    });

    describe('by using 3 arguments', () => {
      it('should behave as if quering by title, by filters or both and with limit, with offset or both', async () => {
        const limit = 5;
        const offset = 0;
        const response = service.getMovies(
          { title, filters },
          { limit, offset }
        );

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        (await response).forEach((movie) => {
          filters.forEach((filter) => {
            expect(
              lowercaseAndTrim(movie.filters).includes(lowercaseAndTrim(filter))
            ).toBeTruthy();
          });
        });

        (await response).forEach((movie) => {
          expect(lowercaseAndTrim(movie.title)).toContain(title);
        });

        expect((await response).length).toBeLessThanOrEqual(limit - offset);
      });

      it('should behave as if querying by title only, by filters, or both if second parameter is an empty object', async () => {
        const response = service.getMovies({ title, filters }, {});

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        (await response).forEach((movie) => {
          filters.forEach((filter) => {
            expect(
              lowercaseAndTrim(movie.filters).includes(lowercaseAndTrim(filter))
            ).toBeTruthy();
          });
        });

        (await response).forEach((movie) => {
          expect(lowercaseAndTrim(movie.title)).toContain(title);
        });
      });

      it('should behave as if querying with limit, width offset, or both if first parameter is an empty object', async () => {
        const limit = 5;
        const offset = 0;
        const response = service.getMovies({}, { limit, offset });

        httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

        expect((await response).length).toBeLessThanOrEqual(limit - offset);
      });
    });
  });

  describe('getMoviesWithFilter', () => {
    it('should throw an error if fetching movies failed', async () => {
      const response = service.getMoviesWithFilter([]);

      httpMock
        .expectOne(moviesDataFilePath)
        .flush(null, { status: 404, statusText: 'Not Found' });

      try {
        await response;
      } catch (error) {
        expect(error).toMatch('Failed to get movies');
      }
    });

    it('should return movies even if filter is empty', async () => {
      const response = service.getMoviesWithFilter([]);

      httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

      expect((await response).length).toBeGreaterThan(0);
    });

    it('should return movies that match the filters provided', async () => {
      const response = service.getMoviesWithFilter(filters);

      httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

      (await response).forEach((movie) => {
        filters.forEach((filter) => {
          expect(
            lowercaseAndTrim(movie.filters).includes(lowercaseAndTrim(filter))
          ).toBeTruthy();
        });
      });
    });

    it('should return movies that match the options and filters provided', async () => {
      const limit = 10;
      const offset = 3;
      const response = service.getMoviesWithFilter(filters, { limit, offset });

      httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

      (await response).forEach((movie) => {
        filters.forEach((filter) => {
          expect(
            lowercaseAndTrim(movie.filters).includes(lowercaseAndTrim(filter))
          ).toBeTruthy();
        });
      });

      expect((await response).length).toBeLessThanOrEqual(limit - offset);
    });
  });

  describe('getMoviesWithTitle', () => {
    it('should throw an error if fetching movies failed', async () => {
      const response = service.getMoviesWithTitle(title);

      httpMock
        .expectOne(moviesDataFilePath)
        .flush(null, { status: 404, statusText: 'Not Found' });

      try {
        await response;
      } catch (error) {
        expect(error).toMatch('Failed to get movies');
      }
    });

    it('should return movies that match provided title', async () => {
      const response = service.getMoviesWithTitle(title);

      httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

      (await response).forEach((movie) => {
        expect(lowercaseAndTrim(movie.title)).toContain(title);
      });
    });

    it('should return movies that match the title and options provided', async () => {
      const limit = 5;
      const offset = 0;
      const response = service.getMoviesWithTitle(title, { limit, offset });

      httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

      (await response).forEach((movie) => {
        expect(lowercaseAndTrim(movie.title)).toContain(title);
      });

      expect((await response).length).toBeLessThanOrEqual(limit - offset);
    });
  });

  describe('getMovieWithId', () => {
    const id = movieDataSample[0].isan;
    it('should throw an error if fetching movies failed', async () => {
      const response = service.getMovieWithId(id);

      httpMock
        .expectOne(moviesDataFilePath)
        .flush(null, { status: 404, statusText: 'Not Found' });

      try {
        await response;
      } catch (error) {
        expect(error).toMatch('Failed to get movies');
      }
    });

    it('should return movie that strictly (case sensitive) match the id', async () => {
      const response = service.getMovieWithId(id.toLowerCase());

      httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

      expect(await response).toBeNull();
    });

    it('should return null if id is empty string', async () => {
      const response = service.getMovieWithId('');

      expect(await response).toBeNull();
    });

    it('should return a movie that match the id', async () => {
      const response = service.getMovieWithId(id);

      httpMock.expectOne(moviesDataFilePath).flush(movieDataSample);

      expect(((await response) as Movie).isan).toBe(id);
    });
  });
});
