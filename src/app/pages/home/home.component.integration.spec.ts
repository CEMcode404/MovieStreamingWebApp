import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HomeComponent } from './home.component';
import { By } from '@angular/platform-browser';
import { MovieFilterComponent } from './movie-filter/movie-filter.component';
import { LogService } from '../../services/log/log.service';
import { MoviesService } from '../../services/movies/movies.service';
import movies from '../../../assets/mock-data/movies.json';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let moviesServiceMock: jasmine.SpyObj<MoviesService>;

  beforeEach(async () => {
    moviesServiceMock = jasmine.createSpyObj('MoviesService', [
      'getMoviesWithFilter',
      'getMoviesCountWithFilter',
    ]);

    await TestBed.configureTestingModule({
      imports: [HomeComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } },
        },
        { provide: MoviesService, useValue: moviesServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onFilterChange method', () => {
    it('should be called FilterChangeEvent emission', () => {
      const movieFilterComponent = fixture.debugElement.query(
        By.directive(MovieFilterComponent)
      ).componentInstance;
      const onFilterChange = spyOn(component, 'onFilterChange');

      movieFilterComponent.onFilterChange.emit();

      expect(onFilterChange).toHaveBeenCalled();
    });

    it('should handle error if failed to get movies', async () => {
      const logServiceError = spyOn(LogService, 'error');

      moviesServiceMock.getMoviesWithFilter.and.throwError(new Error());
      await component.onFilterChange({
        activeFilters: [],
        changedFilterName: '',
      });

      expect(logServiceError).toHaveBeenCalled();
    });

    it('should set movies', async () => {
      const moviesDataSample = movies.slice(0, 1);

      moviesServiceMock.getMoviesWithFilter.and.returnValue(
        Promise.resolve(moviesDataSample)
      );
      await component.onFilterChange({
        activeFilters: [],
        changedFilterName: '',
      });

      expect(moviesDataSample[0].title).toMatch(component.movies[0].title);
    });

    it('should handle error if failed to get movies count', async () => {
      const logServiceError = spyOn(LogService, 'error');

      moviesServiceMock.getMoviesCountWithFilter.and.throwError(new Error());
      await component.onFilterChange({
        activeFilters: [],
        changedFilterName: '',
      });

      expect(logServiceError).toHaveBeenCalled();
    });

    it('should set/reset totalPages', async () => {
      const expectedTotalPages = Math.ceil(
        movies.length / component.maxMoviesPerPage
      );

      moviesServiceMock.getMoviesCountWithFilter.and.returnValue(
        Promise.resolve(movies.length)
      );
      moviesServiceMock.getMoviesWithFilter.and.returnValue(
        Promise.resolve(movies)
      );
      await component.onFilterChange({
        activeFilters: [],
        changedFilterName: '',
      });

      expect(component.totalPages).toBe(expectedTotalPages);
    });

    it('should reset currentPage to first page', async () => {
      await component.onFilterChange({
        activeFilters: [],
        changedFilterName: '',
      });

      expect(component.currentPage).toBe(1);
    });
  });

  describe('onPageChange method', () => {
    const pageNumber = 3;

    it('should be called PageChangeEvent emission', () => {
      const paginationComponent = fixture.debugElement.query(
        By.directive(PaginationComponent)
      ).componentInstance;
      const onPageChange = spyOn(component, 'onPageChange');

      paginationComponent.onPageChange.emit();

      expect(onPageChange).toHaveBeenCalled();
    });

    it('should handle error if failed to get movies', async () => {
      const logServiceError = spyOn(LogService, 'error');

      moviesServiceMock.getMoviesWithFilter.and.throwError(new Error());
      await component.onPageChange(pageNumber);

      expect(logServiceError).toHaveBeenCalled();
    });

    it('should set movies', async () => {
      const moviesDataSample = movies.slice(0, 1);

      moviesServiceMock.getMoviesWithFilter.and.returnValue(
        Promise.resolve(moviesDataSample)
      );
      await component.onPageChange(pageNumber);

      expect(moviesDataSample[0].title).toMatch(component.movies[0].title);
    });

    it('should set the currentPage', async () => {
      await component.onPageChange(pageNumber);

      expect(component.currentPage).toBe(pageNumber);
    });
  });
});
