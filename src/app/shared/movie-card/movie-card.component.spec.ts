import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MovieCardComponent } from './movie-card.component';
import { By } from '@angular/platform-browser';
import { Movie } from '../../services/movies/movies.service';

describe('MovieCardComponent', () => {
  let component: MovieCardComponent;
  let fixture: ComponentFixture<MovieCardComponent>;
  const movie = { imgSrc: '', title: 'Godzilla: King of the Monsters' };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCardComponent);
    component = fixture.componentInstance;
    component.movieCardData = movie as Movie;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    const marginOfError = 100;
    const defaultDebounceTime = 200 + marginOfError;

    afterEach(() => {
      fixture.destroy();
    });

    it('should set isTitleOverflowing to truthy on initialization if title is overflowing', fakeAsync(() => {
      fixture.debugElement.query(By.css('article')).styles['width'] = '5px';

      component.ngAfterViewInit();
      tick(defaultDebounceTime);
      fixture.detectChanges();

      expect(component.isTitleOverflowing).toBeTruthy();
    }));

    it('should set isTitleOverflowing to falsy on initialization if the title is contained', fakeAsync(() => {
      fixture.debugElement.query(By.css('article')).styles['width'] = '750px';

      component.ngAfterViewInit();
      tick(defaultDebounceTime);
      fixture.detectChanges();

      expect(component.isTitleOverflowing).toBeFalsy();
    }));
  });

  describe('Title Continuation Dots', () => {
    const continuationDotsClass = '.title-continuation-dots';

    it('should show ". . ." at the end of the title if the title is overflowing', () => {
      component.isTitleOverflowing = true;
      fixture.detectChanges();

      const continuationDots = getComputedStyle(
        fixture.debugElement.query(By.css(continuationDotsClass)).nativeElement
      ).display;

      expect(continuationDots).toBe('block');
    });

    it('should hide ". . ." at the end of the title if the title is not overflowing', () => {
      component.isTitleOverflowing = false;
      fixture.detectChanges();

      const continuationDots = getComputedStyle(
        fixture.debugElement.query(By.css(continuationDotsClass)).nativeElement
      ).display;

      expect(continuationDots).toBe('none');
    });
  });

  describe('Custom Attributes', () => {
    it('should set the custom data-blur attribute to true if the title is overflowing', () => {
      component.isTitleOverflowing = true;
      fixture.detectChanges();

      const customBlurAttribute = fixture.debugElement
        .query(By.css('a'))
        .nativeElement.getAttribute('data-blur');

      expect(customBlurAttribute).toBeTruthy();
    });

    it('should set the custom data-blur attribute false to false if the title is not overflowing', () => {
      component.isTitleOverflowing = false;
      fixture.detectChanges();

      const customBlurAttribute = fixture.debugElement
        .query(By.css('a'))
        .nativeElement.getAttribute('data-blur');

      expect(customBlurAttribute).toMatch(
        component.isTitleOverflowing.toString()
      );
    });
  });

  it('should trigger onResize on window resize', () => {
    const onResize = spyOn(component, 'onResize');

    window.dispatchEvent(new Event('resize'));

    expect(onResize).toHaveBeenCalled();
  });
});
