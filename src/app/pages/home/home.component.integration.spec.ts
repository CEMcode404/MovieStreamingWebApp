import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HomeComponent } from './home.component';
import { By } from '@angular/platform-browser';
import { MovieFilterComponent } from './movie-filter/movie-filter.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } },
        },
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
});
