import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { HeroComponent } from './hero.component';
import { HeroesService } from '../../../services/heroes/heroes.service';
import heroes from '../../../../assets/mock-data/heroes.json';
import { By } from '@angular/platform-browser';
import { LogService } from '../../../services/log/log.service';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;
  let heroesServiceMock: jasmine.SpyObj<HeroesService>;

  beforeEach(async () => {
    heroesServiceMock = jasmine.createSpyObj('HeroService', ['getHeroes']);

    await TestBed.configureTestingModule({
      imports: [HeroComponent, HttpClientTestingModule],
      providers: [{ provide: HeroesService, useValue: heroesServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch data on component initialization', () => {
    heroesServiceMock.getHeroes.and.returnValue(Promise.resolve(heroes));

    component.ngOnInit();

    expect(heroesServiceMock.getHeroes).toHaveBeenCalled();
  });

  it('should handle thrown error if fetchng heroes fail on component initialization', () => {
    const logServiceError = spyOn(LogService, 'error');

    heroesServiceMock.getHeroes.and.throwError(new Error());
    component.ngOnInit();

    expect(logServiceError).toHaveBeenCalled();
  });

  describe('Hero Rotation Functionality', () => {
    const defaultInterval = 5000;

    beforeEach(() => {
      component.heroes = heroes;
      fixture.detectChanges();
    });

    it('startHeroRotation should slide hero images at specific intervals', fakeAsync(() => {
      component.startHeroRotation(defaultInterval);
      tick(defaultInterval);
      component.stopHeroRotation();

      expect(isChildFullyContained(getHeroSlider(), getHero(2))).toBeTruthy();
    }));

    function isChildFullyContained(
      parentElement: HTMLElement,
      childElement: HTMLElement
    ): boolean {
      const parentRect = parentElement.getBoundingClientRect();
      const childRect = childElement.getBoundingClientRect();

      return (
        childRect.top >= parentRect.top &&
        childRect.left >= parentRect.left &&
        childRect.bottom <= parentRect.bottom &&
        childRect.right <= parentRect.right
      );
    }

    function getHeroSlider() {
      return fixture.debugElement.query(By.css('.hero')).nativeElement;
    }

    function getHero(number: number) {
      return fixture.debugElement.queryAll(By.css('.hero-img-container'))[
        number - 1
      ].nativeElement;
    }

    it('stopHeroRotation should stop hero images slide', fakeAsync(() => {
      component.startHeroRotation(defaultInterval);
      component.stopHeroRotation();
      tick(defaultInterval);

      expect(isChildFullyContained(getHeroSlider(), getHero(2))).toBeFalsy();
    }));

    it('radio button click should slide to a specific corresponding hero', () => {
      const secondRadioBttn = fixture.debugElement.queryAll(
        By.css('input[type=radio]')
      )[1].nativeElement;

      secondRadioBttn.dispatchEvent(new Event('click'));

      expect(isChildFullyContained(getHeroSlider(), getHero(2))).toBeTruthy();
    });
  });

  describe('Hero Rotation Start Behavior', () => {
    let startHeroRotation: jasmine.Spy<(speed: number) => void>;
    beforeEach(() => {
      startHeroRotation = spyOn(component, 'startHeroRotation');
    });

    it('should start on component initialization', () => {
      heroesServiceMock.getHeroes.and.returnValue(Promise.resolve(heroes));
      component.ngOnInit();

      expect(startHeroRotation).toHaveBeenCalled();
    });

    it('should start mouseleave', () => {
      fixture.debugElement
        .query(By.css('.hero'))
        .triggerEventHandler('mouseleave');

      expect(startHeroRotation).toHaveBeenCalled();
    });
  });

  describe('Hero Rotation Stop Behavior', () => {
    let stopHeroRotation: jasmine.Spy<() => void>;
    beforeEach(() => {
      stopHeroRotation = spyOn(component, 'stopHeroRotation');
    });
    it('shold stop on component destruction', () => {
      component.ngOnDestroy();

      expect(stopHeroRotation).toHaveBeenCalled();
    });

    it('should stop on mouseenter', () => {
      fixture.debugElement
        .query(By.css('.hero'))
        .triggerEventHandler('mouseenter');

      expect(stopHeroRotation).toHaveBeenCalled();
    });
  });
});
