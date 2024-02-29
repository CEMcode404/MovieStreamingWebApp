import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
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
    private changeDetector: ChangeDetectorRef
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
    this.isContentOverflowing(
      this.myElementRef.nativeElement.querySelector('.horizontal-links')
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
  //continue this, refactor tests, scss clean up
  private isContentOverflowing(element: HTMLElement): boolean | void {
    return element.offsetWidth >= element.scrollWidth;
  }

  ngAfterViewInit(): void {
    this.determineNavBarMode();
    this.changeDetector.detectChanges();
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
