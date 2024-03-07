import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { NavBarComponent } from './nav-bar.component';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LogService } from '../../services/log/log.service';
import { MoviesService } from '../../services/movies/movies.service';
import movies from '../../../assets/mock-data/movies.json';
import { DebugElement } from '@angular/core';

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;
  let moviesServiceMock: jasmine.SpyObj<MoviesService>;

  beforeEach(async () => {
    moviesServiceMock = jasmine.createSpyObj('MoviesService', [
      'getMoviesWithTitle',
    ]);

    await TestBed.configureTestingModule({
      imports: [NavBarComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } },
        },
        {
          provide: MoviesService,
          useValue: moviesServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const burgerMenuClass = '.burger-menu-wrapper';
  const horizontalLinksClass = '.horizontal-links';
  const dropdownLinksClass = '.burger-menu-dropdown';

  describe('Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set the current active link that match the current browser path', () => {
      component.ngOnInit();
      fixture.detectChanges();

      fixture.debugElement
        .queryAll(By.css(`a[href='${component.getCurrentRoute()}']`))
        .forEach((link) => {
          expect(
            (link.nativeElement as HTMLElement).classList.contains('active')
          ).toBeTruthy();
        });
    });

    it('should set the navbar mode on initialization ', () => {
      const enableBurgerMenuMode = spyOn(component, 'enableBurgerMenuMode');
      const disableBurgerMenuMode = spyOn(component, 'disableBurgerMenuMode');

      component.ngAfterViewInit();
      fixture.detectChanges();

      const isEitherFunctionCalledButNotBoth =
        enableBurgerMenuMode.calls.count() +
          disableBurgerMenuMode.calls.count() ===
        1;

      expect(isEitherFunctionCalledButNotBoth).toBeTruthy();
    });
  });

  describe('Dropdown Menu Behavior', () => {
    it('toggleMenu should open the dropdown menu', () => {
      component.enableBurgerMenuMode();
      component.toggleMenu();
      fixture.detectChanges();

      const dropdownMenu = fixture.debugElement.query(
        By.css(dropdownLinksClass)
      ).nativeElement;
      const dropdownMenuHeight = getComputedStyle(dropdownMenu).height.replace(
        'px',
        ''
      );

      expect(dropdownMenuHeight).toBeGreaterThan(0);
    });

    it('toggleMenu should close the dropdown menu', () => {
      component.enableBurgerMenuMode();
      component.toggleMenu();
      component.toggleMenu();
      fixture.detectChanges();

      const dropdownMenu = fixture.debugElement.query(
        By.css(dropdownLinksClass)
      ).nativeElement;
      const dropdownMenuHeight = parseInt(
        getComputedStyle(dropdownMenu).height.replace('px', '')
      );

      expect(dropdownMenuHeight).toBe(0);
    });

    it('burger menu click should call toggleMenu function', () => {
      const toggleMenu = spyOn(component, 'toggleMenu');

      fixture.debugElement
        .query(By.css('.burger-menu-bttn'))
        .triggerEventHandler('click');

      expect(toggleMenu).toHaveBeenCalled();
    });
  });

  describe('Resize Behavior', () => {
    it('onResize should trigger on window resize', () => {
      const onResize = spyOn(component, 'onResize');

      window.dispatchEvent(new Event('resize'));

      expect(onResize).toHaveBeenCalled();
    });
  });

  describe('Navbar Modes', () => {
    it('burger menu mode should show the burger menu', () => {
      const burgerMenu = fixture.debugElement.query(
        By.css(burgerMenuClass)
      ).nativeElement;

      component.enableBurgerMenuMode();
      fixture.detectChanges();

      expect(getComputedStyle(burgerMenu).display).toBe('block');
    });

    it('burger menu mode should hide the horizontal navigational links', () => {
      const horizontalLinks = fixture.debugElement.query(
        By.css(horizontalLinksClass)
      ).nativeElement;

      component.enableBurgerMenuMode();
      fixture.detectChanges();

      expect(getComputedStyle(horizontalLinks).visibility).toBe('hidden');
    });

    it('normal mode should show the horizontal navigational links', () => {
      const horizontalLinks = fixture.debugElement.query(
        By.css(horizontalLinksClass)
      ).nativeElement;

      component.disableBurgerMenuMode();
      fixture.detectChanges();

      expect(getComputedStyle(horizontalLinks).visibility).toBe('visible');
    });

    it('normal menu mode should hide the burger menu', () => {
      const burgerMenu = fixture.debugElement.query(
        By.css(burgerMenuClass)
      ).nativeElement;

      component.disableBurgerMenuMode();
      fixture.detectChanges();

      expect(getComputedStyle(burgerMenu).display).toBe('none');
    });
  });

  describe('search bar', () => {
    const input = 'inception';

    it('should invoke LogService.error if fetching movies throws an error', fakeAsync(() => {
      const logServiceError = spyOn(LogService, 'error');
      logServiceError.and.callFake(() => {});
      moviesServiceMock.getMoviesWithTitle.and.throwError(new Error());

      setSearchBarValue(input, fixture.debugElement.query(By.css('input')));

      expect(logServiceError).toHaveBeenCalled();
    }));

    function setSearchBarValue(value: string, inputElement: DebugElement) {
      const onChangeDebounceTime = 300;

      inputElement.nativeElement.value = value;
      inputElement.triggerEventHandler('input', {
        target: inputElement.nativeElement,
      });
      tick(onChangeDebounceTime);
      fixture.detectChanges();
    }

    it("shouldn't invoke LogService.error if fetching movies succeded", fakeAsync(() => {
      const logServiceError = spyOn(LogService, 'error');
      moviesServiceMock.getMoviesWithTitle.and.returnValue(
        Promise.resolve(movies)
      );

      setSearchBarValue(input, fixture.debugElement.query(By.css('input')));

      expect(logServiceError).not.toHaveBeenCalled();
    }));

    it('should not render suggestions visible if if there is problem in fetching movies', fakeAsync(() => {
      const logServiceError = spyOn(LogService, 'error');
      logServiceError.and.callFake(() => {});
      moviesServiceMock.getMoviesWithTitle.and.throwError(new Error());

      setSearchBarValue(input, fixture.debugElement.query(By.css('input')));

      expect(getSearchSuggestionsVisibility()).toMatch('hidden');
    }));

    function getSearchSuggestionsVisibility(): string {
      return getComputedStyle(
        fixture.debugElement.query(By.css('.search-suggestion')).nativeElement
      ).visibility;
    }

    it("should display 'not found message' if search result is less than one", fakeAsync(() => {
      moviesServiceMock.getMoviesWithTitle.and.returnValue(Promise.resolve([]));

      setSearchBarValue(input, fixture.debugElement.query(By.css('input')));
      const notFoundElement = fixture.debugElement.query(By.css('.not-found'));

      expect(notFoundElement).not.toBeNull();
    }));

    it("shouldn't display 'not found message' if search result is more than zero", fakeAsync(() => {
      moviesServiceMock.getMoviesWithTitle.and.returnValue(
        Promise.resolve(movies)
      );

      setSearchBarValue(input, fixture.debugElement.query(By.css('input')));
      const notFoundElement = fixture.debugElement.query(By.css('.not-found'));

      expect(notFoundElement).toBeNull();
    }));

    it('should call onSelectMovie if a suggested movie title is click', () => {
      const onSelectMovie = spyOn(component, 'onSelectMovie');
      component.searchSuggestions = movies;
      component.isSuggestionsHidden = false;

      fixture.detectChanges();
      fixture.debugElement
        .query(By.css('.movie-suggestion'))
        .triggerEventHandler('click');

      expect(onSelectMovie).toHaveBeenCalled();
    });

    it('should hide movie suggestions onblur', () => {
      component.searchSuggestions = movies;
      component.isSuggestionsHidden = false;

      fixture.detectChanges();
      fixture.debugElement.query(By.css('input')).triggerEventHandler('blur', {
        target: fixture.debugElement.query(By.css('.brand-logo')).nativeElement,
      });
      fixture.detectChanges();

      expect(getSearchSuggestionsVisibility()).toMatch('hidden');
    });

    it('should hide movie suggestions if input is empty', fakeAsync(() => {
      const inputElement = fixture.debugElement.query(By.css('input'));
      moviesServiceMock.getMoviesWithTitle.and.returnValue(
        Promise.resolve(movies)
      );

      setSearchBarValue(input, inputElement);
      expect(getSearchSuggestionsVisibility()).toMatch('visible');
      setSearchBarValue('', inputElement);

      expect(getSearchSuggestionsVisibility()).toMatch('hidden');
    }));

    it('should show movie suggestions if input is filled', fakeAsync(() => {
      moviesServiceMock.getMoviesWithTitle.and.returnValue(
        Promise.resolve(movies)
      );

      setSearchBarValue(input, fixture.debugElement.query(By.css('input')));

      expect(getSearchSuggestionsVisibility()).toMatch('visible');
    }));
  });
});
