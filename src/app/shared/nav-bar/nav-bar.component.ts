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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Movie, MoviesService } from '../../services/movies/movies.service';
import { LogService } from '../../services/log/log.service';

interface NavItem {
  name: string;
  path: string;
}

@Component({
  selector: 'nav-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
  searchSuggestions: Movie[] = [];
  isMenuOpen = false;
  currentRoute = '';
  isBurgerMenuMode = false;
  isSuggestionsHidden = true;
  private resize$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  inputControl = new FormControl('');

  @ViewChild('nav', { static: false }) myElementRef!: ElementRef;

  constructor(
    private movieService: MoviesService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {
    this.inputControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((value) => {
        const trimmedInput = value?.trim();
        if (!trimmedInput) this.isSuggestionsHidden = true;
        else this.onSearch(trimmedInput);
      });
  }

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

  private async onSearch(input: string) {
    try {
      this.searchSuggestions = await this.movieService.getMoviesWithTitle(
        input
      );
      this.isSuggestionsHidden = false;
    } catch (error) {
      LogService.error(error);
    }
  }

  onBlur(e: FocusEvent) {
    const clickedElement = e.relatedTarget as HTMLElement;

    if (
      !clickedElement ||
      !clickedElement.classList.contains('movie-suggestion')
    )
      this.isSuggestionsHidden = true;
  }

  onSelectMovie() {
    this.isSuggestionsHidden = true;
  }
}
