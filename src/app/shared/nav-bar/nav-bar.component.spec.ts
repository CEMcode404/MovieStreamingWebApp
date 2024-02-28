import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { NavBarComponent } from './nav-bar.component';
import { By } from '@angular/platform-browser';

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavBarComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({}) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const burgerMenuClass = '.burger-menu-wrapper';
  const dropdownLinksClass = '.nav-links-container--dropdown';

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
        .query(By.css(burgerMenuClass))
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
      const horizontalLinks = fixture.debugElement.queryAll(
        By.css('a:not(.burger-menu-nav-items)')
      );

      component.enableBurgerMenuMode();
      fixture.detectChanges();

      for (let horizontalLink of horizontalLinks)
        expect(getComputedStyle(horizontalLink.nativeElement).visibility).toBe(
          'hidden'
        );
    });

    it('normal mode should show the horizontal navigational links', () => {
      const horizontalLinks = fixture.debugElement.queryAll(
        By.css('a:not(.burger-menu-nav-items)')
      );

      component.disableBurgerMenuMode();
      fixture.detectChanges();

      for (let horizontalLink of horizontalLinks)
        expect(getComputedStyle(horizontalLink.nativeElement).visibility).toBe(
          'visible'
        );
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
});
