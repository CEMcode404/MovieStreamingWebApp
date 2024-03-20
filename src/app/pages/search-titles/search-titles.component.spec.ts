import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { SearchTitlesComponent } from './search-titles.component';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { Movie, MoviesService } from '../../services/movies/movies.service';
import { LogService } from '../../services/log/log.service';
import movies from '../../../assets/mock-data/movies.json';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { By } from '@angular/platform-browser';

describe('SearchTitlesComponent', () => {
  let component: SearchTitlesComponent;
  let fixture: ComponentFixture<SearchTitlesComponent>;
  let moviesServiceMock: jasmine.SpyObj<MoviesService>;

  const activatedRouteStub = {
    queryParams: new BehaviorSubject<any>({}),
  };

  beforeEach(async () => {
    moviesServiceMock = jasmine.createSpyObj('MoviesService', [
      'getMoviesWithTitle',
      'getMoviesCountWithTitle',
    ]);

    await TestBed.configureTestingModule({
      imports: [SearchTitlesComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub,
        },
        { provide: MoviesService, useValue: moviesServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchTitlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const pageNumber = 3;
  const moviesDataSample = movies.slice(0, 5) as Movie[];
  describe('onQueryParamsChange method', () => {
    const searchTitle = 'random';
    it('should handle error if failed to get movies', async () => {
      const logServiceError = spyOn(LogService, 'error');

      moviesServiceMock.getMoviesWithTitle.and.throwError(new Error());
      await component.onQueryParamsChange({ searchTitle });

      expect(logServiceError).toHaveBeenCalled();
    });

    it("shouldn't set movies if query params is empty", async () => {
      moviesServiceMock.getMoviesWithTitle.and.returnValue(
        Promise.resolve(moviesDataSample)
      );

      expect(component.movieData.length).toBe(0);
      await component.onQueryParamsChange({ searchTitle: '' });

      expect(component.movieData.length).toBe(0);
    });

    it('should set movies if query params is not empty', async () => {
      moviesServiceMock.getMoviesWithTitle.and.returnValue(
        Promise.resolve(moviesDataSample)
      );

      expect(component.movieData.length).toBe(0);
      await component.onQueryParamsChange({ searchTitle });

      expect(component.movieData.length).toBe(moviesDataSample.length);
    });

    it('should handle error if failed to get movies count', async () => {
      const logServiceError = spyOn(LogService, 'error');

      moviesServiceMock.getMoviesCountWithTitle.and.throwError(new Error());
      await component.onQueryParamsChange({ searchTitle });

      expect(logServiceError).toHaveBeenCalled();
    });

    it("shouldn't set totalPages if query params is empty", async () => {
      moviesServiceMock.getMoviesCountWithTitle.and.returnValue(
        Promise.resolve(movies.length)
      );

      expect(component.totalPages).toBe(0);
      await component.onQueryParamsChange({ searchTitle: '' });

      expect(component.totalPages).toBe(0);
    });

    it('should set/reset totalPages if query params is filled', async () => {
      moviesServiceMock.getMoviesCountWithTitle.and.returnValue(
        Promise.resolve(movies.length)
      );
      const expectedTotalPages = Math.ceil(
        movies.length / component.maxMoviesPerPage
      );

      expect(component.totalPages).toBe(0);
      await component.onQueryParamsChange({ searchTitle });

      expect(component.totalPages).toBe(expectedTotalPages);
    });

    it('should reset currentPage to first page query params is filled', async () => {
      await component.onPageChange(pageNumber);
      expect(component.currentPage).toBe(pageNumber);

      await component.onQueryParamsChange({ searchTitle });
      expect(component.currentPage).toBe(1);
    });

    it('should set searchTitle if query params is filled', async () => {
      expect(component.searchTitle).toBeUndefined();
      await component.onQueryParamsChange({ searchTitle });

      expect(component.searchTitle).toBe(searchTitle);
    });
  });

  describe('onPageChange method', () => {
    it('should be called on PageChangeEvent emission', () => {
      const paginationComponent = fixture.debugElement.query(
        By.directive(PaginationComponent)
      ).componentInstance;
      const onPageChange = spyOn(component, 'onPageChange');

      paginationComponent.onPageChange.emit();

      expect(onPageChange).toHaveBeenCalled();
    });

    it('should handle error if failed to get movies', async () => {
      const logServiceError = spyOn(LogService, 'error');

      moviesServiceMock.getMoviesWithTitle.and.throwError(new Error());
      await component.onPageChange(pageNumber);

      expect(logServiceError).toHaveBeenCalled();
    });

    it('should set movies', async () => {
      moviesServiceMock.getMoviesWithTitle.and.returnValue(
        Promise.resolve(moviesDataSample)
      );

      expect(component.movieData.length).toBe(0);
      await component.onPageChange(pageNumber);

      expect(component.movieData.length).toBe(moviesDataSample.length);
    });

    it('should set the currentPage', async () => {
      await component.onPageChange(pageNumber);
      expect(component.currentPage).toBe(pageNumber);
    });
  });

  describe('no movie found notice', () => {
    it('should render if movies is less than one', () => {
      component.movieData = [];
      fixture.detectChanges();

      const noMovieNotice = fixture.debugElement.query(
        By.css('.not-found-container')
      );

      expect(noMovieNotice).not.toBeNull();
    });

    it('should not render if movies is more than zero', () => {
      component.movieData = moviesDataSample;
      fixture.detectChanges();

      const noMovieNotice = fixture.debugElement.query(
        By.css('.not-found-container')
      );
      expect(noMovieNotice).toBeNull();
    });
  });
});
