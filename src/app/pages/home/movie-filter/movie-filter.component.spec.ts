import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MovieFilterComponent } from './movie-filter.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FiltersService } from '../../../services/filters/filters.service';
import filters from '../../../../assets/mock-data/movieGenres.json';
import { By } from '@angular/platform-browser';
import { LogService } from '../../../services/log/log.service';

describe('MovieFilterComponent', () => {
  let component: MovieFilterComponent;
  let fixture: ComponentFixture<MovieFilterComponent>;
  let filterServiceMock: jasmine.SpyObj<FiltersService>;

  beforeEach(async () => {
    filterServiceMock = jasmine.createSpyObj('FiltersService', [
      'getFilters',
      'getInviewFilters',
      'getDefaultActiveFilters',
    ]);

    await TestBed.configureTestingModule({
      imports: [MovieFilterComponent, HttpClientTestingModule],
      providers: [{ provide: FiltersService, useValue: filterServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should fetch filters on initialization', () => {
      filterServiceMock.getFilters.and.returnValue(Promise.resolve(filters));
      component.ngOnInit();
      fixture.destroy();

      expect(filterServiceMock.getFilters).toHaveBeenCalled();
    });

    it('should handle error thrown while getting filters on initialization', () => {
      const logServiceError = spyOn(LogService, 'error');

      filterServiceMock.getFilters.and.throwError(new Error());
      component.ngOnInit();
      fixture.destroy();

      expect(logServiceError).toHaveBeenCalled();
    });

    it('should emit FilterChangeEvent on initializaton', () => {
      const onFilterChange = spyOn(component.onFilterChange, 'emit');

      component.ngAfterViewInit();

      expect(onFilterChange).toHaveBeenCalled();
    });
  });

  describe('toggleFilterActiveState method', () => {
    beforeEach(() => {
      filterServiceMock.getFilters.and.returnValue(Promise.resolve(filters));
      filterServiceMock.getInviewFilters.and.returnValue(['Adventure']);
      component.ngOnInit();
    });

    it('should emit filterChangeEvent', () => {
      const onFilterChange = spyOn(component.onFilterChange, 'emit');

      component.toggleFilterActiveState('Action');

      expect(onFilterChange).toHaveBeenCalled();
    });

    describe('in Inview Filters', () => {
      it('should add selected-filter class for the click filter', waitForAsync(() => {
        fixture.whenStable().then(() => {
          fixture.detectChanges();

          const inviewFilter = fixture.debugElement.query(
            By.css('.inview-filter:last-child')
          );

          (inviewFilter.nativeElement as HTMLElement).dispatchEvent(
            new Event('click')
          );
          fixture.detectChanges();

          expect(
            fixture.debugElement.query(By.css('.inview-filter:last-child'))
              .nativeElement
          ).toHaveClass('selected-filter');
        });
      }));

      it('should remove selected-filter class for the click filter if active', waitForAsync(() => {
        fixture.whenStable().then(() => {
          fixture.detectChanges();

          const inviewFilter = fixture.debugElement.query(
            By.css('.inview-filter:last-child')
          );

          (inviewFilter.nativeElement as HTMLElement).dispatchEvent(
            new Event('click')
          );
          (inviewFilter.nativeElement as HTMLElement).dispatchEvent(
            new Event('click')
          );
          fixture.detectChanges();

          expect(
            fixture.debugElement.query(By.css('.inview-filter:last-child'))
              .nativeElement
          ).not.toHaveClass('selected-filter');
        });
      }));
    });

    describe('in Menu Filters', () => {
      it('should add selected-filter class for the click filter', waitForAsync(() => {
        fixture.whenStable().then(() => {
          fixture.detectChanges();

          const menuFilter = fixture.debugElement.query(
            By.css('.menu-content div:last-child')
          );
          (menuFilter.nativeElement as HTMLElement).dispatchEvent(
            new Event('click')
          );

          fixture.detectChanges();

          expect(
            fixture.debugElement.query(By.css('.menu-content div:last-child'))
              .nativeElement
          ).toHaveClass('selected-filter');
        });
      }));

      it('should remove selected-filter class for the click filter if active', waitForAsync(() => {
        fixture.whenStable().then(() => {
          fixture.detectChanges();

          const menuFilter = fixture.debugElement.query(
            By.css('.menu-content div:last-child')
          );
          (menuFilter.nativeElement as HTMLElement).dispatchEvent(
            new Event('click')
          );
          (menuFilter.nativeElement as HTMLElement).dispatchEvent(
            new Event('click')
          );
          fixture.detectChanges();

          expect(
            fixture.debugElement.query(By.css('.menu-content div:last-child'))
              .nativeElement
          ).not.toHaveClass('selected-filter');
        });
      }));

      it('should display the close icon at the right of the filter if active', waitForAsync(() => {
        component.toggleFilterMenu();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          const menuFilter = fixture.debugElement.query(
            By.css('.menu-content div:last-child')
          );
          (menuFilter.nativeElement as HTMLElement).dispatchEvent(
            new Event('click')
          );
          fixture.detectChanges();

          const closeIcon = fixture.debugElement.query(By.css('.close-icon'));

          expect(closeIcon).not.toBeNull();
        });
      }));

      it('should hide the close icon at the right of the filter if inactive', waitForAsync(() => {
        component.toggleFilterMenu();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          const menuFilter = fixture.debugElement.query(
            By.css('.menu-content div:last-child')
          );
          (menuFilter.nativeElement as HTMLElement).dispatchEvent(
            new Event('click')
          );
          (menuFilter.nativeElement as HTMLElement).dispatchEvent(
            new Event('click')
          );
          fixture.detectChanges();

          const closeIcon = fixture.debugElement.query(By.css('.close-icon'));

          expect(closeIcon).toBeNull();
        });
      }));
    });

    it('should display clicked filter name in tags section', waitForAsync(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();

        const inviewFilter = fixture.debugElement.query(
          By.css('.inview-filter:last-child')
        );
        (inviewFilter.nativeElement as HTMLElement).dispatchEvent(
          new Event('click')
        );

        fixture.detectChanges();
        const tag = fixture.debugElement.query(By.css('.tag:last-child'));

        expect(tag.nativeElement.textContent).toMatch('Adventure');
      });
    }));

    it('should remove clicked filter name in tags section', waitForAsync(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();

        const inviewFilter = fixture.debugElement.query(
          By.css('.inview-filter:last-child')
        );
        (inviewFilter.nativeElement as HTMLElement).dispatchEvent(
          new Event('click')
        );
        (inviewFilter.nativeElement as HTMLElement).dispatchEvent(
          new Event('click')
        );

        fixture.detectChanges();
        const tag = fixture.debugElement.query(By.css('.tag:last-child'));

        expect(tag).toBeNull();
      });
    }));
  });

  describe('toggleFilterMenu method', () => {
    it('should toggle filter menu to hidden if it is visible', () => {
      component.toggleFilterMenu();
      component.toggleFilterMenu();
      fixture.detectChanges();

      const dropdownMenu = fixture.debugElement.query(
        By.css('.dropdown-menu')
      ).nativeElement;

      expect(isHidden(dropdownMenu)).toBeTruthy();
    });

    function isHidden(element: HTMLElement) {
      return parseInt(getComputedStyle(element).height.replace('px', '')) === 0;
    }

    it('should toggle filter menu visible if it is hidden', () => {
      component.toggleFilterMenu();
      fixture.detectChanges();

      const dropdownMenu = fixture.debugElement.query(
        By.css('.dropdown-menu')
      ).nativeElement;

      expect(isHidden(dropdownMenu)).toBeFalsy();
    });
  });

  it('clearFilterMenu should make all active filter to inactive', waitForAsync(() => {
    filterServiceMock.getFilters.and.returnValue(Promise.resolve(filters));
    filterServiceMock.getDefaultActiveFilters.and.returnValue([
      'Adventure',
      'Action',
    ]);

    component.ngOnInit();
    fixture.whenStable().then(() => {
      fixture.detectChanges();

      component.clearActiveFilter();
      fixture.detectChanges();

      const activeFilters = fixture.debugElement.queryAll(
        By.css('.selected-filter')
      ).length;

      expect(activeFilters).toBe(0);
      expect(component.activeFilters.length).toBe(0);
    });
  }));

  it('window resize should trigger onResize ', () => {
    const onResize = spyOn(component, 'onResize');

    window.dispatchEvent(new Event('resize'));

    expect(onResize).toHaveBeenCalled();
  });
});
