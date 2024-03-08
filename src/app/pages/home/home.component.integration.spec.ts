import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HomeComponent } from './home.component';
import { By } from '@angular/platform-browser';
import { MovieFilterComponent } from './movie-filter/movie-filter.component';
import { LogService } from '../../services/log/log.service';
import { MoviesService } from '../../services/movies/movies.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let moviesServiceMock: jasmine.SpyObj<MoviesService>;

  beforeEach(async () => {
    moviesServiceMock = jasmine.createSpyObj('MoviesService', [
      'getMoviesWithFilter',
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

  it('should call onFilterChange on filter click', () => {
    const movieFilterComponent = fixture.debugElement.query(
      By.directive(MovieFilterComponent)
    ).componentInstance;
    const onFilterChange = spyOn(component, 'onFilterChange');

    movieFilterComponent.onFilterChange.emit();

    expect(onFilterChange).toHaveBeenCalled();
  });

  it('should handle error if onFilterChange failed to get movies', () => {
    const logServiceError = spyOn(LogService, 'error');

    moviesServiceMock.getMoviesWithFilter.and.throwError(new Error());
    const movieFilterComponent = fixture.debugElement.query(
      By.directive(MovieFilterComponent)
    ).componentInstance;
    movieFilterComponent.onFilterChange.emit();

    expect(logServiceError).toHaveBeenCalled();
  });
});
