import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { debounceTime, Subject, takeUntil } from 'rxjs';

interface NavItem {
  name: string;
  path: string;
}

@Component({
  selector: 'nav-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent implements AfterViewInit, OnInit, OnDestroy {
  navItems: NavItem[] = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
  ];
  isMenuOpen = false;
  currentRoute = '';
  isBurgerMenuMode = false;
  private resize$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  @ViewChild('nav', { static: false }) myElementRef!: ElementRef;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.currentRoute = this.getCurrentRoute();

    this.resize$
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => {
        this.determineNavBarMode();
      });
  }

  getCurrentRoute() {
    return this.router.url;
  }

  private determineNavBarMode(): void {
    this.isContentFitWithinParentWidth(
      this.myElementRef.nativeElement,
      this.myElementRef.nativeElement.querySelector('.nav-links-container')
    )
      ? this.disableBurgerMenuMode()
      : this.enableBurgerMenuMode();
  }

  enableBurgerMenuMode() {
    this.isBurgerMenuMode = true;
  }

  disableBurgerMenuMode() {
    this.isBurgerMenuMode = false;
  }

  private isContentFitWithinParentWidth(
    parentElement: HTMLElement,
    childElement: HTMLElement
  ): boolean | void {
    let paddingRight: number;
    paddingRight = parseInt(
      getComputedStyle(parentElement)
        .getPropertyValue('padding-right')
        .replace('px', '')
    );
    return parentElement.offsetWidth - paddingRight > childElement.scrollWidth;
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) this.determineNavBarMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onResize(): void {
    this.resize$.next();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
