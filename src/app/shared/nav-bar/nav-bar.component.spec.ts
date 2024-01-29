import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { NavBarComponent } from './nav-bar.component';

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it("should initialize the selectedNavItem to the 'home' if the url is empty or ''", () => {
    expect(component.selectedNavItem).toBe('home');
  });

  describe('toggleMenu function', () => {
    it('should toggle isMenuOpen to false if isMenuOpen is false', () => {
      component.toggleMenu();

      expect(component.isMenuOpen).toBeTruthy();
    });

    it('should toggle isMenuOpen to true if isMenuOpen is false', () => {
      component.toggleMenu();
      component.toggleMenu();

      expect(component.isMenuOpen).toBeFalsy();
    });
  });
});
