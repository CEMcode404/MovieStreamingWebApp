import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoviesComponent } from './movies.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { LogService } from '../../services/log/log.service';
import { Movie, MoviesService } from '../../services/movies/movies.service';
import movies from '../../../assets/mock-data/movies.json';
import { Router } from '@angular/router';

describe('MoviesComponent', () => {
  let component: MoviesComponent;
  let fixture: ComponentFixture<MoviesComponent>;
  let moviesServiceMock: jasmine.SpyObj<MoviesService>;
  let activatedRouteStub: jasmine.SpyObj<ActivatedRoute>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    moviesServiceMock = jasmine.createSpyObj('MoviesService', [
      'getMovieWithId',
    ]);
    activatedRouteStub = jasmine.createSpyObj('ActivatedRoute', ['subscribe']);
    router = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [MoviesComponent, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: MoviesService, useValue: moviesServiceMock },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MoviesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const movieSampleData = movies[0] as Movie;

  describe('onQueryParamsChange method', () => {
    const validId = movies[0].isan;

    it('should handle error if failed to get movies', async () => {
      moviesServiceMock.getMovieWithId.and.returnValue(
        Promise.resolve(movieSampleData)
      );
      const logServiceError = spyOn(LogService, 'error');
      logServiceError.and.callFake((error) => {
        expect(error).toMatch('Failed to get movies.');
      });
      moviesServiceMock.getMovieWithId.and.throwError(new Error());

      await component.onQueryParamsChange({ id: validId });

      expect(logServiceError).toHaveBeenCalled();
      expect(router.navigateByUrl);
    });

    it('shouldn handle error if query params is empty', async () => {
      moviesServiceMock.getMovieWithId.and.returnValue(
        Promise.resolve(movieSampleData)
      );
      const logServiceError = spyOn(LogService, 'error');
      logServiceError.and.callFake((error) => {
        expect(error).toMatch('guard is malfunctioning');
      });

      await component.onQueryParamsChange({ id: '' });

      expect(logServiceError).toHaveBeenCalled();
      expect(router.navigateByUrl);
    });

    it('should handle error movie returned is null', async () => {
      const logServiceError = spyOn(LogService, 'error');
      logServiceError.and.callFake((error) => {
        expect(error).toMatch('is missing');
      });

      await component.onQueryParamsChange({ id: 'idNotFoundInDB' });

      expect(logServiceError).toHaveBeenCalled();
      expect(router.navigateByUrl);
    });

    it('should set movies if query params is not empty', async () => {
      moviesServiceMock.getMovieWithId.and.returnValue(
        Promise.resolve(movieSampleData)
      );

      expect(component.movie).toBeUndefined();
      await component.onQueryParamsChange({ id: validId });

      expect(component.movie).not.toBeUndefined();
    });

    it('should set selectedQuality if query params is not empty', async () => {
      moviesServiceMock.getMovieWithId.and.returnValue(
        Promise.resolve(movieSampleData)
      );

      expect(component.selectedQuality).toBeUndefined();
      await component.onQueryParamsChange({ id: validId });

      expect(component.selectedQuality).not.toBeUndefined();
    });
  });
});
