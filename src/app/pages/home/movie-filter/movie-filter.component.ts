import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { FiltersService } from '../../../services/filters/filters.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { LogService } from '../../../services/log/log.service';

export interface FilterChangeEvent {
  activeFilters: string[];
  changedFilterName: string;
}

@Component({
  selector: 'movie-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-filter.component.html',
  styleUrl: './movie-filter.component.scss',
})
export class MovieFilterComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('movieFilter', { static: false }) myElementRef!: ElementRef;
  @Output() onFilterChange = new EventEmitter<FilterChangeEvent>();

  isFilterMenuHidden = true;
  private _filters = new Filters([]);
  private _destroy$ = new Subject<void>();
  private _resize$ = new Subject<void>();

  constructor(
    private filterService: FiltersService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  get filters(): Filter[] {
    return Filters.sortFilterTypes(this._filters.filters);
  }

  get inviewFilters(): Filter[] {
    return Filters.sortFilterTypes(this._filters.inviewFilters);
  }

  get activeFilters(): string[] {
    return this._filters.activeFilters.sort();
  }

  async ngOnInit(): Promise<void> {
    this._resize$
      .pipe(debounceTime(200), takeUntil(this._destroy$))
      .subscribe(() => {
        this.hideOverflowingInviewFilter();
        if (
          this._filters.inviewFilters.length -
            this._filters.hiddenFilters.length <
          2
        )
          this._filters.setFilterHidden(this.filterService.getInviewFilters());
      });

    try {
      this._filters = new Filters(await this.filterService.getFilters());
      this._filters.setInviewFilter(this.filterService.getInviewFilters());
      this._filters.toggleFilterActiveState(
        this.filterService.getDefaultActiveFilters()
      );
    } catch (error) {
      LogService.error(error);
    }
  }

  private hideOverflowingInviewFilter() {
    const inViewFilterElements =
      this.myElementRef.nativeElement.querySelectorAll('.inview-filter');

    for (let element of inViewFilterElements) {
      if (!this.isElementInView(this.myElementRef.nativeElement, element))
        this._filters.setFilterHidden(element.textContent.trim());
      else this._filters.setFilterVisible(element.textContent.trim());
    }
  }

  private isElementInView(
    parentElement: HTMLElement,
    childElement: HTMLElement
  ): boolean {
    const parentRect = parentElement.getBoundingClientRect();
    const childRect = childElement.getBoundingClientRect();

    const isInView =
      childRect.top >= parentRect.top &&
      childRect.left >= parentRect.left &&
      childRect.bottom <= parentRect.bottom &&
      childRect.right <= parentRect.right;

    return isInView;
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) this.hideOverflowingInviewFilter();

    this.onFilterChange.emit({
      activeFilters: this._filters.activeFilters,
      changedFilterName: '',
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  toggleFilterActiveState(filterName: string) {
    this._filters.toggleFilterActiveState(filterName);

    this.onFilterChange.emit({
      activeFilters: this._filters.activeFilters,
      changedFilterName: filterName,
    });
  }

  toggleFilterMenu(): void {
    this.isFilterMenuHidden = !this.isFilterMenuHidden;
  }

  clearActiveFilter(): void {
    this._filters.clearActiveFilters();

    this.onFilterChange.emit({
      activeFilters: this._filters.activeFilters,
      changedFilterName: '',
    });
  }

  onResize() {
    this._resize$.next();
  }
}

type Filter = { name: string; isActive: boolean; isHidden: boolean };
class Filters {
  private _activeFilters = new Set<string>();
  private _inviewFilter = new Set<string>();
  private _hiddenFilter = new Set<string>();
  private _filters: Set<string>;
  constructor(filters: string[]) {
    this._filters = new Set<string>(filters);
  }

  get activeFilters(): string[] {
    return [...this._activeFilters];
  }

  get hiddenFilters(): string[] {
    return [...this._hiddenFilter];
  }

  get inviewFilters(): Filter[] {
    return [...this._inviewFilter].map((filter) => ({
      name: filter,
      isActive: this._activeFilters.has(filter),
      isHidden: this._hiddenFilter.has(filter),
    }));
  }

  get filters(): Filter[] {
    return [...this._filters].map((filter) => ({
      name: filter,
      isActive: this._activeFilters.has(filter),
      isHidden: this._hiddenFilter.has(filter),
    }));
  }

  static sortFilterTypes(filters: Filter[]) {
    return filters.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }

  toggleFilterActiveState(filterName: string): void;
  toggleFilterActiveState(filterName: string[]): void;
  toggleFilterActiveState(filterName: string | string[]): void {
    if (typeof filterName === 'string' && this._filters.has(filterName))
      this._activeFilters.has(filterName)
        ? this._activeFilters.delete(filterName)
        : this._activeFilters.add(filterName);
    else if (Array.isArray(filterName))
      filterName.forEach((filterName) => {
        this.toggleFilterActiveState(filterName);
      });
  }

  clearActiveFilters(): void {
    this._activeFilters.clear();
  }

  setFilterHidden(filterName: string): void;
  setFilterHidden(filterName: string[]): void;
  setFilterHidden(filterName: string | string[]): void {
    if (typeof filterName === 'string' && this._filters.has(filterName))
      this._hiddenFilter.add(filterName);
    else if (Array.isArray(filterName))
      filterName.forEach((filterName) => {
        this.setFilterHidden(filterName);
      });
  }

  setFilterVisible(filterName: string): void;
  setFilterVisible(filterName: string[]): void;
  setFilterVisible(filterName: string | string[]): void {
    if (typeof filterName === 'string' && this._filters.has(filterName))
      this._hiddenFilter.delete(filterName);
    else if (Array.isArray(filterName))
      filterName.forEach((filterName) => {
        this.setFilterVisible(filterName);
      });
  }

  setInviewFilter(filterName: string): void;
  setInviewFilter(filterName: string[]): void;
  setInviewFilter(filterName: string | string[]): void {
    if (typeof filterName === 'string' && this._filters.has(filterName))
      this._inviewFilter.add(filterName);
    else if (Array.isArray(filterName))
      filterName.forEach((filterName) => {
        this.setInviewFilter(filterName);
      });
  }

  removeInviewFilter(filterName: string): void {
    if (typeof filterName === 'string') this._inviewFilter.delete(filterName);
  }
}
